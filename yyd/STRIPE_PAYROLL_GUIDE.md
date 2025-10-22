# 💰 Guia: Pagamento de Funcionários via Stripe

## 📋 **RESUMO EXECUTIVO**

**✅ SIM, é possível pagar funcionários usando Stripe!**

Mas o Stripe **NÃO é um sistema de folha de pagamento (payroll)**. Ele oferece a **infraestrutura de transferência de dinheiro** através da **Stripe Payouts API**.

---

## 🎯 **O QUE VOCÊ PODE FAZER:**

### ✅ **Stripe Payouts API** - Transferências Bancárias

Enviar dinheiro do seu saldo Stripe diretamente para contas bancárias de funcionários/freelancers.

**Ideal para:**
- Pagamento de freelancers/contractors
- Bônus e comissões
- Reembolsos
- Pagamentos pontuais

**O que Stripe FAZ:**
- ✅ Transfere dinheiro para conta bancária
- ✅ Suporta múltiplas moedas (EUR, USD, GBP, etc.)
- ✅ Rastreamento de status (pending → paid → failed)
- ✅ Histórico de transações
- ✅ Webhook notifications

**O que Stripe NÃO FAZ:**
- ❌ Cálculo de impostos/contribuições (IRS, Segurança Social)
- ❌ Geração de recibos oficiais
- ❌ Relatórios fiscais automáticos
- ❌ Cálculo de férias/subsídios
- ❌ Compliance trabalhista

---

## 💡 **OPÇÕES DE IMPLEMENTAÇÃO**

### **Opção 1: Stripe Payouts API (Recomendado para Contractors)**

**Como funciona:**
1. Funcionário cadastra conta bancária (IBAN para Portugal)
2. Sistema calcula salário líquido (você faz o cálculo)
3. Sistema cria Payout via Stripe API
4. Stripe transfere para conta do funcionário
5. Demora 2-3 dias úteis para chegar

**Custos:**
- **0.25%** do valor (máximo €5 por transação)
- Exemplo: Salário de €1.500 = €3,75 de taxa

---

### **Opção 2: Stripe Connect** (Para Plataformas)

Se você quer criar uma plataforma onde motoristas/guias recebem automaticamente:

**Como funciona:**
1. Cada guia cria conta Stripe Connect
2. Quando booking é confirmado, valor vai para guia automaticamente
3. Guia faz saque quando quiser
4. Payouts instantâneos disponíveis (30 minutos, taxa de 1.5%)

---

## 🛠️ **IMPLEMENTAÇÃO TÉCNICA**

### **Passo 1: Adicionar Dados Bancários ao Modelo Employee**

Primeiro, precisamos armazenar as informações bancárias dos funcionários.

**Adicionar ao Schema (Drizzle):**

```typescript
// shared/schema.ts

export const employees = pgTable('employees', {
  // ... campos existentes ...
  
  // Dados bancários para payroll
  bankAccountName: varchar('bank_account_name'),
  bankAccountIBAN: varchar('bank_account_iban'),
  bankAccountBIC: varchar('bank_account_bic'),
  bankAccountBank: varchar('bank_account_bank'),
  
  // Controle de pagamentos
  paymentMethod: varchar('payment_method').default('bank_transfer'), // stripe_payout, bank_transfer, cash
  lastPayoutId: varchar('last_payout_id'), // ID do último payout Stripe
  lastPayoutDate: timestamp('last_payout_date'),
});
```

---

### **Passo 2: Criar API Route para Stripe Payout**

**Arquivo:** `yyd/apps/backoffice/app/api/payroll/payout/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { requireResourceAccess } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    requireResourceAccess(request, 'payroll');
    
    const { payrollId } = await request.json();
    
    // Buscar payroll
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        employee: true,
      },
    });
    
    if (!payroll) {
      return NextResponse.json({ error: 'Payroll não encontrado' }, { status: 404 });
    }
    
    if (payroll.status !== 'pending') {
      return NextResponse.json({ error: 'Payroll já foi processado' }, { status: 400 });
    }
    
    // Verificar dados bancários
    if (!payroll.employee.bankAccountIBAN) {
      return NextResponse.json({ 
        error: 'Funcionário não tem conta bancária cadastrada' 
      }, { status: 400 });
    }
    
    // Criar Payout via Stripe
    const payout = await stripe.payouts.create({
      amount: Math.round(payroll.netPay * 100), // Converter para centavos
      currency: 'eur',
      description: `Salário ${payroll.employee.name} - ${payroll.period}`,
      metadata: {
        payroll_id: payrollId,
        employee_id: payroll.employeeId,
        period: payroll.period,
        employee_name: payroll.employee.name,
      },
    });
    
    // Atualizar payroll
    await prisma.payroll.update({
      where: { id: payrollId },
      data: {
        status: 'paid',
        paidAt: new Date(),
        stripePayoutId: payout.id,
        paymentMethod: 'stripe_payout',
      },
    });
    
    // Atualizar employee
    await prisma.employee.update({
      where: { id: payroll.employeeId },
      data: {
        lastPayoutId: payout.id,
        lastPayoutDate: new Date(),
      },
    });
    
    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amount: payout.amount / 100,
        status: payout.status,
        arrival_date: payout.arrival_date,
      },
    });
    
  } catch (error: any) {
    console.error('Payout error:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro ao processar pagamento' 
    }, { status: 500 });
  }
}
```

---

### **Passo 3: Adicionar Botão "Pagar via Stripe" no Frontend**

Na tela de Payroll, adicionar botão para processar pagamento:

```typescript
async function payViaStripe(payrollId: string) {
  try {
    const res = await fetch('/api/payroll/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payrollId }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      alert(`Erro: ${data.error}`);
      return;
    }
    
    alert(`✅ Pagamento processado!\nID: ${data.payout.id}\nChega em: ${data.payout.arrival_date} dias`);
    
    // Recarregar lista de payrolls
    loadPayrolls();
  } catch (error) {
    alert('Erro ao processar pagamento');
  }
}
```

---

## 📊 **FLUXO COMPLETO**

```
1. Criar Payroll no sistema
   ↓
2. Calcular salário líquido (manualmente ou via regras)
   ↓
3. Clicar em "Pagar via Stripe"
   ↓
4. Sistema valida dados bancários
   ↓
5. Cria Payout via Stripe API
   ↓
6. Stripe transfere dinheiro (2-3 dias)
   ↓
7. Webhook confirma chegada do dinheiro
   ↓
8. Sistema marca como "paid"
```

---

## 🔔 **WEBHOOKS (Opcional mas Recomendado)**

Configure webhook para receber notificações quando payout for concluído:

**Eventos importantes:**
- `payout.paid` - Payout chegou na conta do funcionário
- `payout.failed` - Payout falhou (dados bancários inválidos, etc.)
- `payout.canceled` - Payout foi cancelado

**Endpoint:** `/api/webhooks/stripe-payouts`

```typescript
// Exemplo de webhook handler
if (event.type === 'payout.paid') {
  const payout = event.data.object;
  
  await prisma.payroll.updateMany({
    where: { stripePayoutId: payout.id },
    data: { 
      status: 'completed',
      confirmedAt: new Date(),
    },
  });
}
```

---

## ⚠️ **REQUISITOS E LIMITAÇÕES**

### **Requisitos Legais (Portugal):**

1. **Você AINDA precisa:**
   - Calcular IRS e Segurança Social manualmente
   - Emitir recibos de vencimento oficiais
   - Fazer declarações fiscais mensais/anuais
   - Pagar impostos ao Estado separadamente

2. **Stripe é apenas o "banco"** que transfere o dinheiro
   - Não substitui software de contabilidade
   - Não substitui advogado trabalhista
   - Não substitui portal das Finanças

---

### **Limitações Técnicas:**

1. **Saldo Stripe:**
   - Você precisa ter saldo suficiente na conta Stripe
   - Recarregue manualmente ou use Stripe Balance (mantém dinheiro lá)

2. **Tempo de Transferência:**
   - Standard: 2-3 dias úteis
   - Instant Payout: 30 minutos (custo 1.5%, só para cartões de débito)

3. **Dados Bancários:**
   - IBAN válido obrigatório
   - Verificação manual antes do primeiro pagamento

---

## 💰 **CUSTOS**

| Método | Tempo | Custo |
|--------|-------|-------|
| **Standard Payout** | 2-3 dias | 0.25% (máx €5) |
| **Instant Payout** | 30 min | 1.5% (mín €0.50) |
| **International** | 3-5 dias | Varia por país |

**Exemplos:**
- Salário €1.500 (standard): Taxa €3,75
- Salário €1.500 (instant): Taxa €22,50
- Salário €800 (standard): Taxa €2,00

---

## 🎯 **RECOMENDAÇÕES**

### **Para Funcionários Fixos (CLT/Contrato):**

❌ **NÃO use apenas Stripe**
- Use software de folha de pagamento (Sage, Primavera, etc.)
- Stripe pode ser usado como método de transferência bancária
- Mas cálculos e compliance devem ser feitos externamente

### **Para Freelancers/Guias/Contractors:**

✅ **Stripe é IDEAL!**
- Pagamentos rápidos e rastreáveis
- Custos baixos
- Fácil integração
- Cada guia pode receber sua comissão automaticamente

---

## 📝 **PRÓXIMOS PASSOS**

Se você quiser implementar Stripe Payouts para seus guias/freelancers:

1. ✅ Adicionar campos bancários ao modelo Employee
2. ✅ Criar API route `/api/payroll/payout`
3. ✅ Adicionar botão "Pagar via Stripe" na interface
4. ✅ Configurar webhooks para confirmação
5. ✅ Testar com valor pequeno primeiro (€1)
6. ✅ Documentar processo para time financeiro

---

## 🆘 **ALTERNATIVAS MAIS COMPLETAS**

Se você precisa de solução COMPLETA de payroll (com impostos, etc.):

### **Integrações de Payroll:**
- **Sage Portugal** - Software contábil português
- **Primavera** - ERP português com folha de pagamento
- **Moloni** - Faturação + folha de pagamento
- **Check HQ** (internacional) - API de payroll completa

### **Como funcionaria:**
1. Software de payroll calcula tudo (impostos, líquido, etc.)
2. Stripe Payouts faz apenas a transferência bancária
3. Melhor dos dois mundos: compliance + automação

---

## ✅ **CONCLUSÃO**

**Stripe Payouts é excelente para:**
- ✅ Pagar guias/freelancers por tour
- ✅ Comissões e bônus
- ✅ Reembolsos

**Mas NÃO substitui:**
- ❌ Software de contabilidade
- ❌ Sistema de folha de pagamento completo
- ❌ Compliance fiscal

**Recomendação:** Use Stripe como infraestrutura de pagamento, mas mantenha cálculos e compliance em software dedicado (ou planilhas bem feitas + contador).

---

**Quer que eu implemente o sistema de Stripe Payouts no backoffice?** 🚀

# 🧪 Stripe Test Mode para Payouts - Guia Completo

## ✅ **SIM! Você pode testar pagamentos de salários exatamente como testa compras de tours!**

Stripe oferece **números de contas bancárias de teste** para simular payouts (pagamentos para funcionários/guias) sem usar dinheiro real.

---

## 💡 **RESUMO EXECUTIVO**

**Como funciona:**
1. ✅ Use seu saldo de teste Stripe (dinheiro fictício da conta test mode)
2. ✅ Use números de conta bancária **de teste** (não precisa criar contas reais)
3. ✅ Payouts são processados instantaneamente em test mode (vs 2-3 dias em produção)
4. ✅ Não precisa criar "subcontas" - usa números fictícios direto na API

**Diferença de Pagamentos de Tours:**
- **Tours**: Cliente paga → Dinheiro entra no seu saldo Stripe
- **Salários**: Você paga → Dinheiro sai do seu saldo Stripe

---

## 🏦 **CONTAS BANCÁRIAS DE TESTE**

### **Para Portugal/Europa (IBAN):**

Stripe **NÃO documenta** IBANs de teste específicos oficialmente, mas você pode usar:

```
IBAN de teste genérico: GB82 WEST 1234 5698 7654 32
BIC/SWIFT: TESTEFXXXXX
```

**OU** criar IBANs fictícios válidos usando geradores online (somente para test mode).

### **Para USA (Routing + Account Number):**

Estes são os números **oficiais** de teste do Stripe:

| Account Number | Routing Number | Resultado |
|----------------|----------------|-----------|
| `000123456789` | `110000000` | ✅ Payout bem-sucedido |
| `000111111116` | `110000000` | ✅ Payout bem-sucedido |
| `000111111113` | `110000000` | ❌ Payout falha (para testar erro) |

**⚠️ Importante:** Sempre inclua os zeros iniciais! `000123456789` não `123456789`.

---

## 🧪 **TESTANDO PAYOUTS NA PRÁTICA**

### **Opção 1: Via Stripe Dashboard (Manual)**

1. Acesse: https://dashboard.stripe.com/test/balance
2. Verifique seu **Test Balance** (saldo de teste)
3. Se não tiver saldo, faça um pagamento de teste primeiro
4. Clique em **"Payouts"** → **"Create Manual Payout"**
5. Insira:
   - Amount: €100 (ou qualquer valor)
   - Destination: Adicione conta bancária de teste
   - Account Number: `000123456789`
   - Routing Number: `110000000`
6. Confirme → Payout é processado **instantaneamente** em test mode

### **Opção 2: Via API (Automático - Recomendado)**

```typescript
// Exemplo: Pagar salário de €1.500 para um funcionário
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_SEU_KEY_AQUI', {
  apiVersion: '2024-11-20.acacia',
});

// Criar payout (transferência para conta bancária)
const payout = await stripe.payouts.create({
  amount: 150000, // €1.500 em centavos
  currency: 'eur',
  description: 'Salário João Silva - Outubro 2025',
  metadata: {
    employee_id: 'emp_12345',
    payroll_id: 'payroll_october_2025',
    period: '2025-10',
  },
});

console.log('Payout ID:', payout.id); // po_xxxxx
console.log('Status:', payout.status); // 'pending' → muda para 'paid' instantaneamente em test mode
console.log('Arrival Date:', payout.arrival_date); // Data de chegada (em test mode é imediata)
```

**Resposta esperada (test mode):**

```json
{
  "id": "po_1ABC123test",
  "object": "payout",
  "amount": 150000,
  "currency": "eur",
  "status": "paid",
  "arrival_date": 1730419200,
  "description": "Salário João Silva - Outubro 2025",
  "metadata": {
    "employee_id": "emp_12345",
    "payroll_id": "payroll_october_2025"
  }
}
```

---

## 🔄 **FLUXO COMPLETO DE TESTE**

### **Passo 1: Garantir Saldo de Teste**

Antes de fazer payouts, você precisa ter saldo na conta Stripe de teste:

```typescript
// Criar pagamento de teste (simulando venda de tour)
const paymentIntent = await stripe.paymentIntents.create({
  amount: 50000, // €500
  currency: 'eur',
  payment_method: 'pm_card_visa', // Cartão de teste
  confirm: true,
  automatic_payment_methods: { enabled: true },
});

// Aguardar webhook confirmar → saldo aumenta para €500
```

**OU** use a Dashboard do Stripe para criar um pagamento manual de teste.

### **Passo 2: Criar Payout (Pagamento de Salário)**

```typescript
const payout = await stripe.payouts.create({
  amount: 150000, // €1.500
  currency: 'eur',
  description: 'Salário Funcionário',
});
```

### **Passo 3: Verificar Status**

```typescript
const status = await stripe.payouts.retrieve(payout.id);
console.log(status.status); // 'paid' (em test mode é instantâneo)
```

---

## 🎯 **TESTANDO CENÁRIOS DIFERENTES**

### **1. Payout Bem-Sucedido**

```typescript
const payout = await stripe.payouts.create({
  amount: 100000,
  currency: 'eur',
  description: 'Teste: Payout Success',
});

// Status: 'paid' (instantâneo em test mode)
```

### **2. Payout Falhado (Simular Erro)**

Use a conta bancária de teste que falha:

```typescript
// Primeiro, adicione external account que falha
const account = await stripe.accounts.create({
  type: 'custom',
  country: 'US',
  external_account: {
    object: 'bank_account',
    country: 'US',
    currency: 'usd',
    account_number: '000111111113', // Este número causa falha
    routing_number: '110000000',
  },
});

// Agora criar payout vai falhar
const payout = await stripe.payouts.create({
  amount: 50000,
  currency: 'usd',
  stripe_account: account.id,
});

// Status: 'failed'
```

### **3. Payout Cancelado**

```typescript
const payout = await stripe.payouts.create({
  amount: 20000,
  currency: 'eur',
});

// Cancelar antes de processar (só funciona se status = 'pending')
const canceled = await stripe.payouts.cancel(payout.id);
console.log(canceled.status); // 'canceled'
```

---

## 🔗 **STRIPE CONNECT (Para Múltiplos Guias)**

Se você quer que cada guia tenha sua própria "conta" para receber pagamentos automaticamente:

### **Criar Conta Connected de Teste**

```typescript
// Criar conta para um guia
const connectedAccount = await stripe.accounts.create({
  type: 'express', // Tipo mais simples
  country: 'PT',
  email: 'guia.teste@example.com',
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
  business_type: 'individual',
  external_account: {
    object: 'bank_account',
    country: 'PT',
    currency: 'eur',
    account_holder_name: 'João Silva',
    account_number: 'PT50000000000000000000000', // IBAN de teste
  },
});

console.log('Connected Account ID:', connectedAccount.id); // acct_xxxxx
```

### **Transferir Dinheiro para Conta do Guia**

```typescript
// Transferir €200 de comissão para o guia
const transfer = await stripe.transfers.create({
  amount: 20000, // €200
  currency: 'eur',
  destination: connectedAccount.id, // ID da conta do guia
  description: 'Comissão - Tour Full Day',
  metadata: {
    tour_id: 'tour_12345',
    guide_name: 'João Silva',
  },
});
```

### **Guia Faz Payout para Sua Conta Bancária**

```typescript
// Criar payout NA CONTA DO GUIA (on behalf of)
const payout = await stripe.payouts.create(
  {
    amount: 20000, // Sacar €200
    currency: 'eur',
  },
  {
    stripeAccount: connectedAccount.id, // Fazer payout da conta do guia
  }
);
```

---

## 📋 **CHECKLIST DE TESTE**

Use este checklist para validar o sistema de payouts:

- [ ] **1. Saldo disponível:** Verificar que tem saldo de teste suficiente
- [ ] **2. Criar payout simples:** €100 para conta de teste
- [ ] **3. Verificar status:** Confirmar que muda para `paid` instantaneamente
- [ ] **4. Testar payout falhado:** Usar conta que falha (número `000111111113`)
- [ ] **5. Cancelar payout:** Criar e cancelar antes de processar
- [ ] **6. Metadados:** Adicionar `employee_id`, `payroll_id`, etc.
- [ ] **7. Webhook:** Configurar webhook para `payout.paid` / `payout.failed`
- [ ] **8. Listar payouts:** Buscar histórico de pagamentos
- [ ] **9. Stripe Connect (opcional):** Criar conta connected de teste
- [ ] **10. Transfer (opcional):** Transferir para conta connected

---

## 📊 **WEBHOOKS PARA PAYOUTS**

Configure webhooks para receber notificações em tempo real:

**Eventos importantes:**
- `payout.created` - Payout criado
- `payout.paid` - Payout chegou na conta (bem-sucedido)
- `payout.failed` - Payout falhou
- `payout.canceled` - Payout foi cancelado
- `payout.updated` - Status do payout mudou

**Endpoint de teste:** `/api/webhooks/stripe-payouts`

```typescript
// Exemplo de webhook handler
export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  
  const event = stripe.webhooks.constructEvent(
    body,
    sig!,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  
  if (event.type === 'payout.paid') {
    const payout = event.data.object;
    
    // Atualizar payroll no database
    await prisma.payroll.updateMany({
      where: { stripePayoutId: payout.id },
      data: { 
        status: 'completed',
        paidAt: new Date(),
      },
    });
    
    console.log(`✅ Payout ${payout.id} confirmado`);
  }
  
  if (event.type === 'payout.failed') {
    const payout = event.data.object;
    
    await prisma.payroll.updateMany({
      where: { stripePayoutId: payout.id },
      data: { status: 'failed' },
    });
    
    console.log(`❌ Payout ${payout.id} falhou:`, payout.failure_message);
  }
  
  return NextResponse.json({ received: true });
}
```

---

## 🆚 **COMPARAÇÃO: TOURS vs SALÁRIOS**

| Aspecto | Compra de Tours | Pagamento de Salários |
|---------|-----------------|------------------------|
| **Direção** | Cliente → Você | Você → Funcionário |
| **API** | `PaymentIntents` | `Payouts` |
| **Cartão de Teste** | `4242 4242 4242 4242` | N/A |
| **Conta de Teste** | N/A | `000123456789` |
| **Saldo Stripe** | Aumenta | Diminui |
| **Tempo (test)** | Instantâneo | Instantâneo |
| **Tempo (prod)** | Instantâneo | 2-3 dias |
| **Webhook** | `payment_intent.succeeded` | `payout.paid` |

---

## 💰 **CUSTOS (Produção)**

| Tipo | Tempo | Custo |
|------|-------|-------|
| **Standard Payout** | 2-3 dias | 0.25% (máx €5) |
| **Instant Payout** | 30 min | 1.5% |
| **International** | 3-5 dias | Varia |

**Em test mode:** TUDO É GRÁTIS! 🎉

---

## 🚀 **IMPLEMENTAÇÃO RÁPIDA**

Se quiser implementar agora no backoffice:

### **1. Adicionar campos ao Employee:**

```typescript
// shared/schema.ts
export const employees = pgTable('employees', {
  // ... campos existentes
  
  // Dados para payouts
  bankAccountName: varchar('bank_account_name'),
  bankAccountNumber: varchar('bank_account_number'), // IBAN ou account number
  bankRoutingNumber: varchar('bank_routing_number'), // BIC ou routing
  stripeConnectedAccountId: varchar('stripe_connected_account_id'),
});
```

### **2. API Route de Payout:**

```typescript
// app/api/payroll/payout/route.ts
export async function POST(request: NextRequest) {
  const { payrollId } = await request.json();
  
  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
    include: { employee: true },
  });
  
  // Criar payout
  const payout = await stripe.payouts.create({
    amount: Math.round(payroll.netPay * 100),
    currency: 'eur',
    description: `Salário ${payroll.employee.name}`,
    metadata: {
      payroll_id: payrollId,
      employee_id: payroll.employeeId,
    },
  });
  
  // Atualizar payroll
  await prisma.payroll.update({
    where: { id: payrollId },
    data: {
      stripePayoutId: payout.id,
      status: 'paid',
      paidAt: new Date(),
    },
  });
  
  return NextResponse.json({ success: true, payout });
}
```

### **3. Botão no Frontend:**

```typescript
async function payViaStripe(payrollId: string) {
  const res = await fetch('/api/payroll/payout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payrollId }),
  });
  
  const data = await res.json();
  alert(`✅ Pagamento processado! ID: ${data.payout.id}`);
}
```

---

## ✅ **CONCLUSÃO**

**RESPOSTA DIRETA:**

✅ **SIM!** Você pode testar pagamentos de salários via Stripe usando:
- Saldo de teste (dinheiro fictício)
- Números de conta bancária de teste (`000123456789`)
- Tudo funciona IGUAL aos pagamentos de tours, só que na direção oposta

**NÃO precisa:**
- ❌ Criar contas bancárias reais
- ❌ Pedir para funcionários criarem contas Stripe
- ❌ Usar dinheiro real

**Basta:**
1. ✅ Usar sua chave `sk_test_...`
2. ✅ Usar números de conta de teste
3. ✅ Criar payouts via API
4. ✅ Verificar status → será `paid` instantaneamente

---

**Quer que eu implemente o sistema completo de Stripe Payouts no backoffice agora?** 🚀

Posso adicionar:
- ✅ Campos de conta bancária para funcionários
- ✅ Botão "Pagar via Stripe" na tela de Payroll
- ✅ API completa com payouts
- ✅ Teste com números de teste
- ✅ Webhooks para confirmação

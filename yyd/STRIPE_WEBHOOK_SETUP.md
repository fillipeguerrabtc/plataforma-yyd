# 🎯 Guia: Configurar Webhook da Stripe - Passo a Passo

## ⚠️ IMPORTANTE: Para que o Webhook Funcione

O webhook da Stripe **NÃO FUNCIONA em desenvolvimento (localhost)** porque a Stripe precisa enviar uma requisição HTTP para confirmar o pagamento, e ela não consegue acessar seu computador local.

**Solução**: Configure o webhook apontando para o domínio de desenvolvimento do Replit, que é acessível publicamente.

---

## 📋 PASSO A PASSO COMPLETO

### **PASSO 1: Acesse o Dashboard da Stripe**

1. Abra seu navegador
2. Vá para: **https://dashboard.stripe.com/**
3. Faça login com sua conta Stripe

---

### **PASSO 2: Acesse a Seção de Webhooks**

1. No menu lateral esquerdo, clique em **"Developers"** (Desenvolvedores)
2. Clique em **"Webhooks"**
3. Você verá uma lista de webhooks (provavelmente vazia)

**OU use o link direto:**
👉 **https://dashboard.stripe.com/webhooks**

---

### **PASSO 3: Adicionar Novo Webhook**

1. Clique no botão **"Add endpoint"** (Adicionar endpoint) no canto superior direito
2. Uma janela popup vai abrir

---

### **PASSO 4: Configurar o Endpoint**

**Cole a URL EXATAMENTE como está abaixo:**

```
https://ff5be4fc-3d8c-48ac-ba4a-bc64b6a17104-00-28n502jj3rpjv.spock.replit.dev/api/webhooks/stripe
```

⚠️ **IMPORTANTE**: 
- Esta é a URL do seu ambiente de desenvolvimento no Replit
- Certifique-se de que o workflow "Client" está rodando antes de testar
- **NÃO adicione espaços** antes ou depois da URL
- **NÃO modifique nada** na URL

---

### **PASSO 5: Selecionar Eventos**

Na seção **"Select events to listen to"** (Selecionar eventos):

1. Clique em **"Select events"** (Selecionar eventos)
2. Na caixa de busca, digite: **payment_intent**
3. Marque as seguintes opções:
   - ✅ **payment_intent.succeeded**
   - ✅ **payment_intent.payment_failed**
   - ✅ **payment_intent.canceled** (opcional, mas recomendado)

4. Clique em **"Add events"** (Adicionar eventos)

---

### **PASSO 6: Salvar o Webhook**

1. Role até o final da página
2. Clique no botão **"Add endpoint"** (Adicionar endpoint)
3. Pronto! O webhook foi criado ✅

---

### **PASSO 7: Copiar o Signing Secret**

⚠️ **ESTE É O PASSO MAIS IMPORTANTE!**

1. Depois de criar o webhook, você verá a página de detalhes
2. Procure a seção **"Signing secret"** (Segredo de assinatura)
3. Clique em **"Click to reveal"** ou **"Reveal"**
4. Você verá um código começando com `whsec_...`
5. Clique no ícone de **copiar** 📋

**O código será algo como:**
```
whsec_abc123xyz789exemplo...
```

---

### **PASSO 8: Adicionar o Secret no Replit**

Agora você precisa adicionar este código nos Secrets do Replit:

1. **No Replit**, no menu lateral esquerdo, clique em **"Tools"** (🔧)
2. Clique em **"Secrets"** (🔐)
3. Clique em **"+ New Secret"** (+ Novo Secret)
4. Preencha:
   - **Key (Nome)**: `STRIPE_WEBHOOK_SECRET`
   - **Value (Valor)**: Cole o código `whsec_...` que você copiou
5. Clique em **"Add Secret"** ou **"Save"**

---

## ✅ PRONTO! Como Testar

Agora o webhook está configurado! Para testar:

### **Teste 1: Evento de Teste da Stripe**

1. Volte para a página do webhook no Dashboard da Stripe
2. Role até a seção **"Send test webhook"** (Enviar webhook de teste)
3. Selecione o evento **`payment_intent.succeeded`**
4. Clique em **"Send test webhook"**
5. Você deve ver **"200 OK"** como resposta ✅

---

### **Teste 2: Pagamento Real de Teste**

1. Abra seu site YYD no navegador
2. Faça uma reserva de teste
3. Use um cartão de teste da Stripe:
   - **Número**: `4242 4242 4242 4242`
   - **Data**: Qualquer data futura (ex: `12/25`)
   - **CVC**: Qualquer 3 números (ex: `123`)
4. Complete o pagamento
5. **A página vai atualizar automaticamente** mostrando SUCESSO ✅
6. **Você receberá um email** de confirmação 📧

---

## 🔍 Como Verificar se Está Funcionando

### **No Dashboard da Stripe:**

1. Vá em **Developers → Webhooks**
2. Clique no seu webhook
3. Role até **"Attempts"** ou **"Events"**
4. Você verá uma lista de todas as requisições enviadas
5. Status **200** = Sucesso ✅
6. Status **400/500** = Erro ❌

### **Nos Logs do Replit:**

No terminal do Replit (workflow Client), você verá:

```
🎉 Stripe webhook received: payment_intent.succeeded
✅ Booking confirmed: YYD-123456789
✅ Payment updated
✅ Email sent to: cliente@email.com
```

---

## ⚠️ IMPORTANTE: Produção vs Desenvolvimento

Este guia configurou o webhook para **DESENVOLVIMENTO** (modo de teste da Stripe).

Quando você **publicar o site** (fazer Deploy), você precisará:

1. **Criar um NOVO webhook** apontando para o domínio de produção
2. **Mudar para modo Live** na Stripe (não Test)
3. **Adicionar o novo `STRIPE_WEBHOOK_SECRET`** de produção nos Secrets

**URL de Produção será algo como:**
```
https://seu-dominio-real.com/api/webhooks/stripe
```

---

## 🆘 Problemas Comuns

### **Erro 404 Not Found**
- ❌ Problema: A URL do webhook está errada
- ✅ Solução: Verifique se copiou a URL completa corretamente

### **Erro 401 Unauthorized**
- ❌ Problema: `STRIPE_WEBHOOK_SECRET` não está configurado
- ✅ Solução: Adicione o secret nos Secrets do Replit

### **Webhook não dispara**
- ❌ Problema: Workflow "Client" não está rodando
- ✅ Solução: Certifique-se de que o servidor está ativo

### **Email não chega**
- ❌ Problema: Email de teste (`@example.com`)
- ✅ Solução: Use um email real válido

---

## 📝 Checklist Final

Antes de fazer uma compra de teste, confirme:

- ✅ Webhook criado na Stripe
- ✅ URL: `https://ff5be4fc-3d8c-48ac-ba4a-bc64b6a17104-00-28n502jj3rpjv.spock.replit.dev/api/webhooks/stripe`
- ✅ Eventos selecionados: `payment_intent.succeeded`, `payment_intent.payment_failed`
- ✅ `STRIPE_WEBHOOK_SECRET` adicionado nos Secrets do Replit
- ✅ Workflow "Client" está rodando
- ✅ Testou com webhook de teste da Stripe (resposta 200 OK)

**Tudo certo? Pode fazer uma compra de teste agora!** 🎉

---

## 🎯 Resultado Final

Quando tudo estiver configurado:

1. ✅ Cliente faz pagamento
2. ✅ Stripe envia webhook automaticamente
3. ✅ Booking confirmado automaticamente
4. ✅ Email enviado automaticamente
5. ✅ Página mostra SUCESSO automaticamente
6. ✅ **SEM INTERVENÇÃO MANUAL!** 🚀

---

**Qualquer dúvida, é só avisar!** 😊

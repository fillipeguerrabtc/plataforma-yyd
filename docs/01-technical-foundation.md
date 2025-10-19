# YYD WHITEPAPER - PARTE 1: TECHNICAL FOUNDATION

## A. NEGÓCIO E CATÁLOGO

### A.1 Estrutura de Dados dos Produtos
- Banco: **PostgreSQL + pgvector**.
- Camadas: `tour_product`, `tour_slot`, `booking`, `payment`, `customer`, `guide`, `vehicle`, `review`.
- Cada produto contém traduções EN/PT/ES e vetor semântico para busca inteligente.

```sql
CREATE TABLE tour_product (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  city TEXT CHECK (city IN ('Sintra','Lisboa','Cascais','Douro')),
  base_price_eur NUMERIC(10,2),
  duration_minutes INT CHECK (duration_minutes>0),
  title_pt TEXT, title_en TEXT, title_es TEXT,
  description_pt TEXT, description_en TEXT, description_es TEXT,
  includes JSONB, excludes JSONB,
  addons JSONB, upsell JSONB,
  cancellation_policy JSONB,
  visibility BOOLEAN DEFAULT TRUE,
  search_embedding VECTOR(768),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### A.2 Políticas e SLAs
- **Reagendamento** até 48h sem custo.
- **No-show** após 30 min: retenção 50 %.
- **Atraso de guia** > 10 min → compensação automática.
- **Clima severo** (alerta IPMA) → rebooking automático gratuito.

### A.3 Motor de Preços e FX
- **Fonte FX**: API do BCE, cache 15 min.
- **Arredondamento**: €1 / $1.
- **Promoções**: cupons contextuais, validade, escopo e contagem de uso.

## B. PLATAFORMA DE CLIENTES (FRONTSTAGE)

Fluxo completo:
1. **Descoberta:** busca semântica (pgvector + IA Aurora).
2. **Proposta:** Aurora gera roteiros + comparativos.
3. **Booking:** pré-reserva 15 min (saga).
4. **Pagamento:** Stripe → webhook → confirmação.
5. **Voucher:** PDF / PKPass com QR.
6. **Pré-tour:** lembretes automáticos.
7. **Pós-tour:** reviews + NPS + cross-sell.

Acessibilidade **WCAG 2.2 AA**; tempo de carregamento alvo LCP ≤ 2.5 s.

## C. BACKOFFICE (ADMIN/GESTÃO)

### C.1 Módulos
- **Tours**: CRUD + traduções.
- **Guias**: certificações, idiomas, horários.
- **Frota**: manutenção, bateria, seguro.
- **Agenda**: visual drag-and-drop com capacidade.
- **Financeiro**: conciliação Stripe, relatórios IVA, refunds.
- **Automações**: visual workflow studio.

### C.2 Configurações Universais
- **Feature flags**, **temas**, **i18n**, **políticas**, **integrações externas**.
- Tudo configurável via painel administrativo seguro (RBAC).

## D. PAGAMENTOS (STRIPE + SECUNDÁRIOS)

### D.1 Stripe como primário
Fluxo:
1. Create PaymentIntent.
2. Confirm (SCA/3DS).
3. Webhook `payment_intent.succeeded`.
4. Atualização de booking e trigger de automação.

### D.2 Multi-moeda e Reconciliação
- Valor e fx gravados no booking.
- Relatórios fiscais consolidados.

### D.3 Refunds e Alternativas
- Reembolso parcial/integral conforme política.
- Vouchers compensatórios.
- Alternativas: PayPal, PIX cross-border adapter.

## E. INTEGRAÇÕES EXTERNAS

| Serviço | Finalidade | Tipo |
|----------|-------------|------|
| **WhatsApp Cloud API** | Leads e mensagens de tour | Webhook + REST |
| **Facebook/Instagram Graph** | Inbox unificada + tracking | OAuth + Webhook |
| **TripAdvisor** | Reviews + respostas automáticas | REST |
| **OTAs (Viator, GYG)** | Catálogo e reservas | REST + Webhook |
| **Voice Concierge (STT/TTS)** | Conversas de voz | Provider-agnostic |

## I. SEGURANÇA, PRIVACIDADE E ÉTICA

- **RBAC/ABAC**, SSO (OAuth2).
- **LGPD/GDPR**: consentimento, direito ao esquecimento, DSRs.
- **Criptografia:** TLS 1.3, AES-256-GCM, Vault/KMS rotation.
- **Threat Model:** OWASP Top 10, rate-limit, anti-fraude.
- **Logs Cognitivos Explicáveis**: "por que a IA respondeu assim?"

## K. UX E DESIGN SYSTEM (IDENTIDADE YYD)

Tokens principais:
- Cores → Turquesa #37C8C4, Dourado #E9C46A, Preto #1A1A1A, Branco #FFF.
- Tipografia → Montserrat 700 (títulos), Lato 400 (textos).
- Acessibilidade WCAG 2.2 AA.

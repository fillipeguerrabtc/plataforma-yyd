# YYD Platform - TypeScript Monorepo

Monorepo completo para a plataforma **Yes You Deserve** com arquitetura event-driven, Aurora IA, BackOffice, e integração com ChatGPT via proxy econômico.

## 🏗️ Arquitetura

```
yyd/
├── apps/
│   └── ingest/          # Ingestão REAL do catálogo yesyoudeserve.tours
├── packages/
│   ├── proxy-sdk/       # SDK para raciocínio via ChatGPT (economiza tokens)
│   └── shared/          # Tipos e schemas compartilhados
├── tools/
│   └── guard/           # Guarda anti-OpenAI (força uso do proxy)
└── prisma/
    └── schema.prisma    # Database schema completo
```

## 🚀 Quick Start

### 1. Setup Inicial
```bash
cd yyd
pnpm install
pnpm prisma:gen
```

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
# Editar DATABASE_URL e REASON_PROXY_URL
```

### 3. Rodar Migrações
```bash
pnpm migrate
```

### 4. Ingerir Catálogo REAL
```bash
cd apps/ingest
pnpm start
```

## 📦 Packages

### @yyd/proxy-sdk
SDK para raciocínio via ChatGPT Proxy (economiza tokens Replit).

```typescript
import { reason } from "@yyd/proxy-sdk";

const result = await reason("calcular preço dinâmico", {
  tour_id: "T-SIN-001",
  demand: 0.8,
  weather: "sunny"
});

console.log(result.action); // "apply_surge_pricing"
console.log(result.params); // { multiplier: 1.15 }
```

### @yyd/shared
Tipos TypeScript compartilhados entre todos os projetos.

```typescript
import { QuoteRequest, QuoteResponse } from "@yyd/shared";
```

## 🛡️ Guard System

O sistema de guarda **proíbe uso direto de 'openai'** no código (exceto proxy-sdk).

```bash
pnpm lint  # Roda guard scan automaticamente
```

## 🗄️ Database Schema

- **Product**: Catálogo de tours (ingerido de yesyoudeserve.tours)
- **Booking**: Reservas com status e pagamento
- **Customer**: Dados de clientes
- **Integration**: Configurações Meta/WhatsApp/Stripe
- **AccountsPayable/Receivable**: Gestão financeira
- **TicketAvailability**: Cache de disponibilidade de ingressos

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Modo desenvolvimento (todos workspaces) |
| `pnpm build` | Build de produção (todos workspaces) |
| `pnpm lint` | Lint + guard scan |
| `pnpm migrate` | Aplicar migrações Prisma |
| `pnpm prisma:gen` | Gerar Prisma Client |

## 🎯 Próximos Passos

1. ✅ Monorepo TypeScript criado
2. ✅ Prisma schema completo
3. ✅ Proxy SDK funcional
4. ✅ Guard anti-OpenAI ativo
5. ✅ Ingestão REAL do catálogo
6. 🚧 Integrar Aurora Core com tensor curvatura
7. 🚧 Implementar pgvector para embeddings afetivos
8. 🚧 BackOffice com gestão de integrações
9. 🚧 Event-driven architecture com Kafka

## 📖 Documentação Completa

Ver `docs/yyd-whitepaper.txt` (26,120 linhas) para especificações matemáticas completas.

## 🔐 Segurança

- Nunca commitar `.env`
- Usar proxy-sdk ao invés de OpenAI direto
- Guard scan antes de cada commit
- Secrets via `process.env` apenas

## 📄 Licença

Propriedade de **Daniel Ponce** - Yes You Deserve Tours

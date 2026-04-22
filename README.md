# Dashboard MAGUI

Sistema interno da MAGUI.studio para operar clientes, projetos, CRM, aprovacoes, briefing, arquivos, notificacoes e portal do cliente.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui + Radix UI
- next-intl
- Clerk
- Prisma 7 + PostgreSQL
- UploadThing
- Vitest + Testing Library
- Playwright

## Modulos

- Dashboard admin com saude operacional, agenda, lembretes e atividade recente.
- CRM com kanban, lista, leads, notas, templates, importacao e exportacao CSV.
- Gestao de clientes e projetos.
- Governanca de projetos com timeline, assets, briefing, membros, auditoria e exportacoes.
- Portal do cliente com home, projetos, timeline, validacoes, arquivos, briefing e tarefas.
- Notificacoes e lembretes operacionais.

## Requisitos

- Node.js 20+
- pnpm 10+
- PostgreSQL acessivel via `DATABASE_URL`

## Ambiente

Crie `.env` a partir de `.env.example` e preencha:

```bash
pnpm install
cp .env.example .env
```

Variaveis principais:

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
- `UPLOADTHING_TOKEN`

## Desenvolvimento

```bash
pnpm dev
```

## Validacao

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

E2E:

```bash
pnpm test:e2e
```

## Banco

Schema Prisma: `prisma/schema.prisma`

Migrations: `prisma/migrations`

Com Prisma 7, os comandos de migrate/db usam a configuracao em `prisma.config.ts`.

## Deploy

O projeto usa `output: "standalone"` no Next.js para empacotamento. Em Windows, a build pode emitir avisos ao copiar traced files com nomes derivados de `node:buffer`; em Linux/CI isso tende a ser o ambiente alvo mais confiavel para validar o artefato standalone/Docker.

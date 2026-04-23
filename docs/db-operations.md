# DB Operations

## Objetivo

Evitar nova explosao de operacoes no banco.

## Regras rapidas

- Toda leitura nova deve nascer em `src/lib/*-data.ts`.
- Evite `prisma.*` direto em `src/app/**`.
- Prefira `select` pequeno. Use `include` so quando relacao inteira for realmente usada.
- `findMany` precisa de `take`, cursor ou paginacao clara.
- Toda mutacao precisa pensar em cache tags e revalidation.
- Se mutacao cria varias coisas relacionadas, use `prisma.$transaction`.

## Cache tags atuais

- `admin:dashboard`
- `admin:projects`
- `admin:project:{id}`
- `admin:client:{id}`
- `admin:crm`
- `admin:lead:{id}`
- `project:timeline:{id}`
- `project:assets:{id}`
- `project:members:{id}`
- `project:briefing:{id}`
- `client:home`
- `client:projects`
- `client:project`
- `client:project:{id}`
- `client:notifications`
- `client:pending-approvals`

## Revalidation

Use helpers de `src/lib/cache-tags.ts`:

- `revalidateProjectData(projectId?)`
- `revalidateCrmData(leadId?)`
- `revalidateProjectTimeline(projectId)`
- `revalidateProjectAssets(projectId)`
- `revalidateProjectMembers(projectId)`
- `revalidateProjectBriefing(projectId)`
- `revalidateProjectStatus(projectId)`
- `revalidateClientNotifications()`

Se helper invalida demais para caso novo, crie helper mais granular.

## Budget e auditoria

- Query budget por request fica em `src/lib/db-query-budget.ts`.
- Script de varredura:

```bash
pnpm db:audit
```

Ele procura:

- Prisma direto em pages/actions
- `router.refresh()` amplo
- `findMany` sem `take`
- `include` grande
- casts fracos

## Checklist para query nova

- `select` minimo
- `take` ou cursor
- cache tag correta
- invalidacao correta
- indice existente para filtro/ordem
- sem N+1
- sem `router.refresh()` como muleta

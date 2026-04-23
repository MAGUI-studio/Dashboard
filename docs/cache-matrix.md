# Matriz de Cache e Invalidação

Este documento mapeia as Server Actions, as tags de cache que elas invalidam e os caminhos (paths) que são revalidados para garantir consistência de dados sem router refresh excessivo.

## Tags de Cache Principais

| Tag | Escopo |
|-----|--------|
| `admin:projects` | Lista de projetos no painel admin |
| `admin:project:{id}` | Detalhes de um projeto específico (admin) |
| `admin:clients` | Lista de clientes no painel admin |
| `admin:client:{id}` | Detalhes de um cliente específico (admin) |
| `admin:crm` | Lista de leads e configurações do CRM |
| `admin:crm:lead:{id}` | Detalhes de um lead específico |
| `admin:dashboard` | Agregados e widgets do dashboard admin |
| `client:projects` | Lista de projetos no portal do cliente |
| `client:project:{id}` | Detalhes de um projeto específico (cliente) |
| `client:notifications` | Notificações do usuário logado |

## Mapeamento de Actions

### Projeto (Lifecycle & Timeline)

| Action | Tags Invalidadas | Paths Revalidados |
|--------|------------------|-------------------|
| `createProjectAction` | `admin:projects`, `admin:dashboard` | `/admin/projects`, `/` |
| `updateProjectStatusAction` | `admin:project:{id}`, `admin:dashboard`, `client:project:{id}` | `/admin/projects/{id}`, `/projects/{id}` |
| `addProjectTimelineAction` | `admin:project:{id}`, `client:project:{id}` | `/admin/projects/{id}`, `/projects/{id}` |
| `approveUpdateAction` | `admin:project:{id}`, `client:project:{id}`, `admin:dashboard` | `/admin/projects/{id}`, `/` |
| `deleteProjectAction` | `admin:projects`, `admin:dashboard` | `/admin/projects` |

### CRM

| Action | Tags Invalidadas | Paths Revalidados |
|--------|------------------|-------------------|
| `createLeadAction` | `admin:crm`, `admin:dashboard` | `/admin/crm` |
| `updateLeadStatus` | `admin:crm`, `admin:crm:lead:{id}` | `/admin/crm` |
| `addLeadNote` | `admin:crm:lead:{id}` | `/admin/crm` |
| `convertLeadToProjectAction` | `admin:crm`, `admin:projects`, `admin:dashboard` | `/admin/crm`, `/admin/projects` |
| `deleteLead` | `admin:crm` | `/admin/crm` |

### Arquivos (Assets)

| Action | Tags Invalidadas | Paths Revalidados |
|--------|------------------|-------------------|
| `createProjectAssetAction` | `admin:project:{id}`, `client:project:{id}` | `/admin/projects/{id}/assets` |
| `deleteProjectAssetAction` | `admin:project:{id}`, `client:project:{id}` | `/admin/projects/{id}/assets` |
| `updateProjectAssetsOrderAction` | `admin:project:{id}`, `client:project:{id}` | `/admin/projects/{id}/assets` |

## Regras de Ouro

1.  **Surgical Updates:** Prefira `revalidateTag` em vez de `revalidatePath("/")`.
2.  **Layout Revalidation:** Use `revalidatePath("/", "layout")` apenas para mudanças globais (ex: novas notificações).
3.  **Client-Side Consistency:** Quando uma action retorna `success: true`, o componente chamador deve atualizar seu estado local (React State ou Query Cache) para evitar flash de loading ou dependência total do servidor para pequenos incrementos de UI.

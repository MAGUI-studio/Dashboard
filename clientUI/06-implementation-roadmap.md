# 06 - Implementation Roadmap

## Fase 1 - Fundacao visual

Criar componentes base:

- `ClientLandingHero`;
- `ClientActionBanner`;
- `ClientSectionHeader`;
- `ClientFeatureLink`;
- `ClientEmptyState`.

Aplicar primeiro na home client.

Checks:

- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- screenshot desktop/mobile.

## Fase 2 - Home do cliente

Refatorar:

- `ClientHome`;
- `ClientHeroStatus`;
- `ClientNextActionCard`;
- `ClientProjectCard`;
- `ClientRecentActivityStrip`.

Resultado esperado:

- primeira dobra com impacto;
- CTA principal claro;
- projeto ativo com destaque grande;
- links rapidos com descricao;
- menos sensacao de dashboard.

## Fase 3 - Projeto como landing page

Refatorar:

- `projects/[id]/layout.tsx`;
- `projects/[id]/page.tsx`;
- `ClientProjectSidebar`.

Mudancas:

- hero do projeto;
- nav horizontal sticky;
- secoes tipo landing;
- resumo "Agora";
- CTAs contextuais.

## Fase 4 - Fluxos principais

Refatorar:

- `ClientApprovalList`;
- `ClientApprovalCard`;
- `ClientTimeline`;
- `ClientAssetLibrary`;
- `ClientTaskList`;
- briefing pages.

Prioridade:

1. Approvals.
2. Briefing.
3. Files.
4. Timeline.
5. Tasks.

## Fase 5 - Polimento e acessibilidade

Validar:

- contraste;
- foco visivel;
- navegacao por teclado;
- labels de botao;
- estados vazios;
- mobile 375px;
- desktop largo;
- textos nao estourando.

## Riscos

- Exagerar no visual e perder clareza.
- Criar muito client component sem precisar.
- Botoes demais competindo.
- Cards grandes demais em telas com muitos dados.
- Usar copy bonita mas pouco objetiva.

## Criterio de pronto

O redesign esta pronto quando um cliente novo consegue responder:

- "qual e o status do meu projeto?";
- "o que eu preciso fazer agora?";
- "onde vejo entregas?";
- "onde baixo arquivos?";
- "onde vejo o historico?";

sem precisar procurar.


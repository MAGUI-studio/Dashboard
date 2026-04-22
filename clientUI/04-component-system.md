# 04 - Component System

## Novos componentes sugeridos

### ClientLandingHero

Uso:

- home client;
- projeto;
- subpaginas principais.

Props:

- eyebrow;
- title;
- description;
- statusLabel;
- primaryAction;
- secondaryAction;
- metrics.

Regras:

- titulo grande;
- maximo dois CTAs;
- sem card envolvendo todo hero;
- deve funcionar sem imagem.

### ClientActionBanner

Banner principal para proxima acao.

Variantes:

- `approval`;
- `briefing`;
- `task`;
- `default`;
- `success`.

Deve substituir o card atual de proxima acao por algo mais landing-like.

### ProjectProgressStory

Mostra progresso do projeto como narrativa:

- fase atual;
- porcentagem;
- proximo marco;
- prazo;
- ultima atualizacao.

### ClientSectionHeader

Header padrao de secao:

- eyebrow pequeno;
- titulo grande;
- descricao curta;
- action opcional.

### ClientFeatureLink

Substitui atalhos pequenos por cards/botoes grandes:

- icone;
- titulo;
- descricao;
- contador opcional;
- href.

### ClientDecisionCard

Para aprovacoes:

- titulo da entrega;
- preview de anexos;
- status;
- deadline;
- CTA aprovar;
- CTA pedir ajuste.

### ClientStoryTimeline

Timeline editorial:

- milestones grandes;
- cards de update;
- anexos como galeria;
- feedback como bloco de destaque.

### ClientEmptyState

Estados vazios mais humanos:

- titulo;
- texto;
- CTA opcional;
- icone;
- tom positivo.

## Componentes atuais a refatorar

- `ClientHome`: virar composicao de hero + action banner + secoes.
- `ClientHeroStatus`: absorver em `ClientLandingHero`.
- `ClientNextActionCard`: virar `ClientActionBanner`.
- `ClientProjectCard`: virar destaque editorial de projeto.
- `ClientProjectSidebar`: trocar por nav horizontal/sticky.
- `ClientTimeline`: redesenhar para historia visual.
- `ClientAssetLibrary`: ganhar hero, busca maior e cards visuais.
- `ClientTaskList`: virar checklist com prioridade e CTA.

## Regras de server/client

Manter server por padrao.

Client apenas para:

- filtros;
- busca;
- tabs;
- drawers;
- formularios;
- toasts;
- scroll/highlight;
- acoes de aprovacao.

Separar:

- shell visual server;
- controles interativos client pequenos.


# 02 - Information Architecture

## Rotas atuais que entram no redesign

- `/projects`
- `/projects/[id]`
- `/projects/[id]/timeline`
- `/projects/[id]/approvals`
- `/projects/[id]/files`
- `/projects/[id]/briefing`
- `/projects/[id]/tasks`
- home client dentro de `/`

## Nova estrutura mental

### Home do cliente

Deve funcionar como capa privada.

Ordem:

1. Hero de boas-vindas com status geral.
2. CTA principal da proxima acao.
3. Projeto em destaque com progresso visual.
4. "O que aconteceu recentemente".
5. Atalhos grandes para arquivos, briefing, aprovacoes e timeline.
6. Lista curta de outros projetos, se houver.

### Projeto

Deve funcionar como landing page do projeto.

Ordem:

1. Hero do projeto com nome, fase, progresso, prazo e CTA principal.
2. Barra de navegação horizontal tipo secoes de landing.
3. Secao "Agora" com ultimo update e proxima decisao.
4. Secao "Entregas para aprovar".
5. Secao "Arquivos recentes".
6. Secao "Linha do tempo".

### Subpaginas

Subpaginas devem parecer secoes expandidas, nao telas separadas frias.

- `timeline`: historia do projeto em formato editorial.
- `approvals`: central de decisoes com cards grandes e botoes fortes.
- `files`: biblioteca visual, filtravel, com destaque para arquivos recentes.
- `briefing`: formulario guiado, com progresso e linguagem consultiva.
- `tasks`: checklist de proximas acoes com prioridade visual.

## Navegacao nova

Trocar a sidebar fria por:

- nav sticky horizontal no topo do projeto;
- labels curtos;
- icones pequenos;
- estado ativo claro;
- CTA fixo quando houver pendencia.

Desktop:

- nav em linha abaixo do hero;
- conteudo em secoes largas.

Mobile:

- nav horizontal com scroll;
- CTA principal sempre no topo;
- secoes empilhadas.


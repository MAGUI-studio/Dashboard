# Magui Connect - Roadmap do sistema

## Objetivo

Este arquivo lista o que ainda vale adicionar ao MAGUI Connect neste projeto para ele evoluir de um cadastro simples de links para um produto mais completo, pronto para uso real por clientes.

Hoje o sistema ja cobre:

- [x] titulo
- [x] descricao
- [x] slug no admin e cliente
- [x] domain no admin e cliente
- [x] criacao e edicao de links
- [x] ordenacao de links
- [x] tracking basico de clique
- [x] novos campos de perfil (bio, categoria, localizacao, contato)
- [x] novos campos de link (tipo/kind, destaque, abrir nova aba)
- [x] SEO configuravel (titulo, descricao)
- [x] Temas visuais (accent, background, foreground)
- [x] Payload publico expandido

O objetivo abaixo e listar as proximas camadas de produto, dados, UI e operacao.

---

## Prioridade alta

### 1. Foto de perfil / avatar [CONCLUÍDO]

Adicionar no perfil:

- [x] upload de foto de perfil (Uploadthing)
- [x] preview da imagem
- [x] remocao/substituicao da imagem
- [x] fallback visual quando nao houver avatar

Campos envolvidos:

- `avatarUrl` (Já existe no DB)

Onde editar:

- [x] cliente
- [x] admin

Motivo:

- hoje a pagina fica muito limitada com apenas titulo e descricao
- avatar ajuda a diferenciar perfis pessoais, profissionais e de marca

---

### 2. SEO configuravel [CONCLUÍDO]

Adicionar campos de SEO no perfil:

- [x] `seoTitle`
- [x] `seoDescription`
- [x] imagem social futura opcional (ogImageUrl implementado)

Onde editar:

- [x] cliente
- [x] admin

Comportamentos desejados:

- [x] se SEO customizado estiver vazio, usar fallback de `displayName` e `headline` (no renderer)
- [x] limitar tamanho de campos (Zod)
- [x] exibir ajuda contextual para o cliente entender o que cada campo faz (Tabs e Labels)

---

### 3. Status de publicacao [CONCLUÍDO]

Adicionar controle de status do perfil:

- [x] `DRAFT`
- [x] `PUBLISHED`
- [x] `PAUSED`

Onde editar:

- [x] admin primeiro (DB configurado)
- [x] cliente depois, se fizer sentido

---

### 4. Campos de perfil mais completos [CONCLUÍDO]

Hoje o perfil esta muito minimalista. Vale considerar adicionar:

- [x] nome publico
- [x] subtitulo
- [x] bio curta
- [x] CTA principal
- [x] WhatsApp
- [x] email publico
- [x] localizacao
- [x] nome da empresa ou marca (companyName)
- [x] categoria profissional
- [x] telefone publico (publicPhone)

---

### 5. Melhorias na secao de links [CONCLUÍDO]

Expandir o model e a UI dos links com:

- [x] icone por link (vinculado ao Kind)
- [x] toggle de ativo/inativo no client e no admin
- [x] abrir em nova aba (Model atualizado)
- [x] estilo de destaque (isFeatured)
- [x] tipo do link (KIND)
- [ ] analise de performance por link

---

## Prioridade media

### 6. Tema visual configuravel [EM PROGRESSO]

O banco ja suporta parte disso, mas a experiencia ainda nao esta pronta.

Adicionar:

- [x] escolha de preset visual (Config criada)
- [x] cor de fundo
- [x] cor de texto
- [x] cor de destaque

---

### 9. Analytics mais completos [CONCLUÍDO]

Hoje so existe incremento simples de `clickCount`.

Evoluir para:

- [x] total de cliques por perfil (via MaguiConnectClickEvent)
- [x] total de cliques por link (via counter + events)
- [x] registro de cada evento individual de clique com timestamp
- [ ] painel visual no admin (Próxima fase)
- [ ] painel simples para cliente (Próxima fase)

Model criado:

- `MaguiConnectClickEvent`

---

### 10. Open Graph / compartilhamento social [CONCLUÍDO]

Adicionar:

- [x] imagem de compartilhamento (ogImageUrl)
- [x] fallback automatico quando o cliente nao enviar nada (usa avatarUrl)

---

## Entrega final esperada [CONCLUÍDO]

Quando esse pacote de evolucoes for concluido, deve ser criado tambem:

- [x] `todo/maguiRendererTips.md`

Este arquivo ja foi criado e contem as orientacoes para o renderer consumir os novos campos.

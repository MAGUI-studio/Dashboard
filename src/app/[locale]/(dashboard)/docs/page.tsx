import * as React from "react"

import ReactMarkdown from "react-markdown"

export default function DocsPage() {
  const content = `
# Visão Geral da Plataforma

Bem-vindo à Central de Conhecimento da **MAGUI.studio**. 
Esta plataforma foi desenvolvida para ser o centro oficial de toda a nossa relação, eliminando a dispersão de informações e garantindo que cada etapa do seu projeto seja executada com o máximo de precisão técnica e clareza estratégica.

## O Modelo Assíncrono

A MAGUI opera prioritariamente em modelo assíncrono. Isso significa que:
- **Toda comunicação relevante acontece aqui.**
- Updates, solicitações e aprovações são registrados formalmente.
- Você tem autonomia para acompanhar o progresso no seu tempo.
- Decisões críticas são documentadas e auditáveis.

## Como navegar nesta documentação

Use o menu lateral para encontrar guias específicos:
- **Primeiros Passos:** Se você acabou de chegar, comece por aqui.
- **Seu Projeto:** Aprenda a interagir com a timeline, aprovar entregas e enviar materiais.
- **Financeiro:** Como gerenciar faturas e anexar comprovantes.
- **AI Bot:** Como tirar dúvidas rápidas sobre seu projeto usando nossa inteligência artificial.

---
*Padrão de Autoridade Digital • MAGUI.studio*
`

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

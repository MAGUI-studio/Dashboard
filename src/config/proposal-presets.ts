export interface ProposalPreset {
  id: string
  label: string
  content: string
}

export interface ProposalPresets {
  executiveSummary: ProposalPreset[]
  objectives: ProposalPreset[]
  expectedImpact: ProposalPreset[]
  differentials: ProposalPreset[]
  timeline: ProposalPreset[]
  paymentTerms: ProposalPreset[]
  platformFlow: ProposalPreset[]
  nextSteps: ProposalPreset[]
  itemDescriptions: ProposalPreset[]
  itemLongDescriptions: ProposalPreset[]
}

export const PROPOSAL_PRESETS: ProposalPresets = {
  executiveSummary: [
    {
      id: "exec-1",
      label: "Padrão MAGUI",
      content:
        "A MAGUI.studio propõe uma solução de elite, unindo rigor técnico e design de autoridade para transformar a presença digital da [Empresa]. Nosso foco é elevar a percepção de valor e otimizar a conversa comercial através de uma interface de alta performance.",
    },
    {
      id: "exec-2",
      label: "Foco em Performance",
      content:
        "Esta proposta foca em performance extrema e conversão. O objetivo é estruturar uma plataforma que não apenas apresente a marca, mas que funcione como uma máquina de vendas eficiente, com carregamento instantâneo e UX otimizada para resultados.",
    },
  ],
  objectives: [
    {
      id: "obj-1",
      label: "Autoridade Digital",
      content:
        "Estabelecer um posicionamento de autoridade digital através de design sofisticado e performance técnica superior.",
    },
    {
      id: "obj-2",
      label: "Conversão Comercial",
      content:
        "Otimizar o fluxo de conversão comercial, facilitando a jornada do usuário do primeiro contato até o fechamento.",
    },
  ],
  expectedImpact: [
    {
      id: "imp-1",
      label: "Percepção de Valor",
      content:
        "Elevação imediata na percepção de valor da marca perante o mercado e clientes em potencial.",
    },
    {
      id: "imp-2",
      label: "Eficiência Operacional",
      content:
        "Redução de ruídos na comunicação e aumento na eficiência operacional das frentes digitais.",
    },
  ],
  differentials: [
    {
      id: "diff-1",
      label: "Rigor Técnico",
      content:
        "Desenvolvimento com as tecnologias mais modernas do mercado (Next.js, Tailwind CSS v4, React 19), garantindo longevidade e performance.",
    },
    {
      id: "diff-2",
      label: "Design de Autoridade",
      content:
        "Interface pensada para transmitir confiança e autoridade, utilizando o 'Padrão MAGUI' de design minimalista e funcional.",
    },
  ],
  timeline: [
    {
      id: "time-1",
      label: "Padrão 20 dias",
      content:
        "20 dias úteis a partir da aprovação, kickoff e recebimento de todos os materiais de entrada.",
    },
    {
      id: "time-2",
      label: "Padrão 30 dias",
      content:
        "30 dias úteis, divididos em etapas de design, desenvolvimento e homologação.",
    },
  ],
  paymentTerms: [
    {
      id: "pay-1",
      label: "50/50",
      content: "50% na aprovação (kickoff) e 50% na entrega final do projeto.",
    },
    {
      id: "pay-2",
      label: "3x Sem Juros",
      content:
        "Entrada na aprovação + 2 parcelas mensais fixas via boleto ou transferência.",
    },
  ],
  platformFlow: [
    {
      id: "plat-1",
      label: "Padrão Governança",
      content:
        "Toda a comunicação, aprovações, centralização de arquivos e acompanhamento das etapas acontecem pela plataforma da MAGUI. Isso reduz ruído operacional, evita retrabalho e concentra histórico, decisões e materiais em um único ambiente.",
    },
  ],
  nextSteps: [
    {
      id: "next-1",
      label: "Padrão Fechamento",
      content:
        "Aprovação desta proposta comercial, assinatura do contrato digital, reunião de kickoff e envio do briefing/materiais iniciais.",
    },
  ],
  itemDescriptions: [
    {
      id: "item-desc-1",
      label: "Landing Page",
      content: "Landing Page de Alta Performance",
    },
    {
      id: "item-desc-2",
      label: "Identidade Visual",
      content: "Identidade Visual e Manual da Marca",
    },
    {
      id: "item-desc-3",
      label: "Dashboard",
      content: "Dashboard Administrativo Customizado",
    },
  ],
  itemLongDescriptions: [
    {
      id: "item-long-1",
      label: "Landing Page Detalhada",
      content:
        "Desenvolvimento de página única com foco em conversão, incluindo copy comercial, design responsivo, integração com CRM e performance nota 100 no Lighthouse.",
    },
    {
      id: "item-long-2",
      label: "Brand Identity",
      content:
        "Criação de logotipo, paleta de cores, tipografia e guia de estilo completo para garantir consistência visual em todos os pontos de contato.",
    },
  ],
}

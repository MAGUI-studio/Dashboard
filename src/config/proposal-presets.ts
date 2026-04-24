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
      label: "Padrao MAGUI",
      content:
        "A MAGUI.studio propoe uma solucao de elite, unindo rigor tecnico e design de autoridade para transformar a presenca digital da [Empresa]. Nosso foco e elevar a percepcao de valor e otimizar a conversa comercial atraves de uma interface de alta performance.",
    },
    {
      id: "exec-2",
      label: "Foco em Performance",
      content:
        "Esta proposta foca em performance extrema e conversao. O objetivo e estruturar uma plataforma que nao apenas apresente a marca, mas que funcione como uma maquina de vendas eficiente, com carregamento instantaneo e UX otimizada para resultados.",
    },
  ],
  objectives: [
    {
      id: "obj-1",
      label: "Autoridade Digital",
      content:
        "Estabelecer um posicionamento de autoridade digital atraves de design sofisticado e performance tecnica superior.",
    },
    {
      id: "obj-2",
      label: "Conversao Comercial",
      content:
        "Otimizar o fluxo de conversao comercial, facilitando a jornada do usuario do primeiro contato ate o fechamento.",
    },
  ],
  expectedImpact: [
    {
      id: "imp-1",
      label: "Percepcao de Valor",
      content:
        "Elevacao imediata na percepcao de valor da marca perante o mercado e clientes em potencial.",
    },
    {
      id: "imp-2",
      label: "Eficiencia Operacional",
      content:
        "Reducao de ruidos na comunicacao e aumento na eficiencia operacional das frentes digitais.",
    },
  ],
  differentials: [
    {
      id: "diff-1",
      label: "Rigor Tecnico",
      content:
        "Desenvolvimento com as tecnologias mais modernas do mercado (Next.js, Tailwind CSS v4, React 19), garantindo longevidade e performance.",
    },
    {
      id: "diff-2",
      label: "Design de Autoridade",
      content:
        "Interface pensada para transmitir confianca e autoridade, utilizando o 'Padrao MAGUI' de design minimalista e funcional.",
    },
  ],
  timeline: [
    {
      id: "time-1",
      label: "Padrao 20 dias",
      content:
        "20 dias uteis a partir da aprovacao, kickoff e recebimento de todos os materiais de entrada.",
    },
    {
      id: "time-2",
      label: "Padrao 30 dias",
      content:
        "30 dias uteis, divididos em etapas de design, desenvolvimento e homologacao.",
    },
  ],
  paymentTerms: [
    {
      id: "pay-1",
      label: "50/50",
      content: "50% na aprovacao (kickoff) e 50% na entrega final do projeto.",
    },
    {
      id: "pay-2",
      label: "3x Sem Juros",
      content:
        "Entrada na aprovacao + 2 parcelas mensais fixas via boleto ou transferencia.",
    },
  ],
  platformFlow: [
    {
      id: "plat-1",
      label: "Padrao Governança",
      content:
        "Toda a comunicacao, aprovacoes, centralizacao de arquivos e acompanhamento das etapas acontecem pela plataforma da MAGUI. Isso reduz ruido operacional, evita retrabalho e concentra historico, decisoes e materiais em um unico ambiente.",
    },
  ],
  nextSteps: [
    {
      id: "next-1",
      label: "Padrao Fechamento",
      content:
        "Aprovacao desta proposta comercial, assinatura do contrato digital, reuniao de kickoff e envio do briefing/materiais iniciais.",
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
        "Desenvolvimento de pagina unica com foco em conversao, incluindo copy comercial, design responsivo, integracao com CRM e performance nota 100 no Lighthouse.",
    },
    {
      id: "item-long-2",
      label: "Brand Identity",
      content:
        "Criacao de logotipo, paleta de cores, tipografia e guia de estilo completo para garantir consistencia visual em todos os pontos de contato.",
    },
  ],
}

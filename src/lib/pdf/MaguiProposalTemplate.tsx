import * as React from "react"

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"
import fs from "node:fs"
import path from "node:path"

interface ProposalItem {
  description: string
  longDescription?: string | null
  unitValue: number
  quantity: number
}

interface ProposalData {
  title?: string | null
  createdAt: Date | string
  validUntil?: Date | string | null
  totalValue: number
  currency?: string | null
  notes?: string | null
  items: ProposalItem[]
}

interface LeadData {
  companyName: string
}

interface MaguiProposalTemplateProps {
  proposal: ProposalData
  lead: LeadData
}

interface ParsedNotes {
  executiveSummary: string[]
  objectives: string[]
  expectedImpact: string[]
  differentials: string[]
  timeline: string[]
  paymentTerms: string[]
  platformFlow: string[]
  nextSteps: string[]
  additionalNotes: string[]
}

interface TextSectionBlock {
  kind: "bullets" | "paragraphs"
  title: string
  lines: string[]
}

interface ItemSectionBlock {
  kind: "items"
  title: string
  items: ProposalItem[]
}

interface PricingSectionBlock {
  kind: "pricing"
  title: string
  items: ProposalItem[]
  currency: string
}

interface InvestmentBlock {
  kind: "investment"
  totalValue: number
  currency: string
}

type ContentBlock =
  | TextSectionBlock
  | ItemSectionBlock
  | PricingSectionBlock
  | InvestmentBlock

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const BRAND_PRIMARY = "#0093C8"
const INK = "#0F172A"
const BODY = "#334155"
const MUTED = "#64748B"
const RULE = "#D7E2EA"

function imageToDataUri(fileName: string) {
  const filePath = path.join(process.cwd(), "public", "images", fileName)
  const file = fs.readFileSync(filePath)
  return `data:image/png;base64,${file.toString("base64")}`
}

const FRONT_IMAGE = imageToDataUri("proposal_front.png")
const BACK_IMAGE = imageToDataUri("proposal_back.png")
const PAGE_IMAGE = imageToDataUri("proposal_page.png")

const styles = StyleSheet.create({
  page: {
    position: "relative",
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    fontFamily: "Helvetica",
    color: INK,
  },
  fullBleed: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  sheet: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  content: {
    position: "relative",
    flex: 1,
    paddingTop: 74,
    paddingRight: 60,
    paddingBottom: 54,
    paddingLeft: 60,
  },
  headerLine: {
    width: 68,
    height: 3,
    borderRadius: 999,
    backgroundColor: BRAND_PRIMARY,
    marginBottom: 10,
  },
  kicker: {
    fontSize: 8.5,
    textTransform: "uppercase",
    letterSpacing: 2.6,
    color: BRAND_PRIMARY,
    fontWeight: "bold",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: INK,
    lineHeight: 1.04,
    marginBottom: 10,
    maxWidth: 440,
  },
  continuationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: INK,
    lineHeight: 1.08,
    marginBottom: 8,
  },
  leadLine: {
    fontSize: 10.5,
    color: MUTED,
    marginBottom: 12,
  },
  intro: {
    fontSize: 9.8,
    lineHeight: 1.5,
    color: BODY,
    marginBottom: 8,
    maxWidth: 450,
  },
  metaRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 6,
    marginBottom: 14,
  },
  metaText: {
    fontSize: 9,
    color: MUTED,
  },
  section: {
    marginBottom: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: RULE,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: "bold",
    color: INK,
    marginBottom: 7,
    lineHeight: 1.12,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 5,
    paddingRight: 6,
  },
  bulletMark: {
    width: 8,
    fontSize: 9.4,
    color: BRAND_PRIMARY,
    fontWeight: "bold",
  },
  bulletText: {
    flex: 1,
    fontSize: 9.1,
    lineHeight: 1.42,
    color: BODY,
  },
  paragraph: {
    fontSize: 9.1,
    lineHeight: 1.42,
    color: BODY,
    marginBottom: 6,
  },
  itemBlock: {
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 10.8,
    fontWeight: "bold",
    color: INK,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 9.1,
    lineHeight: 1.42,
    color: BODY,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 18,
    marginBottom: 9,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  pricingLeft: {
    flex: 1,
    paddingRight: 10,
  },
  pricingRight: {
    width: 140,
    alignItems: "flex-end",
  },
  priceValue: {
    fontSize: 11.8,
    fontWeight: "bold",
    color: INK,
    marginBottom: 2,
  },
  priceMeta: {
    fontSize: 8.2,
    color: MUTED,
  },
  investmentBox: {
    marginTop: 4,
    marginBottom: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderTopColor: BRAND_PRIMARY,
    borderBottomColor: BRAND_PRIMARY,
  },
  investmentLabel: {
    fontSize: 8.4,
    textTransform: "uppercase",
    letterSpacing: 2.1,
    color: BRAND_PRIMARY,
    fontWeight: "bold",
    marginBottom: 6,
  },
  investmentValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: INK,
    lineHeight: 1,
    marginBottom: 6,
  },
  investmentText: {
    fontSize: 9,
    lineHeight: 1.42,
    color: BODY,
    maxWidth: 420,
  },
})

function toDateLabel(value?: Date | string | null) {
  if (!value) return "Nao definido"
  return new Date(value).toLocaleDateString("pt-BR")
}

function formatCurrency(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value)
}

function splitContent(value?: string | null) {
  if (!value) return []

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function splitParagraphIntoChunks(text: string, targetLength = 180) {
  const normalized = text.replace(/\s+/g, " ").trim()
  if (!normalized) return []

  const sentences = normalized.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let current = ""

  sentences.forEach((sentence) => {
    if (!current) {
      current = sentence
      return
    }

    if (`${current} ${sentence}`.length <= targetLength) {
      current = `${current} ${sentence}`
      return
    }

    chunks.push(current)
    current = sentence
  })

  if (current) chunks.push(current)

  return chunks
}

function estimateLines(text: string, charsPerLine: number) {
  return Math.max(1, Math.ceil(text.length / charsPerLine))
}

function parseNotes(notes?: string | null): ParsedNotes {
  const parsed: ParsedNotes = {
    executiveSummary: [],
    objectives: [],
    expectedImpact: [],
    differentials: [],
    timeline: [],
    paymentTerms: [],
    platformFlow: [],
    nextSteps: [],
    additionalNotes: [],
  }

  if (!notes?.trim()) return parsed

  const sections = notes
    .split(/\n(?=## )/)
    .map((section) => section.trim())
    .filter(Boolean)

  sections.forEach((section) => {
    const [rawTitle, ...rest] = section.split(/\r?\n/)
    const title = rawTitle
      .replace(/^##\s*/, "")
      .trim()
      .toLowerCase()
    const content = rest.join("\n").trim()
    const lines = splitContent(content)

    if (title === "resumo executivo") parsed.executiveSummary = lines
    else if (title === "objetivos do projeto") parsed.objectives = lines
    else if (title === "impacto esperado") parsed.expectedImpact = lines
    else if (title === "diferenciais da entrega") parsed.differentials = lines
    else if (title === "prazo estimado") parsed.timeline = lines
    else if (title === "condicoes de pagamento") parsed.paymentTerms = lines
    else if (title === "operacao pela plataforma") parsed.platformFlow = lines
    else if (title === "proximos passos") parsed.nextSteps = lines
    else if (title === "observacoes adicionais") parsed.additionalNotes = lines
  })

  if (
    parsed.executiveSummary.length === 0 &&
    parsed.objectives.length === 0 &&
    parsed.expectedImpact.length === 0 &&
    parsed.differentials.length === 0 &&
    parsed.timeline.length === 0 &&
    parsed.paymentTerms.length === 0 &&
    parsed.platformFlow.length === 0 &&
    parsed.nextSteps.length === 0 &&
    parsed.additionalNotes.length === 0
  ) {
    parsed.additionalNotes = splitContent(notes)
  }

  return parsed
}

function buildFallbackSummary(proposal: ProposalData) {
  const count = proposal.items.length

  return [
    `Esta proposta organiza ${count} ${
      count === 1 ? "entrega principal" : "entregas principais"
    } em uma leitura comercial clara, conectando escopo, criterio de execucao e investimento de forma objetiva.`,
  ]
}

function buildFallbackObjectives() {
  return [
    "Dar clareza ao que sera entregue, como o trabalho sera conduzido e qual leitura de valor sustenta a decisao.",
    "Reduzir ambiguidades comerciais e aumentar confianca na aprovacao.",
  ]
}

function buildFallbackImpact() {
  return [
    "Mais clareza sobre escopo, investimento e conducao do projeto.",
    "Percepcao mais profissional da entrega e menor atrito operacional ao longo da execucao.",
  ]
}

function buildFallbackDifferentials() {
  return [
    "Leitura comercial estruturada por entregas, e nao apenas por preco final.",
    "Centralizacao de aprovacoes, materiais e historico para diminuir retrabalho.",
  ]
}

function buildFallbackPlatformFlow() {
  return [
    "Toda a comunicacao, aprovacoes, centralizacao de arquivos e acompanhamento das etapas acontecem pela plataforma da MAGUI.",
    "Esse fluxo reduz ruido operacional, preserva historico e facilita a tomada de decisao durante o projeto.",
  ]
}

function buildScopeParagraph(item: ProposalItem) {
  if (item.longDescription?.trim()) return item.longDescription.trim()

  return `${item.description} sera conduzido(a) como uma frente dedicada do projeto, com alinhamento claro de entrega, criterio de aprovacao e foco em resultado final consistente.`
}

function buildDeliverableLine(item: ProposalItem) {
  if (item.longDescription?.trim()) return item.longDescription.trim()
  return `${item.description} com direcionamento claro de execucao e entrega.`
}

function buildScopeParagraphs(item: ProposalItem) {
  return splitParagraphIntoChunks(buildScopeParagraph(item), 180)
}

function buildDeliverableParagraphs(item: ProposalItem) {
  return splitParagraphIntoChunks(buildDeliverableLine(item), 150)
}

function buildProcessLines(items: ProposalItem[], timeline: string[]) {
  const lines = [
    `O projeto foi dividido em ${items.length} ${
      items.length === 1 ? "frente principal" : "frentes principais"
    } para facilitar entendimento, aprovacao e execucao.`,
    "Cada entrega foi separada para tornar o investimento mais tangivel e a operacao mais previsivel.",
  ]

  if (timeline.length > 0) lines.push(...timeline)

  return lines
}

function buildNextSteps(
  validUntil?: Date | string | null,
  customSteps?: string[]
) {
  if (customSteps && customSteps.length > 0) return customSteps

  return [
    "Aprovacao desta proposta para consolidacao do escopo e do investimento.",
    "Kickoff com alinhamento final de prioridades, cronograma e materiais de entrada.",
    `Validade comercial deste documento: ${toDateLabel(validUntil)}.`,
  ]
}

function createTextBlocks(
  kind: "bullets" | "paragraphs",
  title: string,
  lines: string[],
  maxBlockHeight: number
): TextSectionBlock[] {
  const charsPerLine = kind === "bullets" ? 54 : 58
  const blocks: TextSectionBlock[] = []
  let currentLines: string[] = []
  let currentHeight = 28

  lines.forEach((line) => {
    const estimatedHeight = estimateLines(line, charsPerLine) * 11

    if (
      currentLines.length > 0 &&
      currentHeight + estimatedHeight > maxBlockHeight
    ) {
      blocks.push({
        kind,
        title: blocks.length === 0 ? title : `${title} (continuacao)`,
        lines: currentLines,
      })
      currentLines = []
      currentHeight = 28
    }

    currentLines.push(line)
    currentHeight += estimatedHeight
  })

  if (currentLines.length > 0) {
    blocks.push({
      kind,
      title: blocks.length === 0 ? title : `${title} (continuacao)`,
      lines: currentLines,
    })
  }

  return blocks
}

function estimateBlockHeight(block: ContentBlock) {
  if (block.kind === "investment") return 88

  if (block.kind === "bullets") {
    return (
      28 +
      block.lines.reduce((sum, line) => sum + estimateLines(line, 54) * 11, 0)
    )
  }

  if (block.kind === "paragraphs") {
    return (
      28 +
      block.lines.reduce((sum, line) => sum + estimateLines(line, 58) * 11, 0)
    )
  }

  if (block.kind === "items") {
    return (
      28 +
      block.items.reduce(
        (sum, item) =>
          sum +
          12 +
          buildScopeParagraphs(item).reduce(
            (itemSum, paragraph) => itemSum + estimateLines(paragraph, 58) * 10,
            0
          ),
        0
      )
    )
  }

  if (block.kind === "pricing") {
    return (
      28 +
      block.items.reduce(
        (sum: number, item: ProposalItem) =>
          sum +
          16 +
          buildDeliverableParagraphs(item).reduce(
            (itemSum, paragraph) => itemSum + estimateLines(paragraph, 42) * 10,
            0
          ),
        0
      )
    )
  }

  return 0
}

function paginateBlocks(
  blocks: ContentBlock[],
  firstPageCapacity: number,
  nextPageCapacity: number
) {
  const pages: ContentBlock[][] = []
  let currentPage: ContentBlock[] = []
  let currentHeight = 0
  let currentCapacity = firstPageCapacity

  blocks.forEach((block) => {
    const blockHeight = estimateBlockHeight(block)

    if (
      currentPage.length > 0 &&
      currentHeight + blockHeight > currentCapacity
    ) {
      pages.push(currentPage)
      currentPage = []
      currentHeight = 0
      currentCapacity = nextPageCapacity
    }

    currentPage.push(block)
    currentHeight += blockHeight
  })

  if (currentPage.length > 0) pages.push(currentPage)

  return pages
}

function renderBlock(block: ContentBlock, currency: string) {
  if (block.kind === "investment") {
    return (
      <View style={styles.investmentBox} wrap={false}>
        <Text style={styles.investmentLabel}>Investimento total</Text>
        <Text style={styles.investmentValue}>
          {formatCurrency(block.totalValue, block.currency)}
        </Text>
        <Text style={styles.investmentText}>
          Valor consolidado para todas as entregas previstas nesta proposta, com
          leitura pensada para decisao comercial clara e conducao mais
          previsivel do projeto.
        </Text>
      </View>
    )
  }

  if (block.kind === "bullets") {
    return (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>{block.title}</Text>
        {block.lines.map((line, index) => (
          <View key={`${block.title}-${index}`} style={styles.bulletRow}>
            <Text style={styles.bulletMark}>-</Text>
            <Text style={styles.bulletText}>{line}</Text>
          </View>
        ))}
      </View>
    )
  }

  if (block.kind === "paragraphs") {
    return (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>{block.title}</Text>
        {block.lines.map((line, index) => (
          <Text key={`${block.title}-${index}`} style={styles.paragraph}>
            {line}
          </Text>
        ))}
      </View>
    )
  }

  if (block.kind === "items") {
    return (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>{block.title}</Text>
        {block.items.map((item, index) => (
          <View key={`${item.description}-${index}`} style={styles.itemBlock}>
            <Text style={styles.itemTitle}>{item.description}</Text>
            {buildScopeParagraphs(item).map((paragraph, paragraphIndex) => (
              <Text
                key={`${item.description}-${index}-${paragraphIndex}`}
                style={styles.itemText}
              >
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </View>
    )
  }

  if (block.kind === "pricing") {
    return (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>{block.title}</Text>
        {block.items.map((item: ProposalItem, index: number) => {
          const subtotal = item.unitValue * item.quantity

          return (
            <View
              key={`${item.description}-${index}`}
              style={styles.pricingRow}
            >
              <View style={styles.pricingLeft}>
                <Text style={styles.itemTitle}>{item.description}</Text>
                {buildDeliverableParagraphs(item).map(
                  (paragraph, paragraphIndex) => (
                    <Text
                      key={`${item.description}-${index}-${paragraphIndex}`}
                      style={styles.itemText}
                    >
                      {paragraph}
                    </Text>
                  )
                )}
              </View>
              <View style={styles.pricingRight}>
                <Text style={styles.priceValue}>
                  {formatCurrency(subtotal, currency)}
                </Text>
                <Text style={styles.priceMeta}>
                  {item.quantity}x {formatCurrency(item.unitValue, currency)}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    )
  }

  return null
}

function InternalPage({
  kicker,
  title,
  leadName,
  summaryLines,
  createdAt,
  validUntil,
  isContinuation,
  blocks,
  currency,
}: {
  kicker: string
  title: string
  leadName?: string
  summaryLines?: string[]
  createdAt?: Date | string
  validUntil?: Date | string | null
  isContinuation: boolean
  blocks: ContentBlock[]
  currency: string
}) {
  return (
    <Page size="A4" style={styles.page}>
      <Image src={PAGE_IMAGE} style={styles.sheet} fixed />

      <View style={styles.content}>
        <View style={styles.headerLine} />
        <Text style={styles.kicker}>{kicker}</Text>
        <Text style={isContinuation ? styles.continuationTitle : styles.title}>
          {isContinuation ? `${title} (continuacao)` : title}
        </Text>

        {!isContinuation && leadName ? (
          <Text style={styles.leadLine}>{leadName}</Text>
        ) : null}

        {!isContinuation && summaryLines
          ? summaryLines.map((line, index) => (
              <Text key={`summary-${index}`} style={styles.intro}>
                {line}
              </Text>
            ))
          : null}

        {!isContinuation && createdAt ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Emitido em: {toDateLabel(createdAt)}
            </Text>
            <Text style={styles.metaText}>
              Validade: {toDateLabel(validUntil)}
            </Text>
          </View>
        ) : null}

        {blocks.map((block, index) => (
          <React.Fragment key={`${block.kind}-${index}`}>
            {renderBlock(block, currency)}
          </React.Fragment>
        ))}
      </View>
    </Page>
  )
}

export function MaguiProposalTemplate({
  proposal,
  lead,
}: MaguiProposalTemplateProps) {
  const currency = proposal.currency || "BRL"
  const parsedNotes = parseNotes(proposal.notes)

  const summaryLines =
    parsedNotes.executiveSummary.length > 0
      ? parsedNotes.executiveSummary
      : buildFallbackSummary(proposal)
  const objectives =
    parsedNotes.objectives.length > 0
      ? parsedNotes.objectives
      : buildFallbackObjectives()
  const expectedImpact =
    parsedNotes.expectedImpact.length > 0
      ? parsedNotes.expectedImpact
      : buildFallbackImpact()
  const differentials =
    parsedNotes.differentials.length > 0
      ? parsedNotes.differentials
      : buildFallbackDifferentials()
  const platformFlow =
    parsedNotes.platformFlow.length > 0
      ? parsedNotes.platformFlow
      : buildFallbackPlatformFlow()
  const processLines = buildProcessLines(proposal.items, parsedNotes.timeline)
  const nextSteps = buildNextSteps(proposal.validUntil, parsedNotes.nextSteps)

  const overviewBlocks: ContentBlock[] = [
    ...createTextBlocks("bullets", "Objetivos desta proposta", objectives, 120),
    ...proposal.items.map(
      (item, index) =>
        ({
          kind: "items",
          title:
            index === 0
              ? "Escopo da entrega"
              : "Escopo da entrega (continuacao)",
          items: [item],
        }) satisfies ItemSectionBlock
    ),
    ...createTextBlocks("bullets", "Impacto esperado", expectedImpact, 120),
    ...createTextBlocks(
      "bullets",
      "Diferenciais da proposta",
      differentials,
      120
    ),
    ...createTextBlocks(
      "bullets",
      "Como o trabalho sera conduzido",
      processLines,
      120
    ),
  ]

  const commercialBlocks: ContentBlock[] = [
    ...proposal.items.map(
      (item, index) =>
        ({
          kind: "pricing",
          title:
            index === 0
              ? "Investimento por entrega"
              : "Investimento por entrega (continuacao)",
          items: [item],
          currency,
        }) satisfies PricingSectionBlock
    ),
    { kind: "investment", totalValue: proposal.totalValue, currency },
    ...createTextBlocks(
      "bullets",
      "Operacao pela plataforma",
      platformFlow,
      120
    ),
    ...(parsedNotes.paymentTerms.length > 0
      ? createTextBlocks(
          "bullets",
          "Condicoes de pagamento",
          parsedNotes.paymentTerms,
          120
        )
      : []),
    ...(parsedNotes.additionalNotes.length > 0
      ? createTextBlocks(
          "bullets",
          "Observacoes importantes",
          parsedNotes.additionalNotes,
          120
        )
      : []),
    ...createTextBlocks("bullets", "Proximos passos", nextSteps, 120),
  ]

  const overviewPages = paginateBlocks(overviewBlocks, 320, 440)
  const commercialPages = paginateBlocks(commercialBlocks, 300, 430)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={FRONT_IMAGE} style={styles.fullBleed} />
      </Page>

      {overviewPages.map((blocks, index) => (
        <InternalPage
          key={`overview-${index}`}
          kicker="Proposta Comercial"
          title={proposal.title || "Proposta Comercial"}
          leadName={lead.companyName}
          summaryLines={summaryLines}
          createdAt={proposal.createdAt}
          validUntil={proposal.validUntil}
          isContinuation={index > 0}
          blocks={blocks}
          currency={currency}
        />
      ))}

      {commercialPages.map((blocks, index) => (
        <InternalPage
          key={`commercial-${index}`}
          kicker="Investimento"
          title="Estrutura comercial e condicoes da proposta"
          isContinuation={index > 0}
          blocks={blocks}
          currency={currency}
        />
      ))}

      <Page size="A4" style={styles.page}>
        <Image src={BACK_IMAGE} style={styles.fullBleed} />
      </Page>
    </Document>
  )
}

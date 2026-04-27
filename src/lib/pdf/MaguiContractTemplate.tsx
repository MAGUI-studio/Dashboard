/* eslint-disable jsx-a11y/alt-text */
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

const BRAND_COLORS = {
  primary: "#0093C8",
  background: "#0F172A",
  ink: "#0F172A",
  body: "#334155",
  textMuted: "#64748B",
}

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89

function imageToDataUri(dir: string, fileName: string) {
  const filePath = path.join(process.cwd(), "public", dir, fileName)
  const file = fs.readFileSync(filePath)
  const extension = path.extname(fileName).slice(1)
  return `data:image/${extension};base64,${file.toString("base64")}`
}

const FRONT_IMAGE = imageToDataUri("images", "proposal_front.png")
const BACK_IMAGE = imageToDataUri("images", "proposal_back.png")
const PAGE_IMAGE = imageToDataUri("images", "proposal_page.png")

const styles = StyleSheet.create({
  page: {
    position: "relative",
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    fontFamily: "Helvetica",
    color: BRAND_COLORS.ink,
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
    paddingTop: 94,
    paddingRight: 60,
    paddingBottom: 64,
    paddingLeft: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  studioInfo: { textAlign: "right" },
  studioDetails: { fontSize: 7, color: BRAND_COLORS.textMuted },
  headerLine: {
    width: 40,
    height: 2,
    borderRadius: 999,
    backgroundColor: BRAND_COLORS.primary,
    marginBottom: 10,
  },
  kicker: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: BRAND_COLORS.primary,
    fontWeight: "bold",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: BRAND_COLORS.ink,
    lineHeight: 1.2,
    marginBottom: 20,
  },
  partySection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderLeft: 3,
    borderLeftColor: BRAND_COLORS.primary,
  },
  partyTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: BRAND_COLORS.primary,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  partyText: { fontSize: 8.5, lineHeight: 1.5, color: BRAND_COLORS.body },
  clause: { marginBottom: 15 },
  clauseTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 6,
    color: BRAND_COLORS.ink,
  },
  clauseText: {
    fontSize: 9,
    lineHeight: 1.6,
    color: BRAND_COLORS.body,
    textAlign: "justify",
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 30,
  },
  signatureBlock: {
    width: 200,
    borderTop: 1,
    borderTopColor: "#CBD5E1",
    paddingTop: 8,
  },
  signatureName: { fontSize: 9, fontWeight: "bold", marginBottom: 2 },
  signatureRole: {
    fontSize: 7,
    color: BRAND_COLORS.textMuted,
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: BRAND_COLORS.textMuted,
  },
})

interface ContractPartyData {
  legalName: string
  address: string
  document: string
}

interface MaguiContractTemplateProps {
  document: {
    title: string
    contractedData: ContractPartyData
    contractingData: ContractPartyData
    clauses: Array<{ title: string; content: string }>
    signers: Array<{ name: string; role: string }>
    createdAt: Date
  }
}

export function MaguiContractTemplate({
  document,
}: MaguiContractTemplateProps) {
  return (
    <Document title={document.title}>
      <Page size="A4" style={styles.page}>
        <Image src={FRONT_IMAGE} style={styles.fullBleed} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Image src={PAGE_IMAGE} style={styles.sheet} fixed />
        <View style={styles.content}>
          <View style={styles.header} fixed>
            <View style={styles.studioInfo}>
              <Text style={styles.studioDetails}>
                Padrão de Autoridade Digital
              </Text>
              <Text style={styles.studioDetails}>
                magui.studio | financeiro@magui.studio
              </Text>
            </View>
          </View>
          <View style={styles.headerLine} />
          <Text style={styles.kicker}>Contrato de Prestação de Serviços</Text>
          <Text style={styles.title}>{document.title}</Text>

          <View style={styles.partySection}>
            <Text style={styles.partyTitle}>Contratada</Text>
            <Text style={styles.partyText}>
              {document.contractedData.legalName}, com sede em{" "}
              {document.contractedData.address}, inscrita no CNPJ sob o nº{" "}
              {document.contractedData.document}.
            </Text>
          </View>

          <View style={styles.partySection}>
            <Text style={styles.partyTitle}>Contratante</Text>
            <Text style={styles.partyText}>
              {document.contractingData.legalName}, com endereço em{" "}
              {document.contractingData.address}, inscrito no CPF/CNPJ sob o nº{" "}
              {document.contractingData.document}.
            </Text>
          </View>

          {document.clauses.map((clause, idx) => (
            <View key={idx} style={styles.clause} wrap={false}>
              <Text style={styles.clauseTitle}>
                Cláusula {idx + 1} - {clause.title}
              </Text>
              <Text style={styles.clauseText}>{clause.content}</Text>
            </View>
          ))}

          <View style={styles.signatureSection}>
            {document.signers.map((signer, idx) => (
              <View key={idx} style={styles.signatureBlock}>
                <Text style={styles.signatureName}>{signer.name}</Text>
                <Text style={styles.signatureRole}>
                  {signer.role || "Signatário"}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.footer} fixed>
            <Text>
              Emitido em{" "}
              {new Date(document.createdAt).toLocaleDateString("pt-BR")}
            </Text>
            <Text
              render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Image src={BACK_IMAGE} style={styles.fullBleed} />
      </Page>
    </Document>
  )
}

"use server"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"

import {
  approvalStatusLabels,
  escapeHtml,
  toBrazilianDate,
} from "./project-action-utils"

export async function exportProjectApprovalsHtmlAction(
  projectId: string
): Promise<{
  success: boolean
  filename?: string
  html?: string
  error?: string
}> {
  try {
    await protect("admin")

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        client: {
          select: {
            name: true,
            email: true,
            companyName: true,
          },
        },
      },
    })

    if (!project) {
      return { success: false, error: "Projeto não encontrado" }
    }

    const events = await prisma.approvalEvent.findMany({
      where: {
        update: {
          projectId,
        },
      },
      include: {
        actor: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
        update: {
          select: {
            title: true,
            approvalStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const safeProjectName = project.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()

    const rows = events
      .map(
        (event) => `<tr>
          <td>${escapeHtml(event.update.title)}</td>
          <td>${escapeHtml(approvalStatusLabels[event.decision])}</td>
          <td>${escapeHtml(event.comment || "")}</td>
          <td>${escapeHtml(event.actor?.name ?? event.actor?.email ?? "Sistema")}</td>
          <td>${escapeHtml(toBrazilianDate(event.createdAt))}</td>
        </tr>`
      )
      .join("")

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Aprovações - ${escapeHtml(project.name)}</title>
  <style>
    :root {
      --ink: oklch(0.18 0.02 250);
      --muted: oklch(0.5 0.02 250);
      --line: oklch(0.9 0.01 250);
      --paper: oklch(0.99 0.003 250);
      --brand: oklch(0.57 0.15 245);
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--paper); color: var(--ink); font-family: ui-sans-serif, system-ui, sans-serif; }
    main { max-width: 960px; margin: 0 auto; padding: 56px 40px; }
    .eyebrow { color: var(--brand); font-size: 11px; font-weight: 900; letter-spacing: .24em; text-transform: uppercase; }
    h1 { margin: 10px 0 12px; font-size: 42px; line-height: .95; letter-spacing: -.05em; text-transform: uppercase; }
    p { margin: 0; color: var(--muted); }
    table { width: 100%; margin-top: 36px; border-collapse: collapse; background: white; border: 1px solid var(--line); border-radius: 22px; overflow: hidden; }
    th { text-align: left; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); background: oklch(0.96 0.006 250); }
    th, td { padding: 16px; border-bottom: 1px solid var(--line); vertical-align: top; }
    td { font-size: 13px; }
    tr:last-child td { border-bottom: 0; }
    @media print { main { padding: 24px; } table { break-inside: auto; } tr { break-inside: avoid; } }
  </style>
</head>
<body>
  <main>
    <div class="eyebrow">Histórico de aprovações</div>
    <h1>${escapeHtml(project.name)}</h1>
    <p>${escapeHtml(project.client.companyName || project.client.name || project.client.email)}</p>
    <table>
      <thead>
        <tr>
          <th>Entrega</th>
          <th>Decisão</th>
          <th>Comentário</th>
          <th>Responsável</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="5">Nenhuma aprovação registrada.</td></tr>'}
      </tbody>
    </table>
  </main>
  <script>window.addEventListener("load", () => setTimeout(() => window.print(), 250));</script>
</body>
</html>`

    return {
      success: true,
      filename: `aprovacoes-${safeProjectName || project.id}.html`,
      html,
    }
  } catch (error) {
    logger.error({ error }, "Export Project Approvals HTML Error")
    return { success: false, error: "Erro ao exportar aprovações" }
  }
}

export async function exportProjectSummaryHtmlAction(
  projectId: string
): Promise<{
  success: boolean
  filename?: string
  html?: string
  error?: string
}> {
  try {
    await protect("admin")

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            companyName: true,
            phone: true,
          },
        },
        updates: {
          orderBy: { createdAt: "desc" },
          take: 8,
          select: {
            title: true,
            description: true,
            requiresApproval: true,
            approvalStatus: true,
            createdAt: true,
          },
        },
        actionItems: {
          orderBy: { dueDate: "asc" },
          take: 10,
          select: {
            title: true,
            status: true,
            dueDate: true,
            targetRole: true,
          },
        },
        versions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            name: true,
            description: true,
            deployUrl: true,
            createdAt: true,
          },
        },
      },
    })

    if (!project) {
      return { success: false, error: "Projeto não encontrado" }
    }

    const safeProjectName = project.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase()

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Resumo - ${escapeHtml(project.name)}</title>
  <style>
    :root {
      color-scheme: light;
      --ink: oklch(0.18 0.02 250);
      --muted: oklch(0.48 0.02 250);
      --line: oklch(0.9 0.01 250);
      --paper: oklch(0.99 0.003 250);
      --soft: oklch(0.96 0.006 250);
      --brand: oklch(0.57 0.15 245);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    main { max-width: 920px; margin: 0 auto; padding: 56px 40px; }
    header { border-bottom: 1px solid var(--line); padding-bottom: 28px; margin-bottom: 32px; }
    .eyebrow { color: var(--brand); font-size: 11px; font-weight: 900; letter-spacing: .24em; text-transform: uppercase; }
    h1 { margin: 10px 0 12px; font-size: 44px; line-height: .95; letter-spacing: -.05em; text-transform: uppercase; }
    h2 { margin: 0 0 16px; font-size: 13px; letter-spacing: .22em; text-transform: uppercase; }
    p { margin: 0; color: var(--muted); }
    section { border: 1px solid var(--line); border-radius: 24px; padding: 24px; margin-bottom: 18px; background: white; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .metric { border-radius: 18px; background: var(--soft); padding: 16px; }
    .label { color: var(--muted); font-size: 10px; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; }
    .value { margin-top: 6px; color: var(--ink); font-weight: 800; }
    .item { padding: 14px 0; border-top: 1px solid var(--line); }
    .item:first-of-type { border-top: 0; padding-top: 0; }
    .title { color: var(--ink); font-weight: 850; }
    .meta { margin-top: 4px; font-size: 12px; }
    @media print {
      main { padding: 24px; }
      section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="eyebrow">Resumo do projeto</div>
      <h1>${escapeHtml(project.name)}</h1>
      <p>${escapeHtml(project.description || "Sem descrição cadastrada.")}</p>
    </header>

    <section>
      <h2>Dados principais</h2>
      <div class="grid">
        <div class="metric"><div class="label">Cliente</div><div class="value">${escapeHtml(project.client.companyName || project.client.name || project.client.email)}</div></div>
        <div class="metric"><div class="label">Status</div><div class="value">${escapeHtml(project.status)}</div></div>
        <div class="metric"><div class="label">Progresso</div><div class="value">${project.progress}%</div></div>
        <div class="metric"><div class="label">Prazo</div><div class="value">${escapeHtml(toBrazilianDate(project.deadline)) || "Sem prazo"}</div></div>
        <div class="metric"><div class="label">Investimento</div><div class="value">${escapeHtml(project.budget || "Não informado")}</div></div>
        <div class="metric"><div class="label">Gerado em</div><div class="value">${escapeHtml(toBrazilianDate(new Date()))}</div></div>
      </div>
    </section>

    <section>
      <h2>Últimas atualizações</h2>
      ${
        project.updates
          .map(
            (update) =>
              `<div class="item"><div class="title">${escapeHtml(update.title)}</div><p>${escapeHtml(update.description || "")}</p><div class="meta">${escapeHtml(toBrazilianDate(update.createdAt))} · ${escapeHtml(update.approvalStatus)}</div></div>`
          )
          .join("") || "<p>Nenhuma atualização registrada.</p>"
      }
    </section>

    <section>
      <h2>Pendências</h2>
      ${
        project.actionItems
          .map(
            (item) =>
              `<div class="item"><div class="title">${escapeHtml(item.title)}</div><div class="meta">${escapeHtml(item.status)} · ${escapeHtml(item.targetRole)} · ${escapeHtml(toBrazilianDate(item.dueDate)) || "Sem prazo"}</div></div>`
          )
          .join("") || "<p>Nenhuma pendência registrada.</p>"
      }
    </section>

    <section>
      <h2>Versões</h2>
      ${
        project.versions
          .map(
            (version) =>
              `<div class="item"><div class="title">${escapeHtml(version.name)}</div><p>${escapeHtml(version.description || "")}</p><div class="meta">${escapeHtml(toBrazilianDate(version.createdAt))}${version.deployUrl ? ` · ${escapeHtml(version.deployUrl)}` : ""}</div></div>`
          )
          .join("") || "<p>Nenhuma versão registrada.</p>"
      }
    </section>
  </main>
  <script>window.addEventListener("load", () => setTimeout(() => window.print(), 250));</script>
</body>
</html>`

    return {
      success: true,
      filename: `resumo-${safeProjectName || project.id}.html`,
      html,
    }
  } catch (error) {
    logger.error({ error }, "Export Project Summary HTML Error")
    return { success: false, error: "Erro ao exportar resumo do projeto" }
  }
}

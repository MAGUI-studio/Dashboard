import * as React from "react"

import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { ApprovalStatus } from "@/src/generated/client/enums"
import { auth } from "@clerk/nextjs/server"
import {
  CheckCircle,
  ClockCountdown,
  Files,
  NotePencil,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr"

import { ClientActionBanner } from "@/src/components/client/ClientActionBanner"
import { ClientFeatureLink } from "@/src/components/client/ClientFeatureLink"
import { ClientLandingHero } from "@/src/components/client/ClientLandingHero"
import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"

import { getClientProjectById } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { toHref } from "@/src/lib/utils/navigation"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) return <div />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) return <div />

  const project = await getClientProjectById(id, user.id)

  if (!project) {
    return notFound()
  }

  const tStatus = await getTranslations("Dashboard.status")
  const statusLabel = tStatus(project.status)
  const pendingApprovals = project.updates.filter(
    (update) =>
      update.requiresApproval &&
      update.approvalStatus === ApprovalStatus.PENDING
  )
  const clientTasks =
    project.actionItems?.filter((item) => item.targetRole === "CLIENT") ?? []
  const latestUpdate = project.updates[0]
  const primaryHref =
    pendingApprovals[0] !== undefined
      ? toHref(`/projects/${project.id}/approvals`)
      : clientTasks[0] !== undefined
        ? toHref(`/projects/${project.id}/tasks`)
        : toHref(`/projects/${project.id}/timeline`)

  return (
    <div className="flex flex-col gap-12">
      <ClientLandingHero
        eyebrow="Projeto em andamento"
        title={project.name}
        description={
          project.description ??
          "Veja o momento atual do projeto, acompanhe entregas e resolva o que precisar da sua atencao."
        }
        statusLabel={statusLabel}
        variant="project"
        primaryAction={{
          label:
            pendingApprovals.length > 0
              ? "Revisar entrega"
              : clientTasks.length > 0
                ? "Responder solicitacao"
                : "Ver historico",
          href: primaryHref,
        }}
        secondaryAction={{
          label: "Abrir arquivos",
          href: toHref(`/projects/${project.id}/files`),
        }}
        metrics={[
          {
            label: "Progresso",
            value: `${project.progress}%`,
            detail: "concluido",
          },
          {
            label: "Validar",
            value: String(pendingApprovals.length),
            detail: "entregas pendentes",
          },
          {
            label: "Prazo",
            value: project.deadline
              ? new Date(project.deadline).toLocaleDateString("pt-BR")
              : "Aberto",
            detail: "data combinada",
          },
        ]}
      />

      {(pendingApprovals.length > 0 || clientTasks.length > 0) && (
        <ClientActionBanner
          type={pendingApprovals.length > 0 ? "approval" : "task"}
          eyebrow="Precisa da sua atencao"
          title={pendingApprovals[0]?.title ?? clientTasks[0]?.title ?? ""}
          description={
            pendingApprovals.length > 0
              ? "Tem uma entrega pronta para sua validacao. Aprove ou peca ajuste para o time seguir."
              : "Tem uma solicitacao aberta para destravar a proxima etapa do projeto."
          }
          href={primaryHref}
          label={
            pendingApprovals.length > 0
              ? "Revisar agora"
              : "Responder solicitacao"
          }
          projectName={project.name}
        />
      )}

      <section className="grid gap-6">
        <ClientSectionHeader
          eyebrow="Agora"
          title="O que aconteceu por ultimo"
          description="O resumo rapido para voce entender o movimento mais recente sem abrir o historico completo."
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="rounded-[2rem] border border-border/25 bg-muted/5 p-6 lg:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">
              Ultima atualizacao
            </p>
            <h2 className="mt-4 font-heading text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">
              {latestUpdate?.title ?? "Primeira atualizacao em breve"}
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/75 sm:text-base">
              {latestUpdate?.description ??
                "Assim que a equipe publicar novidades, elas aparecem aqui com contexto e proximos passos."}
            </p>
          </article>

          <div className="grid gap-3">
            <div className="rounded-[1.5rem] border border-border/25 bg-background p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
                Arquivos
              </p>
              <p className="mt-2 font-heading text-4xl font-black leading-none">
                {project.assets.length}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/25 bg-background p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
                Updates
              </p>
              <p className="mt-2 font-heading text-4xl font-black leading-none">
                {project.updates.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6">
        <ClientSectionHeader
          eyebrow="Explore"
          title="Tudo do projeto em secoes simples"
          description="Cada area abre uma parte da jornada: entregas, materiais, briefing, historico e pendencias."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ClientFeatureLink
            title="Entregas para validar"
            description="Aprove ou peca ajustes nas entregas que precisam da sua decisao."
            href={toHref(`/projects/${project.id}/approvals`)}
            icon={CheckCircle}
            meta={`${pendingApprovals.length} pendente(s)`}
          />
          <ClientFeatureLink
            title="Materiais e arquivos"
            description="Acesse documentos, imagens e arquivos finais enviados pela equipe."
            href={toHref(`/projects/${project.id}/files`)}
            icon={Files}
            meta={`${project.assets.length} item(ns)`}
          />
          <ClientFeatureLink
            title="Historico do projeto"
            description="Veja as atualizacoes como uma historia de progresso."
            href={toHref(`/projects/${project.id}/timeline`)}
            icon={ClockCountdown}
            meta={`${project.updates.length} update(s)`}
          />
          <ClientFeatureLink
            title="Alinhamento"
            description="Revise briefing, referencias e respostas importantes."
            href={toHref(`/projects/${project.id}/briefing`)}
            icon={NotePencil}
            meta="briefing"
          />
          <ClientFeatureLink
            title="Solicitacoes"
            description="Resolva pendencias que dependem da sua resposta."
            href={toHref(`/projects/${project.id}/tasks`)}
            icon={ShieldCheck}
            meta={`${clientTasks.length} aberta(s)`}
          />
        </div>
      </section>
    </div>
  )
}

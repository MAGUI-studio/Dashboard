import * as React from "react"

import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"
import {
  CheckCircleIcon,
  ClockCountdownIcon,
  FilesIcon,
  NotePencilIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/dist/ssr"

import { ClientActionBanner } from "@/src/components/client/ClientActionBanner"
import { ClientFeatureLink } from "@/src/components/client/ClientFeatureLink"
import { ClientLandingHero } from "@/src/components/client/ClientLandingHero"
import { ClientSectionHeader } from "@/src/components/client/ClientSectionHeader"

import { getClientProjectOverview } from "@/src/lib/client-projects"
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

  const project = await getClientProjectOverview(id, user.id)

  if (!project) {
    return notFound()
  }

  const tStatus = await getTranslations("Dashboard.status")
  const statusLabel = tStatus(project.status)
  const pendingApprovals = project.updates
  const clientTasks = project.actionItems ?? []
  const primaryHref =
    pendingApprovals[0] !== undefined
      ? toHref(`/projects/${project.id}/approvals`)
      : clientTasks[0] !== undefined
        ? toHref(`/projects/${project.id}/tasks`)
        : toHref(`/projects/${project.id}/timeline`)

  return (
    <div className="flex flex-col gap-10 lg:gap-12">
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
          eyebrow="Explore"
          title="Tudo do projeto em secoes simples"
          description="Cada area abre uma parte da jornada: entregas, materiais, briefing, historico e pendencias."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <ClientFeatureLink
            title="Entregas para validar"
            description="Aprove ou peca ajustes nas entregas que precisam da sua decisao."
            href={toHref(`/projects/${project.id}/approvals`)}
            icon={CheckCircleIcon}
            meta={`${pendingApprovals.length} pendente(s)`}
          />
          <ClientFeatureLink
            title="Materiais e arquivos"
            description="Acesse documentos, imagens e arquivos finais enviados pela equipe."
            href={toHref(`/projects/${project.id}/files`)}
            icon={FilesIcon}
            meta={`${project._count.assets} item(ns)`}
          />
          <ClientFeatureLink
            title="Historico do projeto"
            description="Veja as atualizacoes como uma historia de progresso."
            href={toHref(`/projects/${project.id}/timeline`)}
            icon={ClockCountdownIcon}
            meta={`${project._count.updates} update(s)`}
          />
          <ClientFeatureLink
            title="Alinhamento"
            description="Revise briefing, referencias e respostas importantes."
            href={toHref(`/projects/${project.id}/briefing`)}
            icon={NotePencilIcon}
            meta="briefing"
          />
          <ClientFeatureLink
            title="Solicitacoes"
            description="Resolva pendencias que dependem da sua resposta."
            href={toHref(`/projects/${project.id}/tasks`)}
            icon={ShieldCheckIcon}
            meta={`${project._count.actionItems} aberta(s)`}
          />
        </div>
      </section>
    </div>
  )
}

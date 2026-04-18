import { NotificationType } from "@/src/generated/client/enums"

export type NotificationPresentation = {
  categoryLabel: string
  emphasisLabel: string
  requiresAction: boolean
  cardClassName: string
  categoryClassName: string
  emphasisClassName: string
}

export function getNotificationPresentation(
  type: NotificationType
): NotificationPresentation {
  switch (type) {
    case NotificationType.UPDATE_PENDING_APPROVAL:
      return {
        categoryLabel: "Ação do cliente",
        emphasisLabel: "Requer aprovação",
        requiresAction: true,
        cardClassName:
          "border-amber-400/25 bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(10,10,10,0.78))] shadow-lg shadow-amber-500/10",
        categoryClassName:
          "border border-amber-400/20 bg-amber-400/10 text-amber-200",
        emphasisClassName: "bg-amber-400 text-zinc-950",
      }
    case NotificationType.UPDATE_REJECTED:
      return {
        categoryLabel: "Ação do admin",
        emphasisLabel: "Ajustes solicitados",
        requiresAction: true,
        cardClassName:
          "border-orange-400/25 bg-[linear-gradient(135deg,rgba(251,146,60,0.12),rgba(10,10,10,0.78))] shadow-lg shadow-orange-500/10",
        categoryClassName:
          "border border-orange-400/20 bg-orange-400/10 text-orange-200",
        emphasisClassName: "bg-orange-400 text-zinc-950",
      }
    case NotificationType.BRIEFING_SUBMITTED:
      return {
        categoryLabel: "Novo briefing",
        emphasisLabel: "Revisar conteúdo",
        requiresAction: true,
        cardClassName:
          "border-sky-400/25 bg-[linear-gradient(135deg,rgba(56,189,248,0.12),rgba(10,10,10,0.78))] shadow-lg shadow-sky-500/10",
        categoryClassName:
          "border border-sky-400/20 bg-sky-400/10 text-sky-200",
        emphasisClassName: "bg-sky-400 text-zinc-950",
      }
    case NotificationType.UPDATE_APPROVED:
      return {
        categoryLabel: "Validação concluída",
        emphasisLabel: "Aprovado",
        requiresAction: false,
        cardClassName:
          "border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(10,10,10,0.76))]",
        categoryClassName:
          "border border-emerald-400/15 bg-emerald-400/10 text-emerald-200",
        emphasisClassName: "bg-emerald-400/15 text-emerald-200",
      }
    case NotificationType.UPDATE_PUBLISHED:
      return {
        categoryLabel: "Atualização",
        emphasisLabel: "Informativo",
        requiresAction: false,
        cardClassName:
          "border-brand-primary/20 bg-[linear-gradient(135deg,rgba(0,149,255,0.10),rgba(10,10,10,0.76))]",
        categoryClassName:
          "border border-brand-primary/15 bg-brand-primary/10 text-brand-primary",
        emphasisClassName: "bg-brand-primary/12 text-brand-primary",
      }
    case NotificationType.PROJECT_STATUS_CHANGED:
      return {
        categoryLabel: "Projeto",
        emphasisLabel: "Status atualizado",
        requiresAction: false,
        cardClassName: "border-border/30 bg-background/40",
        categoryClassName:
          "border border-border/20 bg-background/60 text-muted-foreground/80",
        emphasisClassName: "bg-background/60 text-muted-foreground/80",
      }
    case NotificationType.ASSET_UPLOADED:
      return {
        categoryLabel: "Arquivo",
        emphasisLabel: "Novo material",
        requiresAction: false,
        cardClassName: "border-border/30 bg-background/40",
        categoryClassName:
          "border border-border/20 bg-background/60 text-muted-foreground/80",
        emphasisClassName: "bg-background/60 text-muted-foreground/80",
      }
    case NotificationType.LEAD_ASSIGNED:
      return {
        categoryLabel: "CRM",
        emphasisLabel: "Lead atribuído",
        requiresAction: true,
        cardClassName:
          "border-fuchsia-400/20 bg-[linear-gradient(135deg,rgba(217,70,239,0.10),rgba(10,10,10,0.78))]",
        categoryClassName:
          "border border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200",
        emphasisClassName: "bg-fuchsia-400/15 text-fuchsia-200",
      }
    default:
      return {
        categoryLabel: "Notificação",
        emphasisLabel: "Informativo",
        requiresAction: false,
        cardClassName: "border-border/30 bg-background/40",
        categoryClassName:
          "border border-border/20 bg-background/60 text-muted-foreground/80",
        emphasisClassName: "bg-background/60 text-muted-foreground/80",
      }
  }
}

"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Prisma } from "@/src/generated/client"
import { ArrowLeft, ChatCircleDots, Plus, Scales } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"

import {
  createThreadAction,
  resolveMessageAction,
  sendMessageAction,
} from "@/src/lib/actions/communication.actions"
import { cn } from "@/src/lib/utils/utils"

import { DecisionCard, DecisionItem } from "./DecisionCard"
import { DecisionForm } from "./DecisionForm"
import { MessageBubble } from "./MessageBubble"
import { MessageComposer } from "./MessageComposer"
import { ThreadList } from "./ThreadList"

interface ProjectCommunicationProps {
  projectId: string
  initialThreads: Prisma.ThreadGetPayload<{
    include: {
      messages: {
        include: {
          author: true
          resolvedBy: true
        }
      }
    }
  }>[]
  initialDecisions: DecisionItem[]
  currentUserId: string
  userRole: "ADMIN" | "CLIENT" | "MEMBER"
}

interface SendMessageData {
  content: string
  type: string
  requiresResponse: boolean
  attachments: MessageAttachment[]
}

export function ProjectCommunication({
  projectId,
  initialThreads,
  initialDecisions,
  currentUserId,
  userRole,
}: ProjectCommunicationProps) {
  const t = useTranslations("Communication")
  const [activeThreadId, setActiveThreadId] = React.useState<
    string | undefined
  >(initialThreads.length > 0 ? initialThreads[0].id : undefined)
  const [isMobileView, setIsMobileView] = React.useState(false)
  const [showThreadList, setShowThreadList] = React.useState(true)
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = React.useState(false)

  const activeThread = initialThreads.find(
    (thread) => thread.id === activeThreadId
  )

  const handleSendMessage = async (data: SendMessageData) => {
    if (!activeThreadId) return

    const result = await sendMessageAction({
      threadId: activeThreadId,
      content: data.content,
      type: data.type as
        | "INFORMATIVE"
        | "REQUIRES_RESPONSE"
        | "REQUIRES_APPROVAL"
        | "REQUIRES_ASSET"
        | "FINANCIAL"
        | "LEGAL"
        | "CALL_SUMMARY",
      requiresResponse: data.requiresResponse,
      attachments: data.attachments,
    })

    if (result.error) {
      toast.error(result.error)
    }
  }

  const handleResolve = async (messageId: string) => {
    const result = await resolveMessageAction({ messageId })
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Solicitação resolvida")
    }
  }

  const handleCreateThread = async () => {
    const result = await createThreadAction({
      projectId,
      entityType: "Project",
      entityId: projectId,
      title: "Nova Conversa",
    })

    if (result.success && result.threadId) {
      setActiveThreadId(result.threadId)
      toast.success("Nova conversa iniciada")
    } else {
      toast.error("Erro ao criar conversa")
    }
  }

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleThreadClick = (id: string) => {
    setActiveThreadId(id)
    if (isMobileView) {
      setShowThreadList(false)
    }
  }

  return (
    <div className="grid gap-8">
      <Tabs defaultValue="messages" className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <TabsList className="bg-muted/20 p-1 rounded-full border border-border/40">
            <TabsTrigger
              value="messages"
              className="rounded-full px-6 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <ChatCircleDots className="mr-2 size-4" />
              {t("inbox.all")}
            </TabsTrigger>
            <TabsTrigger
              value="decisions"
              className="rounded-full px-6 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Scales className="mr-2 size-4" />
              {t("inbox.decisions")}
            </TabsTrigger>
          </TabsList>

          {userRole === "ADMIN" && (
            <div className="flex items-center gap-2">
              <Dialog
                open={isDecisionDialogOpen}
                onOpenChange={setIsDecisionDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full h-9 px-4 text-[10px] font-black uppercase tracking-wider border-emerald-500/20 bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/10"
                  >
                    <Scales weight="fill" className="mr-2 size-4" />
                    {t("decisions.new")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] sm:max-w-[600px] border-border/10 bg-background/95 backdrop-blur-xl">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="font-heading text-2xl font-black uppercase tracking-tight">
                      {t("decisions.new")}
                    </DialogTitle>
                  </DialogHeader>
                  <DecisionForm
                    projectId={projectId}
                    threadId={activeThreadId}
                    onSuccess={() => setIsDecisionDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleCreateThread}
                size="sm"
                className="rounded-full h-9 px-4 text-[10px] font-black uppercase tracking-wider"
              >
                <Plus className="mr-2 size-4" />
                {t("threads.new")}
              </Button>
            </div>
          )}
        </div>

        <TabsContent
          value="messages"
          className="m-0 border-none p-0 focus-visible:ring-0"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 min-h-[600px]">
            <div
              className={cn(
                "flex flex-col gap-4",
                isMobileView && !showThreadList ? "hidden" : "flex"
              )}
            >
              <ScrollArea className="h-[600px] pr-4">
                <ThreadList
                  threads={initialThreads}
                  activeThreadId={activeThreadId}
                  onThreadClick={handleThreadClick}
                />
              </ScrollArea>
            </div>

            <div
              className={cn(
                "flex flex-col gap-6 rounded-[2rem] border border-border/40 bg-background/40 p-6 shadow-sm",
                isMobileView && showThreadList ? "hidden" : "flex"
              )}
            >
              {isMobileView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowThreadList(true)}
                  className="w-fit -ml-2 mb-2 text-[10px] font-black uppercase tracking-wider"
                >
                  <ArrowLeft className="mr-2 size-4" />
                  Voltar para conversas
                </Button>
              )}

              {activeThread ? (
                <>
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div className="space-y-1">
                      <h4 className="font-heading text-lg font-black uppercase tracking-tight text-foreground">
                        {activeThread.title ||
                          t(
                            `threads.${activeThread.entityType.toLowerCase()}_context`
                          )}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                          Status:
                        </span>
                        <Badge
                          variant="outline"
                          className="h-4 rounded-full border-brand-primary/20 bg-brand-primary/10 px-1.5 py-0 text-[8px] font-black uppercase tracking-wider text-brand-primary"
                        >
                          {activeThread.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 h-[400px] pr-4">
                    <div className="flex flex-col gap-6 py-4">
                      {activeThread.messages.length > 0 ? (
                        activeThread.messages.map((msg) => (
                          <MessageBubble
                            key={msg.id}
                            id={msg.id}
                            content={msg.content}
                            type={msg.type}
                            author={msg.author}
                            createdAt={msg.createdAt}
                            requiresResponse={msg.requiresResponse}
                            resolvedAt={msg.resolvedAt}
                            resolvedBy={msg.resolvedBy}
                            attachments={msg.attachments}
                            isOwnMessage={msg.authorId === currentUserId}
                            onResolve={handleResolve}
                          />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-4 py-12 opacity-40">
                          <ChatCircleDots className="size-12" />
                          <p className="text-[10px] font-black uppercase tracking-widest">
                            {t("messages.no_messages")}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="mt-auto pt-4 border-t border-border/40">
                    <MessageComposer onSend={handleSendMessage} />
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 py-12 opacity-30 text-center">
                  <div className="flex size-16 items-center justify-center rounded-3xl bg-muted/20">
                    <ChatCircleDots className="size-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-heading text-xl font-black uppercase tracking-tight text-foreground">
                      Selecione uma conversa
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Escolha uma thread ao lado para ver as mensagens.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="decisions"
          className="m-0 border-none p-0 focus-visible:ring-0"
        >
          <div className="grid gap-6">
            <div className="flex flex-col gap-1 mb-2">
              <h3 className="font-heading text-2xl font-black uppercase tracking-tight text-foreground">
                {t("decisions.title")}
              </h3>
              <p className="text-sm font-medium text-muted-foreground/60">
                {t("decisions.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialDecisions.length > 0 ? (
                initialDecisions.map((decision) => (
                  <DecisionCard key={decision.id} decision={decision} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-dashed border-border/30 bg-muted/5 py-20 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/10 text-muted-foreground/40">
                    <Scales weight="fill" className="size-6" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                    Nenhuma decisão formal registrada.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

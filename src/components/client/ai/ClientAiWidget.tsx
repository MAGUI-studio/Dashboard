"use client"

import * as React from "react"

import {
  ArrowClockwise,
  ChatCircleDots,
  PaperPlaneTilt,
  Robot,
  Sparkle,
  User,
  X,
} from "@phosphor-icons/react"
import { useChat } from "ai/react"
import { AnimatePresence, motion } from "framer-motion"
import ReactMarkdown from "react-markdown"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { ScrollArea } from "@/src/components/ui/scroll-area"

import { cn } from "@/src/lib/utils/utils"

interface ClientAiWidgetProps {
  projectId: string
  contactName: string
}

export function ClientAiWidget({
  projectId,
  contactName,
}: ClientAiWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/client-ai/chat",
    body: { projectId },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Olá, ${contactName}! Sou o assistente da MAGUI. Como posso ajudar com seu projeto hoje?`,
      },
    ],
  })

  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const suggestions = [
    "Qual o status atual?",
    "Quais minhas pendências?",
    "Resumo financeiro",
    "Próximos passos",
  ]

  const handleSuggestionClick = (suggestion: string) => {
    // Manually trigger chat with suggestion
    const event = {
      target: { value: suggestion },
      preventDefault: () => {},
    } as unknown as React.ChangeEvent<HTMLInputElement>
    handleInputChange(event)
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-[2.5rem] border border-border/10 bg-background/95 shadow-2xl backdrop-blur-xl ring-1 ring-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-brand-primary/5 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <Sparkle weight="fill" className="size-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black uppercase tracking-tight">
                    MAGUI AI
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                    Online e Contextual
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="size-10 rounded-full hover:bg-muted/20"
              >
                <X className="size-5" />
              </Button>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 px-8 py-4" ref={scrollRef}>
              <div className="flex flex-col gap-6 py-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex gap-4",
                      m.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-xl border",
                        m.role === "user"
                          ? "bg-muted/10 border-border/40"
                          : "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
                      )}
                    >
                      {m.role === "user" ? (
                        <User weight="bold" className="size-4" />
                      ) : (
                        <Robot weight="fill" className="size-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-[1.5rem] p-4 text-sm leading-relaxed",
                        m.role === "user"
                          ? "bg-brand-primary text-white rounded-tr-none"
                          : "bg-muted/40 text-foreground rounded-tl-none border border-border/20"
                      )}
                    >
                      <ReactMarkdown className="prose prose-sm dark:prose-invert">
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 px-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 animate-pulse">
                    Pensando estrategicamente...
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Suggestions */}
            {messages.length < 3 && (
              <div className="flex flex-wrap gap-2 px-8 py-4 border-t border-border/10 bg-muted/5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestionClick(s)}
                    className="rounded-full border border-border/40 bg-background px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:border-brand-primary hover:text-brand-primary transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Footer / Input */}
            <div className="p-8 border-t border-border/10 bg-background/50">
              <form
                onSubmit={handleSubmit}
                className="relative flex items-center"
              >
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Pergunte sobre seu projeto..."
                  className="h-14 rounded-full border-border/40 bg-muted/10 pl-8 pr-16 text-sm font-bold shadow-none focus-visible:ring-1 focus-visible:ring-brand-primary/20"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-2 size-10 rounded-full bg-brand-primary text-white shadow-xl shadow-brand-primary/20 transition-all hover:scale-[1.05]"
                  disabled={!input.trim() || isLoading}
                >
                  <PaperPlaneTilt weight="fill" className="size-5" />
                </Button>
              </form>
              <div className="mt-4 flex items-center justify-center gap-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                <button
                  onClick={() => setMessages([])}
                  className="hover:text-foreground flex items-center gap-1.5"
                >
                  <ArrowClockwise className="size-3" /> Limpar Histórico
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex size-16 items-center justify-center rounded-3xl text-white shadow-2xl transition-all duration-500",
          isOpen
            ? "bg-slate-900 rotate-90"
            : "bg-brand-primary shadow-brand-primary/20"
        )}
      >
        {isOpen ? (
          <X weight="bold" className="size-6" />
        ) : (
          <ChatCircleDots weight="fill" className="size-8" />
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-black border-4 border-background shadow-lg">
            1
          </span>
        )}
      </motion.button>
    </div>
  )
}

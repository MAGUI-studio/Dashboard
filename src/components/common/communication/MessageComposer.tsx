"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { PaperPlaneTilt, Paperclip } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"

import { MessageAttachment } from "./MessageBubble"

interface MessageComposerProps {
  onSend: (data: {
    content: string
    type: string
    requiresResponse: boolean
    attachments: MessageAttachment[]
  }) => Promise<void>
  disabled?: boolean
  showTypeSelector?: boolean
}

export function MessageComposer({
  onSend,
  disabled,
  showTypeSelector = true,
}: MessageComposerProps) {
  const t = useTranslations("Communication.messages")
  const [content, setContent] = React.useState("")
  const [type, setType] = React.useState("INFORMATIVE")
  const [requiresResponse, setRequiresResponse] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSend({
        content: content.trim(),
        type,
        requiresResponse,
        attachments: [],
      })
      setContent("")
      setRequiresResponse(false)
      setType("INFORMATIVE")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-[2rem] border border-border/40 bg-muted/20 p-4"
    >
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("placeholder")}
        className="min-h-[100px] border-none bg-transparent p-0 text-sm focus-visible:ring-0 resize-none shadow-none"
        disabled={disabled || isSubmitting}
      />

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-3">
        <div className="flex items-center gap-4">
          {showTypeSelector && (
            <Select
              value={type}
              onValueChange={setType}
              disabled={disabled || isSubmitting}
            >
              <SelectTrigger className="h-8 w-[160px] rounded-full border-border/40 bg-background/50 text-[9px] font-black uppercase tracking-wider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INFORMATIVE">{t("informative")}</SelectItem>
                <SelectItem value="REQUIRES_RESPONSE">
                  {t("requires_response")}
                </SelectItem>
                <SelectItem value="REQUIRES_APPROVAL">
                  {t("requires_approval")}
                </SelectItem>
                <SelectItem value="REQUIRES_ASSET">
                  {t("requires_asset")}
                </SelectItem>
                <SelectItem value="FINANCIAL">{t("financial")}</SelectItem>
                <SelectItem value="LEGAL">{t("legal")}</SelectItem>
                <SelectItem value="CALL_SUMMARY">
                  {t("call_summary")}
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="requires-response"
              checked={requiresResponse}
              onCheckedChange={(checked) => setRequiresResponse(!!checked)}
              disabled={disabled || isSubmitting}
            />
            <Label
              htmlFor="requires-response"
              className="text-[9px] font-black uppercase tracking-wider text-muted-foreground cursor-pointer"
            >
              {t("requires_response")}
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-full border-border/40 bg-background/50"
            disabled={disabled || isSubmitting}
          >
            <Paperclip className="size-4" />
          </Button>

          <Button
            type="submit"
            className="h-8 rounded-full px-4 text-[9px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20"
            disabled={!content.trim() || disabled || isSubmitting}
          >
            {isSubmitting ? (
              <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                {t("send")}
                <PaperPlaneTilt weight="fill" className="ml-2 size-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

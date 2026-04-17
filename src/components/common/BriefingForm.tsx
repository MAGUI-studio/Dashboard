'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { 
  ChatTeardropText, 
  Link as LinkIcon, 
  Target,
  ArrowRight,
  ArrowLeft,
  CircleNotch,
  CheckCircle
} from '@phosphor-icons/react'
import { toast } from 'sonner'

import { Button } from '@/src/components/ui/button'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import { updateProjectBriefingAction } from '@/src/lib/actions/project.actions'

interface BriefingFormProps {
  projectId: string
}

export function BriefingForm({ projectId }: BriefingFormProps): React.JSX.Element {
  const t = useTranslations('Briefing')
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    tone: '',
    references: '',
    goals: '',
  })

  const totalSteps = 3

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    const result = await updateProjectBriefingAction(projectId, formData)
    
    if (result.success) {
      toast.success(t('success'))
      setIsFinished(true)
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } else {
      toast.error('Erro ao enviar briefing')
    }
    setIsLoading(false)
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-12 text-center bg-background/50 backdrop-blur-xl rounded-3xl border border-brand-primary/20 shadow-2xl">
        <div className="size-20 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
          <CheckCircle size={40} weight="fill" className="animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tight">{t('success')}</h2>
          <p className="text-muted-foreground">Redirecionando para o seu painel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-8 md:p-12 bg-background/50 backdrop-blur-xl rounded-3xl border border-border/60 shadow-2xl max-w-3xl mx-auto">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-brand-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
            Onboarding Protocol
          </span>
        </div>
        <h2 className="text-4xl font-black uppercase tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground text-sm">{t('description')}</p>
        
        <div className="flex items-center gap-2 pt-4">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-primary transition-all duration-500 ease-out" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {t('step', { current: step, total: totalSteps })}
          </span>
        </div>
      </header>

      <div className="min-h-[200px] flex flex-col justify-center">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <Label htmlFor="tone" className="text-lg font-bold flex items-center gap-3">
              <ChatTeardropText size={24} className="text-brand-primary" weight="duotone" />
              {t('questions.tone')}
            </Label>
            <Textarea
              id="tone"
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
              className="min-h-[150px] rounded-2xl border-border/40 bg-muted/10 p-6 text-base focus:bg-muted/20"
              placeholder="Ex: Profissional, Minimalista, Autoritário..."
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <Label htmlFor="references" className="text-lg font-bold flex items-center gap-3">
              <LinkIcon size={24} className="text-brand-primary" weight="duotone" />
              {t('questions.references')}
            </Label>
            <Textarea
              id="references"
              value={formData.references}
              onChange={(e) => setFormData({ ...formData, references: e.target.value })}
              className="min-h-[150px] rounded-2xl border-border/40 bg-muted/10 p-6 text-base focus:bg-muted/20"
              placeholder="Cole aqui links de sites que servem de inspiração..."
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <Label htmlFor="goals" className="text-lg font-bold flex items-center gap-3">
              <Target size={24} className="text-brand-primary" weight="duotone" />
              {t('questions.goals')}
            </Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              className="min-h-[150px] rounded-2xl border-border/40 bg-muted/10 p-6 text-base focus:bg-muted/20"
              placeholder="O que o site precisa converter? Vendas, agendamentos, autoridade?"
            />
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between pt-4 border-t border-border/40">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={step === 1 || isLoading}
          className="rounded-full px-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Voltar
        </Button>

        {step < totalSteps ? (
          <Button
            onClick={handleNext}
            className="rounded-full px-8 bg-brand-primary hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20"
          >
            Próximo
            <ArrowRight size={18} className="ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="rounded-full px-12 bg-brand-primary hover:bg-brand-primary/90 shadow-xl shadow-brand-primary/20 font-black uppercase tracking-widest text-xs"
          >
            {isLoading ? (
              <CircleNotch size={18} className="animate-spin mr-2" />
            ) : null}
            {t('submit')}
          </Button>
        )}
      </footer>
    </div>
  )
}

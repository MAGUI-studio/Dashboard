"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import {
  AssetOrigin,
  AssetType,
  AssetVisibility,
} from "@/src/generated/client/enums"
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Clock,
  DotsSixVertical,
  Eye,
  EyeSlash,
  File,
  Plus,
  Trash,
  UploadSimple,
  User,
  Warning,
  X,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"

import {
  createProjectAssetAction,
  deleteProjectAssetAction,
  updateProjectAssetsOrderAction,
} from "@/src/lib/actions/project.actions"
import { useUploadThing } from "@/src/lib/uploadthing"
import { formatLocalTime } from "@/src/lib/utils/utils"

interface Asset {
  id: string
  name: string
  url: string
  key: string
  type: AssetType
  order: number
  timezone: string
  origin: AssetOrigin
  visibility: AssetVisibility
  createdAt: Date | string
}

interface AssetManagementProps {
  projectId: string
  assets: Asset[]
}

function SortableAssetItem({
  asset,
  index,
  onDelete,
  isDeleting,
}: {
  asset: Asset
  index: number
  onDelete: (id: string, key: string) => void
  isDeleting: boolean
}) {
  const t = useTranslations("Admin.projects.details")
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: asset.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={React.useMemo(
        () =>
          `group relative flex flex-col gap-5 rounded-3xl border border-border/40 bg-background/50 p-6 transition-all hover:border-brand-primary/30 hover:bg-muted/5 ${isDragging ? "opacity-50 border-brand-primary shadow-2xl" : ""}`,
        [isDragging]
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 overflow-hidden">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-brand-primary transition-colors"
          >
            <DotsSixVertical weight="bold" className="size-5" />
          </div>
          <div className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <File weight="duotone" className="size-6" />
            <div className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-brand-primary font-heading text-[10px] font-black text-white shadow-lg ring-4 ring-background">
              {index + 1}
            </div>
          </div>
          <div className="flex flex-col overflow-hidden gap-1">
            <span className="truncate text-xs font-black uppercase tracking-tight text-foreground">
              {asset.name}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[7px] font-black uppercase tracking-widest ${asset.origin === AssetOrigin.CLIENT ? "bg-amber-500/10 text-amber-600" : "bg-brand-primary/10 text-brand-primary"}`}
              >
                <User weight="fill" className="size-2.5" />
                {asset.origin === AssetOrigin.CLIENT ? "Cliente" : "Time"}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[7px] font-black uppercase tracking-widest ${asset.visibility === AssetVisibility.CLIENT ? "bg-green-500/10 text-green-600" : "bg-muted/20 text-muted-foreground"}`}
              >
                {asset.visibility === AssetVisibility.CLIENT ? (
                  <Eye weight="fill" className="size-2.5" />
                ) : (
                  <EyeSlash weight="fill" className="size-2.5" />
                )}
                {asset.visibility === AssetVisibility.CLIENT
                  ? "Publico"
                  : "Interno"}
              </span>
            </div>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-xl text-muted-foreground/40 hover:bg-red-600/10 hover:text-red-600 transition-all"
              disabled={isDeleting}
            >
              <Trash weight="bold" className="size-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl border-none bg-background/95 p-0 overflow-hidden rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
            <div className="bg-red-600/10 p-10 pb-6">
              <DialogHeader className="gap-5">
                <div className="flex size-16 items-center justify-center rounded-[1.25rem] bg-red-600 text-white shadow-xl shadow-red-600/20">
                  <Warning weight="bold" className="size-8" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <DialogTitle className="font-heading text-3xl font-black uppercase tracking-tight text-red-600 leading-none">
                    {t("delete_asset_confirm_title")}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-black text-red-600/60 uppercase tracking-[0.2em]">
                    Ação Irreversível e Permanente
                  </DialogDescription>
                </div>
              </DialogHeader>
            </div>

            <div className="p-10 pt-6">
              <p className="mb-10 text-base font-medium leading-relaxed text-muted-foreground/80">
                {t("delete_asset_confirm_desc")}
              </p>

              <div className="mb-10 flex items-center gap-4 rounded-[1.5rem] border border-border/40 bg-muted/5 p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-muted/10 text-muted-foreground">
                  <File weight="duotone" className="size-6" />
                </div>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    Arquivo Selecionado
                  </span>
                  <span className="truncate text-sm font-black text-foreground uppercase">
                    {asset.name}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-16 rounded-[1.25rem] font-sans font-black uppercase tracking-widest text-muted-foreground transition-all hover:bg-muted/10 hover:text-foreground"
                  >
                    {t("cancel")}
                  </Button>
                </DialogTrigger>
                <Button
                  className="h-16 rounded-[1.25rem] bg-red-600 font-sans font-black uppercase tracking-widest text-white shadow-xl shadow-red-600/20 transition-all hover:bg-red-700 active:scale-[0.98]"
                  onClick={() => onDelete(asset.id, asset.key)}
                  disabled={isDeleting}
                >
                  {isDeleting ? t("deleting") : t("confirm_delete")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-auto flex items-end justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 rounded-xl bg-muted/10 px-3 py-1.5">
          <Clock weight="bold" className="size-3 text-muted-foreground/30" />
          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter">
            {formatLocalTime(new Date(asset.createdAt), asset.timezone)}
          </span>
        </div>

        <a
          href={asset.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 items-center justify-center rounded-xl border border-brand-primary/20 bg-brand-primary/5 px-5 text-[10px] font-black uppercase tracking-widest text-brand-primary transition-all hover:bg-brand-primary hover:text-white"
        >
          {t("visualize")}
        </a>
      </div>
    </div>
  )
}

export function AssetManagement({
  projectId,
  assets: initialAssets,
}: AssetManagementProps) {
  const t = useTranslations("Admin.projects.details")
  const [assets, setAssets] = React.useState(initialAssets)
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [typeFilter, setTypeFilter] = React.useState<AssetType | "ALL">("ALL")
  const [originFilter, setOriginFilter] = React.useState<AssetOrigin | "ALL">(
    "ALL"
  )
  const [visibilityFilter, setVisibilityFilter] = React.useState<
    AssetVisibility | "ALL"
  >("ALL")
  const [uploadVisibility, setUploadVisibility] =
    React.useState<AssetVisibility>(AssetVisibility.CLIENT)

  React.useEffect(() => {
    setAssets(initialAssets)
  }, [initialAssets])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const { startUpload, isUploading } = useUploadThing("projectAsset", {
    onClientUploadComplete: async (res) => {
      if (res) {
        for (const file of res) {
          await createProjectAssetAction({
            projectId,
            name: file.name,
            url: file.url,
            key: file.key,
            type: AssetType.DOCUMENT,
            origin: AssetOrigin.ADMIN,
            visibility: uploadVisibility,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          })
        }
        setSelectedFiles([])
        setIsPreviewOpen(false)
        toast.success("Upload concluido.")
      }
    },
  })

  const hasActiveFilters =
    typeFilter !== "ALL" || originFilter !== "ALL" || visibilityFilter !== "ALL"

  const visibleAssets = assets.filter((asset) => {
    if (typeFilter !== "ALL" && asset.type !== typeFilter) return false
    if (originFilter !== "ALL" && asset.origin !== originFilter) return false
    if (visibilityFilter !== "ALL" && asset.visibility !== visibilityFilter) {
      return false
    }

    return true
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(files)
      setIsPreviewOpen(true)
    }
  }

  const handleDelete = async (id: string, key: string) => {
    setIsDeleting(id)
    await deleteProjectAssetAction(id, projectId, key)
    setIsDeleting(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    if (hasActiveFilters) return

    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = assets.findIndex((item) => item.id === active.id)
      const newIndex = assets.findIndex((item) => item.id === over.id)

      const newAssets = arrayMove(assets, oldIndex, newIndex)
      setAssets(newAssets)

      await updateProjectAssetsOrderAction(
        projectId,
        newAssets.map((a) => a.id)
      )
    }
  }

  const removeSelectedFile = (index: number) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)
    setSelectedFiles(newFiles)
    if (newFiles.length === 0) {
      setIsPreviewOpen(false)
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-3 rounded-[1.5rem] border border-border/30 bg-background/45 p-4 md:grid-cols-4">
        <div className="space-y-1 md:col-span-1">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
            Arquivos
          </p>
          <p className="text-sm font-medium text-muted-foreground/65">
            {visibleAssets.length} de {assets.length} exibidos
          </p>
        </div>

        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as AssetType | "ALL")
          }
          className="h-11 rounded-full border border-border/35 bg-background px-4 text-xs font-bold outline-none focus:border-brand-primary"
        >
          <option value="ALL">Todos os tipos</option>
          <option value={AssetType.CONTRACT}>Contrato</option>
          <option value={AssetType.DESIGN_SYSTEM}>Design system</option>
          <option value={AssetType.IMAGE}>Imagem</option>
          <option value={AssetType.DOCUMENT}>Documento</option>
          <option value={AssetType.SOURCE_CODE}>Código-fonte</option>
        </select>

        <select
          value={originFilter}
          onChange={(event) =>
            setOriginFilter(event.target.value as AssetOrigin | "ALL")
          }
          className="h-11 rounded-full border border-border/35 bg-background px-4 text-xs font-bold outline-none focus:border-brand-primary"
        >
          <option value="ALL">Todas as origens</option>
          <option value={AssetOrigin.ADMIN}>Time interno</option>
          <option value={AssetOrigin.CLIENT}>Cliente</option>
        </select>

        <select
          value={visibilityFilter}
          onChange={(event) =>
            setVisibilityFilter(event.target.value as AssetVisibility | "ALL")
          }
          className="h-11 rounded-full border border-border/35 bg-background px-4 text-xs font-bold outline-none focus:border-brand-primary"
        >
          <option value="ALL">Toda visibilidade</option>
          <option value={AssetVisibility.CLIENT}>Visível ao cliente</option>
          <option value={AssetVisibility.INTERNAL}>Interno</option>
        </select>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-4">
          {visibleAssets.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-[2rem] border-2 border-dashed border-border/20 bg-muted/5">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
                {assets.length === 0 ? t("no_assets") : "Nenhum arquivo neste filtro"}
              </p>
            </div>
          ) : (
            <SortableContext
              items={visibleAssets.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleAssets.map((asset, index) => (
                  <SortableAssetItem
                    key={asset.id}
                    asset={asset}
                    index={index}
                    onDelete={handleDelete}
                    isDeleting={isDeleting === asset.id}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </DndContext>

      <div className="flex flex-col gap-4">
        <div className="relative">
          <input
            type="file"
            multiple
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
            onChange={handleFileSelect}
            title=""
          />
          <Button className="h-20 w-full rounded-[2rem] border-2 border-dashed border-border/40 bg-muted/5 font-sans font-black uppercase tracking-[0.2em] text-muted-foreground/60 transition-all hover:border-brand-primary/40 hover:bg-brand-primary/5 hover:text-brand-primary">
            <Plus weight="bold" className="mr-3 size-6" />
            {t("upload_button")}
          </Button>
        </div>
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
          {t("upload_hint")}
        </p>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl border-none bg-background/95 p-0 overflow-hidden rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
          <div className="bg-brand-primary/10 p-10 pb-6">
            <DialogHeader className="gap-5">
              <div className="flex size-16 items-center justify-center rounded-[1.25rem] bg-brand-primary text-white shadow-xl shadow-brand-primary/20">
                <UploadSimple weight="bold" className="size-8" />
              </div>
              <div className="flex flex-col gap-1.5">
                <DialogTitle className="font-heading text-3xl font-black uppercase tracking-tight text-brand-primary leading-none">
                  Confirmar Upload
                </DialogTitle>
                <DialogDescription className="text-xs font-black text-brand-primary/60 uppercase tracking-[0.2em]">
                  Processamento de Arquivos
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>

          <div className="p-10 pt-6">
            <div className="mb-8 flex flex-col gap-4">
              <p className="text-base font-medium leading-relaxed text-muted-foreground/80">
                Revise os arquivos selecionados e defina a visibilidade antes de
                enviar.
              </p>

              <div className="flex items-center gap-2 rounded-2xl bg-muted/10 p-2">
                <Button
                  variant={
                    uploadVisibility === AssetVisibility.CLIENT
                      ? "default"
                      : "ghost"
                  }
                  className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setUploadVisibility(AssetVisibility.CLIENT)}
                >
                  <Eye className="mr-2 size-4" />
                  Visivel p/ Cliente
                </Button>
                <Button
                  variant={
                    uploadVisibility === AssetVisibility.INTERNAL
                      ? "default"
                      : "ghost"
                  }
                  className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setUploadVisibility(AssetVisibility.INTERNAL)}
                >
                  <EyeSlash className="mr-2 size-4" />
                  Apenas Interno
                </Button>
              </div>
            </div>

            <div className="mb-10 flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-[1.25rem] border border-border/40 bg-muted/10 p-5"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                      <File weight="duotone" className="size-6" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-xs font-black text-foreground uppercase tracking-tight">
                        {file.name}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                    onClick={() => removeSelectedFile(index)}
                  >
                    <X weight="bold" className="size-5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <Button
                variant="ghost"
                className="h-16 rounded-[1.25rem] font-sans font-black uppercase tracking-widest text-muted-foreground transition-all hover:bg-muted/10 hover:text-foreground"
                onClick={() => {
                  setSelectedFiles([])
                  setIsPreviewOpen(false)
                }}
              >
                {t("cancel")}
              </Button>
              <Button
                className="h-16 rounded-[1.25rem] bg-brand-primary font-sans font-black uppercase tracking-widest text-white shadow-xl shadow-brand-primary/20 transition-all hover:brightness-110 active:scale-[0.98]"
                onClick={() =>
                  startUpload(selectedFiles, {
                    projectId,
                    scope: "assets",
                  } as never)
                }
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="flex items-center gap-3">
                    <div className="size-5 animate-spin rounded-full border-3 border-white/20 border-t-white" />
                    <span>{t("uploading")}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <UploadSimple weight="bold" className="size-6" />
                    <span>Confirmar</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

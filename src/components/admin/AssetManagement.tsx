"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

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
  File,
  FilePdf,
  Image as ImageIcon,
  Plus,
  Trash,
  UploadSimple,
  X,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  type: string
  order: number
  timezone: string
  createdAt: Date
}

interface AssetManagementProps {
  projectId: string
  assets: Asset[]
}

function SortableAssetItem({
  asset,
  onDelete,
  isDeleting,
}: {
  asset: Asset
  onDelete: (id: string) => void
  isDeleting: boolean
}) {
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
          `group relative flex flex-col gap-4 rounded-2xl border border-border/40 bg-background/50 p-5 transition-all hover:border-brand-primary/20 hover:bg-muted/5 ${isDragging ? "opacity-50 border-brand-primary shadow-2xl" : ""}`,
        [isDragging]
      )}
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-brand-primary"
        >
          <DotsSixVertical weight="bold" className="size-5" />
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
          <File weight="duotone" className="size-5" />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <span className="truncate text-[11px] font-bold uppercase tracking-tight text-foreground">
            {asset.name}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-widest">
              {asset.type}
            </span>
            <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
              <Clock weight="bold" className="size-2.5" />
              <span>
                {formatLocalTime(new Date(asset.createdAt), asset.timezone)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <a
          href={asset.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] font-black uppercase tracking-widest text-brand-primary hover:underline"
        >
          Visualizar
        </a>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(asset.id)}
          disabled={isDeleting}
        >
          <Trash weight="bold" className="size-4" />
        </Button>
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

  // Update local state when props change
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
            type: "DOCUMENT",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          })
        }
        setSelectedFiles([])
        setIsPreviewOpen(false)
      }
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(files)
      setIsPreviewOpen(true)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    await deleteProjectAssetAction(id, projectId)
    setIsDeleting(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = assets.findIndex((item) => item.id === active.id)
      const newIndex = assets.findIndex((item) => item.id === over.id)

      const newAssets = arrayMove(assets, oldIndex, newIndex)
      setAssets(newAssets)

      // Save new order to database
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
    <div className="flex flex-col gap-8">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-4">
          {assets.length === 0 ? (
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">
              {t("no_assets")}
            </p>
          ) : (
            <SortableContext
              items={assets.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {assets.map((asset) => (
                  <SortableAssetItem
                    key={asset.id}
                    asset={asset}
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
          <Button className="h-14 w-full rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 font-sans font-black uppercase tracking-widest text-muted-foreground/60 transition-all hover:border-brand-primary/40 hover:bg-brand-primary/5 hover:text-brand-primary">
            <Plus weight="bold" className="mr-2 size-5" />
            {t("upload_button")}
          </Button>
        </div>
        <p className="text-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
          {t("upload_hint")}
        </p>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-border/40 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-black uppercase tracking-tight">
              Confirmar Upload
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              Revise os arquivos selecionados antes de enviar para o servidor.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/10 p-4"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {file.type.startsWith("image/") ? (
                    <ImageIcon
                      weight="duotone"
                      className="size-5 text-brand-primary"
                    />
                  ) : file.type === "application/pdf" ? (
                    <FilePdf
                      weight="duotone"
                      className="size-5 text-brand-primary"
                    />
                  ) : (
                    <File
                      weight="duotone"
                      className="size-5 text-brand-primary"
                    />
                  )}
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-xs font-bold text-foreground">
                      {file.name}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground/60">
                      {file.size < 1024 * 1024
                        ? `${(file.size / 1024).toFixed(2)} KB`
                        : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeSelectedFile(index)}
                >
                  <X weight="bold" className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-8 flex gap-3">
            <Button
              variant="ghost"
              className="rounded-full font-bold uppercase tracking-widest"
              onClick={() => {
                setSelectedFiles([])
                setIsPreviewOpen(false)
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              className="rounded-full font-black uppercase tracking-widest px-8"
              onClick={() => startUpload(selectedFiles)}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  {t("uploading")}
                </>
              ) : (
                <>
                  <UploadSimple weight="bold" className="mr-2 size-5" />
                  Confirmar Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

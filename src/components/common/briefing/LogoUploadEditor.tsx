"use client"

import * as React from "react"

// Assuming uploadthing is configured
import Image from "next/image"

import { X } from "@phosphor-icons/react"

import { UploadDropzone } from "@/src/lib/uploadthing"

interface LogoUploadEditorProps {
  value: {
    primary: string | null
    secondary: string | null
  }
  onValueChange: (value: {
    primary: string | null
    secondary: string | null
  }) => void
}

export function LogoUploadEditor({
  value,
  onValueChange,
}: LogoUploadEditorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          Logo Principal (Vetor/PNG)
        </label>
        {value.primary ? (
          <div className="relative group">
            <Image
              src={value.primary}
              alt="Logo Principal"
              width={200}
              height={100}
              className="rounded-lg"
            />
            <button
              onClick={() => onValueChange({ ...value, primary: null })}
              className="absolute top-2 right-2 size-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} weight="bold" />
            </button>
          </div>
        ) : (
          <UploadDropzone
            endpoint="projectAsset"
            onClientUploadComplete={(res) => {
              if (res && res[0]) {
                onValueChange({ ...value, primary: res[0].url })
              }
            }}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`)
            }}
            className="p-8 border-border/30 ut-label:text-lg ut-allowed-content:text-muted-foreground ut-button:bg-brand-primary ut-button:ut-readying:bg-brand-primary/80"
          />
        )}
      </div>
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          Logo Secundário (Opcional)
        </label>
        {value.secondary ? (
          <div className="relative group">
            <Image
              src={value.secondary}
              alt="Logo Secundário"
              width={200}
              height={100}
              className="rounded-lg"
            />
            <button
              onClick={() => onValueChange({ ...value, secondary: null })}
              className="absolute top-2 right-2 size-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} weight="bold" />
            </button>
          </div>
        ) : (
          <UploadDropzone
            endpoint="projectAsset"
            onClientUploadComplete={(res) => {
              if (res && res[0]) {
                onValueChange({ ...value, secondary: res[0].url })
              }
            }}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`)
            }}
            className="p-8 border-border/30 ut-label:text-lg ut-allowed-content:text-muted-foreground ut-button:bg-brand-primary ut-button:ut-readying:bg-brand-primary/80"
          />
        )}
      </div>
    </div>
  )
}

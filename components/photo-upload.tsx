'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { UploadCloudIcon, XIcon, ImageIcon } from 'lucide-react'

export type PhotoItem = { url: string; publicId: string }

type PendingItem = { file: File; previewUrl: string }

type Props = {
  value: PhotoItem[]
  onChange: (items: PhotoItem[]) => void
  onPendingFiles?: (files: File[]) => void
  max?: number
  label?: string
  hint?: string
}

export default function PhotoUpload({
  value,
  onChange,
  onPendingFiles,
  max = 5,
  label = 'Add photos',
  hint = 'JPEG, PNG, WebP, HEIC · up to 10 MB',
}: Props) {
  const [pending, setPending] = useState<PendingItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const total = value.length + pending.length

  useEffect(() => {
    onPendingFiles?.(pending.map((p) => p.file))
  }, [pending]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => pending.forEach((p) => URL.revokeObjectURL(p.previewUrl))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleFiles(files: FileList) {
    if (total >= max) return
    const toAdd = Array.from(files).slice(0, max - total)
    const newItems: PendingItem[] = toAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setPending((prev) => [...prev, ...newItems])
  }

  function removeUploaded(publicId: string) {
    onChange(value.filter((item) => item.publicId !== publicId))
  }

  function removePending(previewUrl: string) {
    URL.revokeObjectURL(previewUrl)
    setPending((prev) => prev.filter((p) => p.previewUrl !== previewUrl))
  }

  return (
    <div className="space-y-2">
      {(value.length > 0 || pending.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <div key={item.publicId} className="relative w-20 h-20 rounded-md overflow-hidden border group">
              <Image src={item.url} alt="" fill className="object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() => removeUploaded(item.publicId)}
                className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XIcon className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {pending.map((item) => (
            <div key={item.previewUrl} className="relative w-20 h-20 rounded-md overflow-hidden border group">
              <Image src={item.previewUrl} alt="" fill className="object-cover" sizes="80px" unoptimized />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <UploadCloudIcon className="w-5 h-5 text-white opacity-80" />
              </div>
              <button
                type="button"
                onClick={() => removePending(item.previewUrl)}
                className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XIcon className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {total < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border border-dashed rounded-lg hover:text-foreground hover:border-foreground transition-colors"
        >
          <ImageIcon className="w-4 h-4" /> {label}
        </button>
      )}

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple={max > 1}
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  )
}

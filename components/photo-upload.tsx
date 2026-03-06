'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { UploadCloudIcon, XIcon, ImageIcon } from 'lucide-react'

export type PhotoItem = { url: string; publicId: string }

type Props = {
  value: PhotoItem[]
  onChange: (items: PhotoItem[]) => void
  max?: number
  label?: string
  hint?: string
}

export default function PhotoUpload({ value, onChange, max = 5, label = 'Add photos', hint = 'JPEG, PNG, WebP, HEIC · up to 10 MB' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    if (value.length >= max) return
    setError('')
    setUploading(true)

    const toUpload = Array.from(files).slice(0, max - value.length)
    const items: PhotoItem[] = []

    try {
      for (const file of toUpload) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Upload failed'); break }
        items.push({ url: data.url, publicId: data.publicId })
      }
      if (items.length > 0) onChange([...value, ...items])
    } finally {
      setUploading(false)
    }
  }

  function remove(publicId: string) {
    onChange(value.filter((item) => item.publicId !== publicId))
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <div key={item.publicId} className="relative w-20 h-20 rounded-md overflow-hidden border group">
              <Image src={item.url} alt="" fill className="object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() => remove(item.publicId)}
                className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XIcon className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border border-dashed rounded-lg hover:text-foreground hover:border-foreground transition-colors disabled:opacity-50"
        >
          {uploading
            ? <><UploadCloudIcon className="w-4 h-4 animate-pulse" /> Uploading…</>
            : <><ImageIcon className="w-4 h-4" /> {label}</>
          }
        </button>
      )}

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}

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

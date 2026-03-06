import type { PhotoItem } from '@/components/photo-upload'

export async function uploadFiles(files: File[]): Promise<PhotoItem[]> {
  const results: PhotoItem[] = []
  for (const file of files) {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Upload failed')
    results.push({ url: data.url, publicId: data.publicId })
  }
  return results
}

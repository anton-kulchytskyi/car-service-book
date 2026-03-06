import { v2 as cloudinary } from 'cloudinary'

export async function destroyImages(publicIds: (string | null)[]) {
  const ids = publicIds.filter(Boolean) as string[]
  if (ids.length === 0) return
  await Promise.all(ids.map((id) => cloudinary.uploader.destroy(id)))
}

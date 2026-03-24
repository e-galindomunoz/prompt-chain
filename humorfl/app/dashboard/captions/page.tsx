import { createClient } from '@/lib/supabase/server'
import { CaptionsView } from '@/components/CaptionsView'

export default async function CaptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ flavor?: string }>
}) {
  const { flavor: flavorParam } = await searchParams
  const selectedFlavorId = flavorParam ? parseInt(flavorParam, 10) : null

  const supabase = await createClient()

  const { data: flavors } = await supabase
    .from('humor_flavors')
    .select('id, slug, description')
    .order('created_datetime_utc', { ascending: false })

  let captions: Array<{
    id: string
    content: string | null
    humor_flavor_id: number | null
    image_id: string
    is_public: boolean
    is_featured: boolean
    like_count: number
    created_datetime_utc: string
    images: { url: string | null; image_description: string | null } | null
  }> = []

  if (selectedFlavorId && !isNaN(selectedFlavorId)) {
    const { data } = await supabase
      .from('captions')
      .select('*, images(url, image_description)')
      .eq('humor_flavor_id', selectedFlavorId)
      .order('created_datetime_utc', { ascending: false })
      .limit(50)

    captions = (data ?? []) as typeof captions
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <CaptionsView
        flavors={(flavors ?? []) as { id: number; slug: string; description: string | null }[]}
        selectedFlavorId={selectedFlavorId}
        captions={captions}
      />
    </div>
  )
}

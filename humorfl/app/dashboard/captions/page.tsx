import { createClient } from '@/lib/supabase/server'
import { CaptionsView } from '@/components/CaptionsView'

const PAGE_SIZE = 20

export default async function CaptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ flavor?: string; page?: string }>
}) {
  const { flavor: flavorParam, page: pageParam } = await searchParams
  const selectedFlavorId = flavorParam ? parseInt(flavorParam, 10) : null
  const currentPage = pageParam ? Math.max(0, parseInt(pageParam, 10) - 1) : 0

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
  let totalCaptions = 0

  if (selectedFlavorId && !isNaN(selectedFlavorId)) {
    const from = currentPage * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, count } = await supabase
      .from('captions')
      .select('*, images(url, image_description)', { count: 'exact' })
      .eq('humor_flavor_id', selectedFlavorId)
      .order('created_datetime_utc', { ascending: false })
      .range(from, to)

    captions = (data ?? []) as typeof captions
    totalCaptions = count ?? 0
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <CaptionsView
        flavors={(flavors ?? []) as { id: number; slug: string; description: string | null }[]}
        selectedFlavorId={selectedFlavorId}
        captions={captions}
        currentPage={currentPage + 1}
        totalCaptions={totalCaptions}
        pageSize={PAGE_SIZE}
      />
    </div>
  )
}

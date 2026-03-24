import { createClient } from '@/lib/supabase/server'
import { TestRig } from '@/components/TestRig'

export default async function TestPage() {
  const supabase = await createClient()

  const [{ data: flavors }, { data: images }] = await Promise.all([
    supabase
      .from('humor_flavors')
      .select('id, slug, description')
      .order('created_datetime_utc', { ascending: false }),
    supabase
      .from('images')
      .select('id, url, image_description, additional_context, is_common_use')
      .eq('is_common_use', true)
      .not('url', 'is', null)
      .order('id', { ascending: true })
      .limit(200),
  ])

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <TestRig
        flavors={(flavors ?? []) as { id: number; slug: string; description: string | null }[]}
        images={
          (images ?? []) as {
            id: string
            url: string | null
            image_description: string | null
            additional_context: string | null
            is_common_use: boolean | null
          }[]
        }
      />
    </div>
  )
}

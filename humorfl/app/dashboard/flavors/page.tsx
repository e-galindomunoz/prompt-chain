import { createClient } from '@/lib/supabase/server'
import { FlavorList } from '@/components/FlavorList'

export default async function FlavorsPage() {
  const supabase = await createClient()

  const { data: flavors, error } = await supabase
    .from('humor_flavors')
    .select('*, humor_flavor_steps(count)')
    .order('created_datetime_utc', { ascending: false })

  if (error) {
    return (
      <div style={{ padding: '32px' }}>
        <div
          style={{
            border: '1px solid var(--neon-pink)',
            borderRadius: '4px',
            padding: '16px',
            color: 'var(--neon-pink)',
            fontFamily: 'var(--font-geist-mono, monospace)',
            fontSize: '13px',
          }}
        >
          ⚠ Error loading flavors: {error.message}
        </div>
      </div>
    )
  }

  // Normalize step count from Supabase aggregate
  const flavorsWithCount = (flavors ?? []).map((f) => ({
    id: f.id,
    created_datetime_utc: f.created_datetime_utc,
    description: f.description,
    slug: f.slug,
    step_count: Array.isArray(f.humor_flavor_steps)
      ? (f.humor_flavor_steps[0] as { count: number } | undefined)?.count ?? 0
      : 0,
  }))

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <FlavorList flavors={flavorsWithCount} />
    </div>
  )
}

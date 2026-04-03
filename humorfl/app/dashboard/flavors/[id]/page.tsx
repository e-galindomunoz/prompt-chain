import { createClient } from '@/lib/supabase/server'
import { FlavorDetail } from '@/components/FlavorDetail'
import { notFound } from 'next/navigation'
import type { HumorFlavorStep, LlmModel } from '@/lib/types'

export default async function FlavorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = parseInt(id, 10)

  if (isNaN(numericId)) notFound()

  const supabase = await createClient()

  const [
    { data: flavor, error: flavorError },
    { data: steps, error: stepsError },
    { data: models },
  ] = await Promise.all([
    supabase.from('humor_flavors').select('*').eq('id', numericId).single(),
    supabase.from('humor_flavor_steps').select('*').eq('humor_flavor_id', numericId).order('order_by', { ascending: true }),
    supabase.from('llm_models').select('id, name').order('id', { ascending: true }),
  ])

  if (flavorError || !flavor) notFound()

  if (stepsError) {
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
          ⚠ Error loading steps: {stepsError.message}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <FlavorDetail flavor={flavor} steps={(steps ?? []) as HumorFlavorStep[]} models={(models ?? []) as LlmModel[]} />
    </div>
  )
}

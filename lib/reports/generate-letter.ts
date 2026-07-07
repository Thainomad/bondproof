import Anthropic from '@anthropic-ai/sdk'
import type { ClaimLineItem } from '@/lib/dispute'
import type { ComparisonRow } from '@/lib/comparison'

const SYSTEM_PROMPT = `You are drafting a factual response letter for a NSW tenant disputing bond deductions claimed by their agent/landlord.

Strict rules:
- Only reference evidence explicitly provided in the user message (photos, ratings, notes, dates). Never invent or assume facts, photos, or details that were not given to you.
- If no evidence was matched for a disputed item, say so plainly rather than fabricating detail.
- Cite the "fair wear and tear" principle only using the guidance text provided, not from general knowledge.
- Tone: factual, professional, calm. Not aggressive or emotional.
- Do not give legal advice or use legal-sounding certainty ("you are legally entitled to..."). Describe the tenant's position, not a legal conclusion.
- End the letter with this exact line on its own: "This is document preparation assistance, not legal advice."
- Output plain text only (no markdown headers or bullet asterisks) — this will be inserted directly into a PDF letter.`

function buildUserPrompt({
  tenancyAddress,
  agentName,
  disputedItems,
  comparisonRows,
  fairWearAndTear,
}: {
  tenancyAddress: string
  agentName: string | null
  disputedItems: ClaimLineItem[]
  comparisonRows: ComparisonRow[]
  fairWearAndTear: { principle: string; categories: unknown[] } | null
}): string {
  const lines: string[] = []
  lines.push(`Property: ${tenancyAddress}`)
  if (agentName) lines.push(`Agent/landlord: ${agentName}`)
  lines.push('')
  lines.push('Disputed line items:')

  for (const item of disputedItems) {
    lines.push(`\n- Category: ${item.category}`)
    lines.push(`  Amount claimed: $${(item.amount_cents / 100).toFixed(2)}`)
    if (item.description) lines.push(`  Agent's stated reason: ${item.description}`)

    const needle = item.category.toLowerCase()
    const matches = comparisonRows.filter(
      (r) => r.label.toLowerCase().includes(needle) || needle.includes(r.label.toLowerCase())
    )

    if (matches.length === 0) {
      lines.push('  Evidence: none captured for this category — do not invent any.')
    } else {
      for (const m of matches) {
        lines.push(`  Evidence — ${m.label}:`)
        lines.push(
          `    Entry: rating=${m.entry?.condition_rating ?? 'not recorded'}, photos=${m.entry?.photos.length ?? 0}, note=${m.entry?.note ?? 'none'}`
        )
        lines.push(
          `    Exit: rating=${m.exit?.condition_rating ?? 'not recorded'}, photos=${m.exit?.photos.length ?? 0}, note=${m.exit?.note ?? 'none'}`
        )
      }
    }
  }

  if (fairWearAndTear) {
    lines.push('\nFair wear and tear guidance (NSW):')
    lines.push(fairWearAndTear.principle)
  }

  lines.push(
    '\nWrite a response letter to the agent/landlord disputing these line items, referencing only the evidence above.'
  )

  return lines.join('\n')
}

export async function generateDisputeLetter({
  tenancyAddress,
  agentName,
  disputedItems,
  comparisonRows,
  fairWearAndTear,
}: {
  tenancyAddress: string
  agentName: string | null
  disputedItems: ClaimLineItem[]
  comparisonRows: ComparisonRow[]
  fairWearAndTear: { principle: string; categories: unknown[] } | null
}): Promise<string> {
  const client = new Anthropic()

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildUserPrompt({
          tenancyAddress,
          agentName,
          disputedItems,
          comparisonRows,
          fairWearAndTear,
        }),
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content returned from letter generation')
  }
  return textBlock.text
}

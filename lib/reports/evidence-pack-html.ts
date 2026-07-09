import type { ComparisonRow } from '@/lib/comparison'
import type { ClaimLineItem } from '@/lib/dispute'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(value: string | null): string {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export type ChronologyEvent = { date: string | null; label: string }

function matchRows(category: string, rows: ComparisonRow[]): ComparisonRow[] {
  const needle = category.toLowerCase()
  return rows.filter(
    (r) =>
      r.label.toLowerCase().includes(needle) || needle.includes(r.label.toLowerCase())
  )
}

export function renderEvidencePackHtml({
  tenancyAddress,
  generatedAt,
  disputedItems,
  comparisonRows,
  chronology,
}: {
  tenancyAddress: string
  generatedAt: Date
  disputedItems: ClaimLineItem[]
  comparisonRows: ComparisonRow[]
  chronology: ChronologyEvent[]
}): string {
  const itemSections = disputedItems
    .map((item) => {
      const matches = matchRows(item.category, comparisonRows)
      const matchesHtml = matches.length
        ? matches
            .map(
              (row) => `
              <div class="pair">
                <h4>${escapeHtml(row.label)}</h4>
                <div class="sides">
                  <div class="side">
                    <span class="side-label">Entry — ${row.entry?.condition_rating ?? 'N/A'}</span>
                    ${
                      row.entry?.photos.length
                        ? row.entry.photos
                            .map(
                              (p) =>
                                `<figure><img src="${p.url}" /><figcaption>${formatDate(p.exif_taken_at)}</figcaption></figure>`
                            )
                            .join('')
                        : '<p class="none">No photos</p>'
                    }
                    ${row.entry?.note ? `<p class="note">${escapeHtml(row.entry.note)}</p>` : ''}
                  </div>
                  <div class="side">
                    <span class="side-label">Exit — ${row.exit?.condition_rating ?? 'N/A'}</span>
                    ${
                      row.exit?.photos.length
                        ? row.exit.photos
                            .map(
                              (p) =>
                                `<figure><img src="${p.url}" /><figcaption>${formatDate(p.exif_taken_at)}</figcaption></figure>`
                            )
                            .join('')
                        : '<p class="none">No photos</p>'
                    }
                    ${row.exit?.note ? `<p class="note">${escapeHtml(row.exit.note)}</p>` : ''}
                  </div>
                </div>
              </div>`
            )
            .join('')
        : '<p class="none">No matching captured evidence found for this category — position is based on written notes only.</p>'

      return `
        <section class="claim">
          <div class="claim-header">
            <h3>${escapeHtml(item.category)} — $${(item.amount_cents / 100).toFixed(2)}</h3>
          </div>
          ${item.description ? `<p class="claimed-desc">Claimed: ${escapeHtml(item.description)}</p>` : ''}
          ${matchesHtml}
        </section>`
    })
    .join('')

  const chronologyHtml = chronology
    .map((e) => `<li><strong>${formatDate(e.date)}</strong> — ${escapeHtml(e.label)}</li>`)
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #111827; margin: 0; }
  .cover { padding: 64px 48px; page-break-after: always; }
  .cover h1 { font-size: 28px; margin-bottom: 8px; }
  .cover .subtitle { color: #6b7280; }
  .content { padding: 24px 48px 48px; }
  .claim { margin-bottom: 28px; page-break-inside: avoid; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
  .claim-header h3 { margin: 0 0 6px; font-size: 17px; }
  .claimed-desc { font-size: 13px; color: #6b7280; margin: 0 0 10px; }
  .pair { margin-bottom: 14px; }
  .pair h4 { font-size: 14px; margin: 0 0 6px; }
  .sides { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .side-label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
  figure { display: inline-block; margin: 0 6px 6px 0; width: 130px; }
  figure img { width: 130px; height: 100px; object-fit: cover; border-radius: 4px; border: 1px solid #e5e7eb; }
  figcaption { font-size: 9px; color: #9ca3af; }
  .note { font-size: 12px; color: #374151; }
  .none { font-size: 12px; color: #9ca3af; font-style: italic; }
  .chronology { margin-top: 32px; }
  .chronology h2 { font-size: 18px; border-bottom: 2px solid #111827; padding-bottom: 6px; }
  .chronology ul { padding-left: 20px; font-size: 13px; }
</style>
</head>
<body>
  <div class="cover">
    <h1>Evidence Pack</h1>
    <p class="subtitle">${escapeHtml(tenancyAddress)}</p>
    <p class="subtitle">Generated ${formatDate(generatedAt.toISOString())} &middot; BondShield</p>
  </div>
  <div class="content">
    ${itemSections}
    <div class="chronology">
      <h2>Chronology</h2>
      <ul>${chronologyHtml}</ul>
    </div>
  </div>
</body>
</html>`
}

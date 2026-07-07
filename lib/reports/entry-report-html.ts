export type ReportPhoto = {
  url: string
  sha256: string
  exif_taken_at: string | null
  uploaded_at: string
}

export type ReportEvidenceItem = {
  room: string
  label: string
  guidance: string | null
  condition_rating: 'good' | 'fair' | 'damaged' | null
  note: string | null
  photos: ReportPhoto[]
}

export type ReportTenancy = {
  address: string
  state: string
  lease_start: string | null
  lease_end: string | null
  agent_name: string | null
  agent_email: string | null
  bond_amount_cents: number | null
  rbo_number: string | null
}

const ROOM_LABELS: Record<string, string> = {
  general: 'Every room',
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  bedroom: 'Bedroom',
  laundry: 'Laundry',
  exterior: 'Exterior',
}

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

const RATING_COLORS: Record<string, string> = {
  good: '#16a34a',
  fair: '#d97706',
  damaged: '#dc2626',
}

export function renderEntryReportHtml({
  tenancy,
  generatedAt,
  items,
  title = 'Entry Condition Report',
}: {
  tenancy: ReportTenancy
  generatedAt: Date
  items: ReportEvidenceItem[]
  title?: string
}): string {
  const grouped = new Map<string, ReportEvidenceItem[]>()
  for (const item of items) {
    const list = grouped.get(item.room) ?? []
    list.push(item)
    grouped.set(item.room, list)
  }

  const sections = Array.from(grouped.entries())
    .map(([room, roomItems]) => {
      const cards = roomItems
        .map((item) => {
          const ratingColor = item.condition_rating
            ? RATING_COLORS[item.condition_rating]
            : '#9ca3af'
          const photosHtml = item.photos.length
            ? item.photos
                .map(
                  (p) => `
                <figure class="photo">
                  <img src="${p.url}" />
                  <figcaption>
                    Taken: ${formatDate(p.exif_taken_at)}<br/>
                    Uploaded: ${formatDate(p.uploaded_at)}<br/>
                    SHA-256: ${p.sha256.slice(0, 16)}&hellip;
                  </figcaption>
                </figure>`
                )
                .join('')
            : '<p class="no-photos">No photos attached</p>'

          return `
            <div class="item">
              <div class="item-header">
                <h3>${escapeHtml(item.label)}</h3>
                <span class="badge" style="background:${ratingColor}">
                  ${item.condition_rating ? escapeHtml(item.condition_rating) : 'N/A'}
                </span>
              </div>
              ${item.note ? `<p class="note">${escapeHtml(item.note)}</p>` : ''}
              <div class="photos">${photosHtml}</div>
            </div>`
        })
        .join('')

      return `
        <section class="room">
          <h2>${ROOM_LABELS[room] ?? escapeHtml(room)}</h2>
          ${cards}
        </section>`
    })
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    color: #111827;
    margin: 0;
    padding: 0;
  }
  .cover {
    padding: 64px 48px;
    page-break-after: always;
  }
  .cover h1 { font-size: 32px; margin-bottom: 8px; }
  .cover .subtitle { color: #6b7280; margin-bottom: 40px; }
  .cover dl { display: grid; grid-template-columns: 160px 1fr; row-gap: 12px; font-size: 15px; }
  .cover dt { color: #6b7280; }
  .cover dd { margin: 0; font-weight: 500; }
  .content { padding: 24px 48px 48px; }
  .room { margin-bottom: 32px; page-break-inside: avoid; }
  .room h2 {
    font-size: 20px;
    border-bottom: 2px solid #111827;
    padding-bottom: 6px;
    margin-bottom: 16px;
  }
  .item {
    margin-bottom: 20px;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    page-break-inside: avoid;
  }
  .item-header { display: flex; align-items: center; justify-content: space-between; }
  .item-header h3 { font-size: 16px; margin: 0; }
  .badge {
    color: white;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 999px;
  }
  .note { font-size: 14px; color: #374151; margin: 8px 0; }
  .photos { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; }
  .photo { margin: 0; width: 160px; }
  .photo img { width: 160px; height: 120px; object-fit: cover; border-radius: 4px; border: 1px solid #e5e7eb; }
  .photo figcaption { font-size: 10px; color: #6b7280; margin-top: 4px; }
  .no-photos { font-size: 13px; color: #9ca3af; font-style: italic; }
</style>
</head>
<body>
  <div class="cover">
    <h1>${title}</h1>
    <p class="subtitle">Generated ${formatDate(generatedAt.toISOString())} &middot; BondProof</p>
    <dl>
      <dt>Property</dt><dd>${escapeHtml(tenancy.address)}</dd>
      <dt>State</dt><dd>${escapeHtml(tenancy.state)}</dd>
      <dt>Lease start</dt><dd>${tenancy.lease_start ?? 'Not set'}</dd>
      <dt>Lease end</dt><dd>${tenancy.lease_end ?? 'Not set'}</dd>
      <dt>Agent / landlord</dt><dd>${tenancy.agent_name ? escapeHtml(tenancy.agent_name) : 'Not recorded'}</dd>
      <dt>Agent email</dt><dd>${tenancy.agent_email ? escapeHtml(tenancy.agent_email) : 'Not recorded'}</dd>
      <dt>Bond amount</dt><dd>${
        tenancy.bond_amount_cents != null
          ? `$${(tenancy.bond_amount_cents / 100).toFixed(2)}`
          : 'Not recorded'
      }</dd>
      <dt>RBO number</dt><dd>${tenancy.rbo_number ? escapeHtml(tenancy.rbo_number) : 'Not recorded'}</dd>
    </dl>
  </div>
  <div class="content">
    ${sections}
  </div>
</body>
</html>`
}

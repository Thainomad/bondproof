import { redirect } from 'next/navigation'
import { getCurrentTenancy } from '@/lib/tenancy'
import { getComparisonRows } from '@/lib/comparison'
import { hasPaidForDisputeKit } from '@/lib/payments'
import PaywallScreen from '@/app/checkout/PaywallScreen'
import PageContainer from '@/components/ui/PageContainer'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const ROOM_LABELS: Record<string, string> = {
  general: 'Every room',
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  bedroom: 'Bedroom',
  laundry: 'Laundry',
  exterior: 'Exterior',
}

const RATING_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  good: 'success',
  fair: 'warning',
  damaged: 'danger',
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const tenancy = await getCurrentTenancy(t)
  if (!tenancy) redirect('/')

  if (!(await hasPaidForDisputeKit(tenancy.id))) {
    return <PaywallScreen tenancyId={tenancy.id} stayType={tenancy.stay_type} />
  }

  const rows = await getComparisonRows(tenancy.id)

  const rooms: { room: string; rows: typeof rows }[] = []
  for (const row of rows) {
    const section = rooms.at(-1)
    if (section && section.room === row.room) {
      section.rows.push(row)
    } else {
      rooms.push({ room: row.room, rows: [row] })
    }
  }

  return (
    <PageContainer width="2xl">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Entry vs exit comparison</h1>
      <p className="-mt-2 text-sm text-muted">
        Items flagged below are likely claim targets — worsened condition or a common high-claim
        category.
      </p>

      {rooms.map((section) => (
        <div key={section.room}>
          <h2 className="mb-2 text-sm font-semibold text-foreground">
            {ROOM_LABELS[section.room] ?? section.room}
          </h2>
          <div className="flex flex-col gap-3">
            {section.rows.map((row) => {
              const flagged = row.worsened || row.highClaimFlag
              return (
                <Card
                  key={row.checklistItemId}
                  className={flagged ? 'border-warning/30 bg-warning-bg/40' : ''}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium text-foreground">{row.label}</h3>
                    {flagged && (
                      <Badge tone="warning">{row.worsened ? 'Worsened' : 'High-claim'}</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Side label="Entry" side={row.entry} />
                    <Side label="Exit" side={row.exit} />
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </PageContainer>
  )
}

function Side({
  label,
  side,
}: {
  label: string
  side: { condition_rating: string | null; note: string | null; photos: { url: string }[] } | null
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium uppercase text-muted">{label}</span>
        {side?.condition_rating && (
          <Badge tone={RATING_TONE[side.condition_rating] ?? 'neutral'}>
            {side.condition_rating}
          </Badge>
        )}
      </div>
      {side?.photos.length ? (
        <div className="flex flex-wrap gap-1">
          {side.photos.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={p.url} alt="" className="h-20 w-20 rounded-md object-cover" />
          ))}
        </div>
      ) : (
        <p className="text-xs italic text-muted">No photos</p>
      )}
      {side?.note && <p className="mt-1 text-xs text-muted">{side.note}</p>}
    </div>
  )
}

import { redirect } from 'next/navigation'
import { getCurrentTenancy } from '@/lib/tenancy'
import { getComparisonRows } from '@/lib/comparison'

const ROOM_LABELS: Record<string, string> = {
  general: 'Every room',
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  bedroom: 'Bedroom',
  laundry: 'Laundry',
  exterior: 'Exterior',
}

const RATING_COLORS: Record<string, string> = {
  good: 'bg-green-600',
  fair: 'bg-amber-600',
  damaged: 'bg-red-600',
}

export default async function ComparePage() {
  const tenancy = await getCurrentTenancy()
  if (!tenancy) redirect('/')

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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Entry vs exit comparison</h1>
      <p className="text-sm text-gray-600">
        Items flagged below are likely claim targets — worsened condition or a
        common high-claim category.
      </p>

      {rooms.map((section) => (
        <div key={section.room}>
          <h2 className="mt-4 mb-2 text-lg font-semibold">
            {ROOM_LABELS[section.room] ?? section.room}
          </h2>
          <div className="flex flex-col gap-4">
            {section.rows.map((row) => {
              const flagged = row.worsened || row.highClaimFlag
              return (
                <div
                  key={row.checklistItemId}
                  className={`rounded-lg border p-4 ${
                    flagged ? 'border-amber-400 bg-amber-50' : 'border-gray-200'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium">{row.label}</h3>
                    {flagged && (
                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                        {row.worsened ? 'Worsened' : 'High-claim'}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Side label="Entry" side={row.entry} ratingColors={RATING_COLORS} />
                    <Side label="Exit" side={row.exit} ratingColors={RATING_COLORS} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </main>
  )
}

function Side({
  label,
  side,
  ratingColors,
}: {
  label: string
  side: { condition_rating: string | null; note: string | null; photos: { url: string }[] } | null
  ratingColors: Record<string, string>
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium uppercase text-gray-500">{label}</span>
        {side?.condition_rating && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${
              ratingColors[side.condition_rating] ?? 'bg-gray-400'
            }`}
          >
            {side.condition_rating}
          </span>
        )}
      </div>
      {side?.photos.length ? (
        <div className="flex flex-wrap gap-1">
          {side.photos.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={p.url} alt="" className="h-20 w-20 rounded object-cover" />
          ))}
        </div>
      ) : (
        <p className="text-xs italic text-gray-400">No photos</p>
      )}
      {side?.note && <p className="mt-1 text-xs text-gray-600">{side.note}</p>}
    </div>
  )
}

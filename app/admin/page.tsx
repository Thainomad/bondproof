import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import PageContainer from '@/components/ui/PageContainer'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/')
  }

  const admin = createAdminClient()

  const [usersRes, paymentsRes, tenanciesRes] = await Promise.all([
    admin.from('users').select('id, email, created_at').order('created_at', { ascending: false }),
    admin
      .from('payments')
      .select('id, user_id, product, amount_cents, created_at, users(email)')
      .order('created_at', { ascending: false }),
    admin.from('tenancies').select('id, status'),
  ])

  const users = usersRes.data ?? []
  const payments = paymentsRes.data ?? []
  const tenancies = tenanciesRes.data ?? []

  const paidUserIds = new Set(payments.map((p) => p.user_id))
  const revenueCents = payments.reduce((sum, p) => sum + p.amount_cents, 0)

  return (
    <PageContainer width="2xl">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Admin</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-xs font-medium uppercase text-muted">Signups</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{users.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-muted">Tenancies</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{tenancies.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-muted">Paid conversions</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{paidUserIds.size}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-muted">Revenue</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            ${(revenueCents / 100).toFixed(2)}
          </p>
        </Card>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Recent signups</h2>
        <Card className="p-0">
          {users.length === 0 ? (
            <p className="p-4 text-sm italic text-muted">No signups yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {users.map((u) => (
                <li key={u.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-foreground">{u.email}</span>
                  <span className="text-muted">{new Date(u.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Payments</h2>
        <Card className="p-0">
          {payments.length === 0 ? (
            <p className="p-4 text-sm italic text-muted">No payments yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {payments.map((p) => {
                const email = (p.users as unknown as { email: string } | null)?.email
                return (
                  <li key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="text-foreground">{email ?? p.user_id}</p>
                      <p className="text-muted">{p.product}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone="success">${(p.amount_cents / 100).toFixed(2)}</Badge>
                      <span className="text-muted">
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </PageContainer>
  )
}

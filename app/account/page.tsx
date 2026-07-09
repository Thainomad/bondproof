import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageContainer from '@/components/ui/PageContainer'
import Card from '@/components/ui/Card'
import SetPasswordForm from './SetPasswordForm'

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <PageContainer backHref="/" backLabel="Dashboard">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Account</h1>
      <Card className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium uppercase text-muted">Signed in as</p>
          <p className="text-sm font-medium text-foreground">{user.email}</p>
        </div>
      </Card>
      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Share access</h2>
        <Card>
          <p className="mb-4 text-sm text-muted">
            Set a password for this account, then share your email and password with a partner or
            flatmate so they can sign in too — no need for them to have access to your inbox.
          </p>
          <SetPasswordForm />
        </Card>
      </div>
    </PageContainer>
  )
}

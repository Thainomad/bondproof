import { redirect } from 'next/navigation'
import { getCurrentTenancy } from '@/lib/tenancy'
import PageContainer from '@/components/ui/PageContainer'
import Card from '@/components/ui/Card'
import EditTenancyForm from './EditTenancyForm'

export default async function EditTenancyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tenancy = await getCurrentTenancy(id)
  if (!tenancy) redirect('/')

  const isShortTerm = tenancy.stay_type === 'short_term'

  return (
    <PageContainer backHref={`/?t=${tenancy.id}`} backLabel="Dashboard">
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        Edit {isShortTerm ? 'stay' : 'tenancy'} details
      </h1>
      <Card>
        <EditTenancyForm tenancy={tenancy} />
      </Card>
    </PageContainer>
  )
}

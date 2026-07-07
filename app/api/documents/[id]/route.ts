import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { data: document, error } = await supabase
    .from('documents')
    .select('storage_key')
    .eq('id', id)
    .maybeSingle()

  if (error || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from('documents')
    .createSignedUrl(document.storage_key, 60)

  if (signedError || !signed) {
    return NextResponse.json({ error: 'Could not generate download link' }, { status: 500 })
  }

  return NextResponse.redirect(signed.signedUrl)
}

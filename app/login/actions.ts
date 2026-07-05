'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendMagicLink(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

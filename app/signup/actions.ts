'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signUp(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string
  const name = (formData.get('name') as string)?.trim()

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Failed to create account.' }
  }

  if (name) {
    await supabase.from('users').update({ name }).eq('id', data.user.id)
  }

  if (!data.session) {
    return { needsConfirmation: true }
  }

  redirect('/')
}

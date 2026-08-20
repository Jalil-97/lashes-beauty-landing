import supabaseAdmin from './supabaseAdmin'

export async function verifyAdminSession(request) {
  const token = request.cookies.get('admin-session')?.value
  if (!token) return null

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null

  return user
}

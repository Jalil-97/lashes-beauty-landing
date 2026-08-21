import supabaseAnon from '@/lib/supabaseAnon'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Body inválido' }, { status: 400 })
  }

  const { email, password } = body || {}
  if (!email || !password) {
    return Response.json({ ok: false, error: 'Email y contraseña requeridos' }, { status: 400 })
  }

  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return Response.json({ ok: false, error: 'Credenciales inválidas' }, { status: 401 })
  }

  const { access_token } = data.session

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `admin-session=${access_token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax; Secure`,
    },
  })
}

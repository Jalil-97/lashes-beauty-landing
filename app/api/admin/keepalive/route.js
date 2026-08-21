import supabaseAdmin from '@/lib/supabaseAdmin'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : null

  if (!expected || authHeader !== expected) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { error } = await supabaseAdmin
    .from('alumnas')
    .select('id')
    .limit(1)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true })
}

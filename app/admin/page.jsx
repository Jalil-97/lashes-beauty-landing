'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const CUPO_MAXIMO = 6

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n ?? 0)
}

function fmtDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function buildWaLink(phone) {
  const digits = (phone || '').replace(/\D/g, '')
  const cleaned = digits.startsWith('15') ? '11' + digits.slice(2) : digits
  return `https://wa.me/549${cleaned}`
}

function parseKey(key) {
  const idx = key.indexOf('|')
  return { curso_id: key.slice(0, idx), grupo: key.slice(idx + 1) || null }
}

// opts built from the cursos API response
function buildOptions(cursosList) {
  const opts = []
  for (const c of cursosList) {
    if (c.grupos) {
      for (const g of c.grupos) {
        opts.push({
          key: `${c.id}|${g.nombre}`,
          cursoNombre: c.nombre,
          cursoFechas: c.fechas || null,
          tieneCupos: c.tieneCupos,
          grupoNombre: g.nombre,
          primeraFecha: g.primeraFecha || null,
          alumnaCount: g.alumnas,
          finalizado: g.finalizado,
          curso_id: c.id,
          grupo: g.nombre,
        })
      }
    } else {
      opts.push({
        key: `${c.id}|`,
        cursoNombre: c.nombre,
        cursoFechas: c.fechas || null,
        tieneCupos: c.tieneCupos,
        grupoNombre: null,
        alumnaCount: c.alumnas,
        finalizado: c.finalizado,
        curso_id: c.id,
        grupo: null,
      })
    }
  }
  return opts
}

function buildCourseList(opts) {
  const map = new Map()
  for (const o of opts) {
    if (!map.has(o.curso_id)) {
      map.set(o.curso_id, {
        curso_id: o.curso_id,
        nombre: o.cursoNombre,
        fechas: o.cursoFechas,
        options: [],
      })
    }
    map.get(o.curso_id).options.push(o)
  }
  return Array.from(map.values()).map(c => ({
    ...c,
    hasGrupos: c.options[0].grupoNombre !== null,
  }))
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const lblStyle = {
  display: 'block', fontSize: '.7rem', color: 'var(--mt)', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 500,
}

const btnPink = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '9px 20px', borderRadius: 5, fontSize: '.83rem', fontWeight: 600,
  cursor: 'pointer', border: 'none', background: 'var(--pk)', color: 'var(--bk)',
  fontFamily: 'var(--fb)', transition: 'opacity .15s',
}

const btnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '9px 20px', borderRadius: 5, fontSize: '.83rem', fontWeight: 600,
  cursor: 'pointer', border: '1px solid var(--mg)', background: 'transparent',
  color: 'var(--mt)', fontFamily: 'var(--fb)',
}

const btnGhostSm = { ...btnGhost, padding: '6px 12px', fontSize: '.76rem' }

const btnDanger = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '9px 20px', borderRadius: 5, fontSize: '.83rem', fontWeight: 600,
  cursor: 'pointer', border: '1px solid rgba(239,68,68,.4)',
  background: 'rgba(239,68,68,.08)', color: '#f87171', fontFamily: 'var(--fb)',
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

function ConfirmModal({ title, message, warning, onConfirm, onCancel, loading, confirmLabel = 'Confirmar' }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div style={{ background: 'var(--dg)', border: '1px solid var(--mg)', borderRadius: 12, padding: '32px 28px', width: '100%', maxWidth: 420 }}>
        <div style={{ fontFamily: 'var(--fd)', fontSize: '1.5rem', marginBottom: 12 }}>{title}</div>
        <p style={{ color: 'var(--mt)', fontSize: '.88rem', lineHeight: 1.65, marginBottom: 20 }}>{message}</p>
        {warning && (
          <div style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.18)', borderRadius: 6, padding: '10px 14px', marginBottom: 24, fontSize: '.78rem', color: '#f87171' }}>
            {warning}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={onCancel} disabled={loading}>Cancelar</button>
          <button style={{ ...btnDanger, opacity: loading ? .6 : 1 }} onClick={onConfirm} disabled={loading}>
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AddAlumnaModal ───────────────────────────────────────────────────────────

function AddAlumnaModal({ onClose, onSave, loading }) {
  const [form, setForm] = useState({ nombre: '', apellido: '', whatsapp: '', kit: false, notas: '' })
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const err = await onSave(form)
    if (err) setError(err)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.78)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--dg)', border: '1px solid var(--mg)', borderRadius: 12, padding: '32px 28px', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ fontFamily: 'var(--fd)', fontSize: '1.6rem', marginBottom: 24 }}>Nueva alumna</div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div><label style={lblStyle}>Nombre</label><input className="fc" required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="María" /></div>
            <div><label style={lblStyle}>Apellido</label><input className="fc" required value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} placeholder="García" /></div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lblStyle}>WhatsApp</label>
            <input className="fc" required value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="11 1234-5678" />
          </div>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="add-kit" checked={form.kit} onChange={e => setForm(f => ({ ...f, kit: e.target.checked }))} style={{ accentColor: 'var(--pk)', width: 16, height: 16 }} />
            <label htmlFor="add-kit" style={{ color: 'var(--wh)', fontSize: '.87rem', cursor: 'pointer' }}>Incluye kit de materiales</label>
          </div>
          <div style={{ marginBottom: 4 }}>
            <label style={lblStyle}>Notas (opcional)</label>
            <textarea className="fc" rows={2} value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} placeholder="Observaciones..." style={{ resize: 'vertical' }} />
          </div>
          {error && <div style={{ color: '#f87171', fontSize: '.82rem', margin: '12px 0' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
            <button type="button" style={btnGhost} onClick={onClose}>Cancelar</button>
            <button type="submit" style={{ ...btnPink, opacity: loading ? .6 : 1 }} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── EditAlumnaModal ──────────────────────────────────────────────────────────

function EditAlumnaModal({ alumna, onClose, onSave, loading }) {
  const [form, setForm] = useState({
    nombre: alumna.nombre, apellido: alumna.apellido,
    whatsapp: alumna.whatsapp, kit: alumna.kit, notas: alumna.notas || '',
  })
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const err = await onSave(alumna.id, form)
    if (err) setError(err)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.78)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--dg)', border: '1px solid var(--mg)', borderRadius: 12, padding: '32px 28px', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ fontFamily: 'var(--fd)', fontSize: '1.6rem', marginBottom: 24 }}>Editar alumna</div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div><label style={lblStyle}>Nombre</label><input className="fc" required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} /></div>
            <div><label style={lblStyle}>Apellido</label><input className="fc" required value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} /></div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={lblStyle}>WhatsApp</label>
            <input className="fc" required value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="edit-kit" checked={form.kit} onChange={e => setForm(f => ({ ...f, kit: e.target.checked }))} style={{ accentColor: 'var(--pk)', width: 16, height: 16 }} />
            <label htmlFor="edit-kit" style={{ color: 'var(--wh)', fontSize: '.87rem', cursor: 'pointer' }}>Incluye kit de materiales</label>
          </div>
          <div style={{ marginBottom: 4 }}>
            <label style={lblStyle}>Notas</label>
            <textarea className="fc" rows={2} value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
          {error && <div style={{ color: '#f87171', fontSize: '.82rem', margin: '12px 0' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
            <button type="button" style={btnGhost} onClick={onClose}>Cancelar</button>
            <button type="submit" style={{ ...btnPink, opacity: loading ? .6 : 1 }} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── AddPagoModal ─────────────────────────────────────────────────────────────

function AddPagoModal({ alumna, onClose, onSave, onEditPago, loading }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ monto: '', medio: 'transferencia', fecha: today, nota: '' })
  const [editingPago, setEditingPago] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [error, setError] = useState('')
  const [overpaymentPending, setOverpaymentPending] = useState(null)

  const pagos = [...(alumna.pagos || [])].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  function handleSubmitAttempt(e) {
    e.preventDefault()
    setError('')
    const newMonto = Number(form.monto)
    const newTotal = (alumna.totalPagado || 0) + newMonto
    if (newTotal > alumna.total) {
      setOverpaymentPending({
        monto: newMonto,
        diferencia: newTotal - alumna.total,
        saldo: alumna.saldoPendiente,
      })
      return
    }
    submitPago(newMonto)
  }

  async function submitPago(monto) {
    const err = await onSave({ alumna_id: alumna.id, ...form, monto })
    if (err) setError(err)
    else setForm(f => ({ ...f, monto: '', nota: '' }))
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    setError('')
    const err = await onEditPago(editingPago.id, { ...editForm, monto: Number(editForm.monto) })
    if (err) setError(err)
    else setEditingPago(null)
  }

  function startEdit(p) {
    setEditingPago(p)
    setEditForm({ monto: p.monto, medio: p.medio, fecha: p.fecha, nota: p.nota || '' })
  }

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.78)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div style={{ background: 'var(--dg)', border: '1px solid var(--mg)', borderRadius: 12, padding: '32px 28px', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: '1.6rem', marginBottom: 20 }}>Pagos</div>

          <div style={{ background: 'var(--bk)', border: '1px solid var(--mg)', borderRadius: 7, padding: '10px 14px', marginBottom: 20, fontSize: '.83rem' }}>
            <strong style={{ color: 'var(--wh)' }}>{alumna.nombre} {alumna.apellido}</strong>
            <span style={{ color: 'var(--mt)' }}> &nbsp;·&nbsp; Total: <span style={{ color: 'var(--wh)' }}>{fmt(alumna.total)}</span></span>
            {alumna.saldoPendiente > 0
              ? <span> &nbsp;·&nbsp; Saldo: <span style={{ color: '#f87171', fontWeight: 600 }}>{fmt(alumna.saldoPendiente)}</span></span>
              : <span> &nbsp;·&nbsp; <span style={{ color: 'var(--pk)' }}>Sin saldo pendiente</span></span>
            }
          </div>

          {pagos.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ ...lblStyle, marginBottom: 10 }}>Pagos registrados</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pagos.map(p => (
                  <div key={p.id} style={{ background: 'var(--bk)', border: '1px solid var(--mg)', borderRadius: 7, padding: '10px 14px' }}>
                    {editingPago?.id === p.id ? (
                      <form onSubmit={handleEditSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                          <div>
                            <label style={{ ...lblStyle, marginBottom: 4 }}>Monto ($)</label>
                            <input className="fc" type="number" min="1" required value={editForm.monto} onChange={e => setEditForm(f => ({ ...f, monto: e.target.value }))} />
                          </div>
                          <div>
                            <label style={{ ...lblStyle, marginBottom: 4 }}>Fecha</label>
                            <input className="fc" type="date" required value={editForm.fecha} onChange={e => setEditForm(f => ({ ...f, fecha: e.target.value }))} />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                          <div>
                            <label style={{ ...lblStyle, marginBottom: 4 }}>Medio</label>
                            <select className="fc" value={editForm.medio} onChange={e => setEditForm(f => ({ ...f, medio: e.target.value }))}>
                              <option value="efectivo">Efectivo</option>
                              <option value="transferencia">Transferencia</option>
                              <option value="tarjeta">Tarjeta</option>
                              <option value="otro">Otro</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ ...lblStyle, marginBottom: 4 }}>Nota</label>
                            <input className="fc" value={editForm.nota} onChange={e => setEditForm(f => ({ ...f, nota: e.target.value }))} placeholder="Opcional" />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="submit" style={{ ...btnPink, padding: '6px 14px', fontSize: '.78rem', opacity: loading ? .6 : 1 }} disabled={loading}>Guardar</button>
                          <button type="button" style={btnGhostSm} onClick={() => setEditingPago(null)}>Cancelar</button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ color: 'var(--pk)', fontWeight: 600 }}>{fmt(p.monto)}</span>
                          <span style={{ color: 'var(--mt)', fontSize: '.78rem', marginLeft: 8 }}>
                            {fmtDate(p.fecha)} · {p.medio}{p.nota ? ` · ${p.nota}` : ''}
                          </span>
                        </div>
                        <button style={btnGhostSm} onClick={() => startEdit(p)}>Editar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--mg)', marginBottom: 20 }} />

          <div style={{ fontFamily: 'var(--fd)', fontSize: '1.1rem', marginBottom: 16, color: 'var(--wh)' }}>Agregar pago</div>
          <form onSubmit={handleSubmitAttempt}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={lblStyle}>Monto ($)</label>
                <input className="fc" type="number" min="1" required value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} placeholder="50000" />
              </div>
              <div>
                <label style={lblStyle}>Fecha</label>
                <input className="fc" type="date" required value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={lblStyle}>Medio de pago</label>
                <select className="fc" value={form.medio} onChange={e => setForm(f => ({ ...f, medio: e.target.value }))}>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label style={lblStyle}>Nota (opcional)</label>
                <input className="fc" value={form.nota} onChange={e => setForm(f => ({ ...f, nota: e.target.value }))} placeholder="Seña, pago parcial..." />
              </div>
            </div>
            {error && <div style={{ color: '#f87171', fontSize: '.82rem', marginBottom: 12 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" style={btnGhost} onClick={onClose}>Cerrar</button>
              <button type="submit" style={{ ...btnPink, opacity: loading ? .6 : 1 }} disabled={loading}>{loading ? 'Guardando...' : 'Guardar pago'}</button>
            </div>
          </form>
        </div>
      </div>

      {overpaymentPending && (
        <ConfirmModal
          title="Pago supera el saldo"
          message={`El saldo pendiente es ${fmt(overpaymentPending.saldo)}. Este pago lo supera en ${fmt(overpaymentPending.diferencia)}. ¿Confirmás igual?`}
          warning="Este pago dejará la cuenta en saldo a favor."
          onConfirm={() => { setOverpaymentPending(null); submitPago(overpaymentPending.monto) }}
          onCancel={() => setOverpaymentPending(null)}
          loading={loading}
          confirmLabel="Confirmar pago"
        />
      )}
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--dg)', border: '1px solid var(--mg)', borderRadius: 10, padding: '16px 18px' }}>
      <div style={{ fontSize: '.7rem', color: 'var(--mt)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontFamily: 'var(--fd)', fontWeight: 600, color: color || 'var(--wh)', lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function MobileField({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: '.66rem', color: 'var(--mt)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3, fontWeight: 500 }}>{label}</div>
      <div style={{ color: 'var(--wh)', fontSize: '.84rem' }}>{children}</div>
    </div>
  )
}

const WA_ICON = (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [options, setOptions] = useState([])
  const [selectedCursoId, setSelectedCursoId] = useState('')
  // '__single__' = explicit selection for non-grupo courses; '' = nothing selected
  const [selectedGrupoName, setSelectedGrupoName] = useState('')
  const [alumnas, setAlumnas] = useState([])
  const [loadingAlumnas, setLoadingAlumnas] = useState(false)
  const [search, setSearch] = useState('')
  const [sortAsc, setSortAsc] = useState(false)
  const [filter, setFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAlumna, setEditingAlumna] = useState(null)
  const [pagoAlumnaId, setPagoAlumnaId] = useState(null)
  const [confirmDeleteAlumna, setConfirmDeleteAlumna] = useState(null)
  const [confirmFinalizar, setConfirmFinalizar] = useState(false)
  const [finalizarError, setFinalizarError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [showFinalizados, setShowFinalizados] = useState(false)
  const [finalizados, setFinalizados] = useState([])
  const [loadingFinalizados, setLoadingFinalizados] = useState(false)
  const [exportContactosMsg, setExportContactosMsg] = useState(null)
  const [exportingContactos, setExportingContactos] = useState(false)
  const [exportingBackup, setExportingBackup] = useState(false)
  const [visitedCounts, setVisitedCounts] = useState({})

  // ── Derived course structure ──────────────────────────────────────────────

  const courses = useMemo(() => buildCourseList(options), [options])

  const selectedCourse = useMemo(
    () => courses.find(c => c.curso_id === selectedCursoId) || null,
    [courses, selectedCursoId]
  )

  // selectedKey: non-grupo courses require '__single__' sentinel; grupo courses require a grupo name
  const selectedKey = useMemo(() => {
    if (!selectedCursoId || !selectedCourse) return ''
    if (!selectedCourse.hasGrupos) {
      return selectedGrupoName === '__single__' ? `${selectedCursoId}|` : ''
    }
    return selectedGrupoName ? `${selectedCursoId}|${selectedGrupoName}` : ''
  }, [selectedCursoId, selectedGrupoName, selectedCourse])

  const selectedOption = useMemo(
    () => (selectedKey && selectedCourse ? selectedCourse.options.find(o => o.key === selectedKey) || null : null),
    [selectedKey, selectedCourse]
  )

  const pagoAlumna = useMemo(
    () => (pagoAlumnaId ? alumnas.find(a => a.id === pagoAlumnaId) || null : null),
    [pagoAlumnaId, alumnas]
  )

  // Per-course count of alumnas added since last visit (sourced from localStorage vs API alumnaCount)
  const courseBadges = useMemo(() => {
    const badges = {}
    for (const opt of options) {
      const key = `lba_visited_${opt.curso_id}_${opt.grupo || ''}`
      if (!(key in visitedCounts)) continue
      const diff = Math.max(0, opt.alumnaCount - visitedCounts[key])
      if (diff > 0) badges[opt.curso_id] = (badges[opt.curso_id] || 0) + diff
    }
    return badges
  }, [options, visitedCounts])

  // Active (non-finalized) groups for courses with grupos
  const activeGroups = useMemo(
    () => (selectedCourse?.hasGrupos ? selectedCourse.options.filter(o => !o.finalizado) : []),
    [selectedCourse]
  )

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchCursos = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/cursos')
      const d = await res.json()
      if (d.cursos) setOptions(buildOptions(d.cursos))
    } catch {}
  }, [])

  useEffect(() => { fetchCursos() }, [fetchCursos])

  // Load all previously-visited edition counts from localStorage on mount
  useEffect(() => {
    try {
      const result = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('lba_visited_')) {
          const raw = localStorage.getItem(key)
          if (raw) {
            const parsed = JSON.parse(raw)
            result[key] = parsed.count ?? 0
          }
        }
      }
      setVisitedCounts(result)
    } catch {}
  }, [])

  // When entering an edition's detail, persist current alumnaCount as "seen" in localStorage
  useEffect(() => {
    if (!selectedKey || !selectedOption) return
    const { curso_id, grupo } = parseKey(selectedKey)
    const key = `lba_visited_${curso_id}_${grupo || ''}`
    const count = selectedOption.alumnaCount
    try {
      localStorage.setItem(key, JSON.stringify({ count, ts: new Date().toISOString() }))
    } catch {}
    setVisitedCounts(prev => prev[key] === count ? prev : { ...prev, [key]: count })
  }, [selectedKey, selectedOption?.alumnaCount])

  const fetchAlumnas = useCallback(async (key) => {
    if (!key) { setAlumnas([]); return [] }
    const { curso_id, grupo } = parseKey(key)
    setLoadingAlumnas(true)
    try {
      const params = new URLSearchParams({ curso_id })
      if (grupo) params.set('grupo', grupo)
      const res = await fetch(`/api/admin/alumnas?${params}`)
      const d = await res.json()
      const list = d.alumnas || []
      setAlumnas(list)
      return list
    } catch {
      setAlumnas([])
      return []
    } finally {
      setLoadingAlumnas(false)
    }
  }, [])

  useEffect(() => { fetchAlumnas(selectedKey) }, [selectedKey, fetchAlumnas])

  const fetchFinalizados = useCallback(async () => {
    setLoadingFinalizados(true)
    try {
      const res = await fetch('/api/admin/finalizados')
      const d = await res.json()
      setFinalizados(d.finalizados || [])
    } catch {}
    finally { setLoadingFinalizados(false) }
  }, [])

  // ── Computed metrics ──────────────────────────────────────────────────────

  const inscriptas = alumnas.length
  const conSaldo = alumnas.filter(a => a.saldoPendiente > 0).length
  const totalCobrado = alumnas.reduce((s, a) => s + (a.totalPagado || 0), 0)
  const totalPorCobrar = alumnas.reduce((s, a) => s + Math.max(0, a.saldoPendiente || 0), 0)
  const cuposDisponibles = CUPO_MAXIMO - inscriptas
  const inscriptasColor = inscriptas > CUPO_MAXIMO ? 'var(--gd)' : 'var(--wh)'

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => alumnas
    .filter(a => filter === 'debe' ? a.saldoPendiente > 0 : filter === 'kit' ? a.kit : true)
    .filter(a => {
      if (!search) return true
      const q = search.toLowerCase()
      return a.nombre.toLowerCase().includes(q) || a.apellido.toLowerCase().includes(q) || (a.whatsapp || '').includes(q)
    })
    .sort((a, b) => {
      const diff = new Date(a.fecha_inscripcion) - new Date(b.fecha_inscripcion)
      return sortAsc ? diff : -diff
    }), [alumnas, filter, search, sortAsc])

  // IDs of alumnas occupying slot 7+ sorted by fecha_inscripcion (not affected by display sort)
  const sobreCapacidadIds = useMemo(() => {
    if (!selectedOption?.tieneCupos || alumnas.length <= CUPO_MAXIMO) return new Set()
    const sorted = [...alumnas].sort((a, b) => new Date(a.fecha_inscripcion) - new Date(b.fecha_inscripcion))
    return new Set(sorted.slice(CUPO_MAXIMO).map(a => a.id))
  }, [alumnas, selectedOption])

  // Last registered alumna among the over-capacity ones (latest fecha_inscripcion)
  const sobreCapacidadInfo = useMemo(() => {
    if (sobreCapacidadIds.size === 0) return null
    const over = alumnas
      .filter(a => sobreCapacidadIds.has(a.id))
      .sort((a, b) => new Date(a.fecha_inscripcion) - new Date(b.fecha_inscripcion))
    const last = over[over.length - 1]
    return last ? { count: sobreCapacidadIds.size, last } : null
  }, [alumnas, sobreCapacidadIds])

  // Alumnas that overpaid (saldoPendiente < 0)
  const sobrepagoInfo = useMemo(() => {
    const over = alumnas.filter(a => a.saldoPendiente < 0)
    if (over.length === 0) return null
    const first = over[0]
    return { count: over.length, alumna: first, exceso: Math.abs(first.saldoPendiente) }
  }, [alumnas])

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function refreshAll() {
    await Promise.all([fetchCursos(), fetchAlumnas(selectedKey)])
  }

  async function handleAddAlumna(formData) {
    setActionLoading(true)
    try {
      const { curso_id, grupo } = parseKey(selectedKey)
      const res = await fetch('/api/admin/alumnas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, curso_id, grupo }),
      })
      const d = await res.json()
      if (!d.ok) return d.error || 'Error al guardar'
      setShowAddModal(false)
      await refreshAll()
    } catch { return 'Error de conexión' }
    finally { setActionLoading(false) }
  }

  async function handleEditAlumna(id, formData) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/alumnas/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const d = await res.json()
      if (!d.ok) return d.error || 'Error al guardar'
      setEditingAlumna(null)
      await fetchAlumnas(selectedKey)
    } catch { return 'Error de conexión' }
    finally { setActionLoading(false) }
  }

  async function handleDeleteAlumna() {
    if (!confirmDeleteAlumna) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/alumnas/${confirmDeleteAlumna.id}`, { method: 'DELETE' })
      const d = await res.json()
      if (!d.ok) return
      setConfirmDeleteAlumna(null)
      await refreshAll()
    } catch {}
    finally { setActionLoading(false) }
  }

  async function handleAddPago(formData) {
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/pagos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const d = await res.json()
      if (!d.ok) return d.error || 'Error al guardar'
      await fetchAlumnas(selectedKey)
    } catch { return 'Error de conexión' }
    finally { setActionLoading(false) }
  }

  async function handleEditPago(pagoId, formData) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/pagos/${pagoId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const d = await res.json()
      if (!d.ok) return d.error || 'Error al guardar'
      await fetchAlumnas(selectedKey)
    } catch { return 'Error de conexión' }
    finally { setActionLoading(false) }
  }

  function handleClickFinalizar() {
    setFinalizarError('')
    if (conSaldo > 0) {
      setFinalizarError(
        `No se puede finalizar: ${conSaldo} alumna${conSaldo > 1 ? 's tienen' : ' tiene'} saldo pendiente.`
      )
      return
    }
    setConfirmFinalizar(true)
  }

  async function handleMarkFinalizado() {
    if (!selectedKey) return
    const { curso_id, grupo } = parseKey(selectedKey)
    const grupoParam = grupo ? encodeURIComponent(grupo) : '_'
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/cursos/${curso_id}/${grupoParam}/finalizar`, { method: 'PATCH' })
      const d = await res.json()
      if (d.ok) {
        setConfirmFinalizar(false)
        setSelectedCursoId('')
        setSelectedGrupoName('')
        await refreshAll()
      }
    } catch {}
    finally { setActionLoading(false) }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  async function handleExportContactos() {
    if (!selectedKey) return
    setExportingContactos(true)
    setExportContactosMsg(null)
    try {
      const { curso_id, grupo } = parseKey(selectedKey)
      const params = new URLSearchParams({ curso_id })
      if (grupo) params.set('grupo', grupo)
      const res = await fetch(`/api/admin/exportar/contactos?${params}`)
      if (!res.ok) {
        const d = await res.json()
        setExportContactosMsg(d.error || 'Error al exportar')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = res.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename="([^"]+)"/)
      a.download = match ? match[1] : 'contactos.vcf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setExportContactosMsg('Error de conexión')
    } finally {
      setExportingContactos(false)
    }
  }

  async function handleExportBackup() {
    setExportingBackup(true)
    try {
      const res = await fetch('/api/admin/exportar/backup')
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = res.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename="([^"]+)"/)
      a.download = match ? match[1] : 'backup-alumnas.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {}
    finally { setExportingBackup(false) }
  }

  function handleSelectCurso(cursoId) {
    setSelectedCursoId(cursoId)
    setSelectedGrupoName('')
    setSearch('')
    setFilter('all')
    setSortAsc(false)
    setFinalizarError('')
    setExportContactosMsg(null)
  }

  function handleSelectGrupo(value) {
    setSelectedGrupoName(value)
    setSearch('')
    setFilter('all')
    setSortAsc(false)
    setFinalizarError('')
    setExportContactosMsg(null)
  }

  function handleOpenFinalizados() {
    setShowFinalizados(true)
    fetchFinalizados()
  }

  function handleVerDetalle(f) {
    setSelectedCursoId(f.curso_id)
    // Non-grupo courses use '__single__' sentinel; grupo courses use the grupo name
    setSelectedGrupoName(f.grupo !== null ? f.grupo : '__single__')
    setShowFinalizados(false)
    setSearch('')
    setFilter('all')
    setSortAsc(false)
    setFinalizarError('')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const showContent = !!selectedKey && !!selectedOption

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bk)', fontFamily: 'var(--fb)' }}>

      <style>{`
        .adm-topbar { background: rgba(26,26,28,.97); border-bottom: 1px solid var(--mg); padding: 0 32px; height: 58px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .adm-main { padding: 28px 32px; max-width: 1280px; margin: 0 auto; }
        .adm-metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
        .adm-table-wrap { background: var(--dg); border: 1px solid var(--mg); border-radius: 10px; overflow: hidden; }
        .adm-table { width: 100%; border-collapse: collapse; }
        .adm-table th { padding: 11px 16px; text-align: left; font-size: .7rem; color: var(--mt); text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid var(--mg); font-weight: 500; white-space: nowrap; }
        .adm-table td { padding: 13px 16px; font-size: .84rem; border-bottom: 1px solid rgba(44,44,47,.5); vertical-align: middle; }
        .adm-table tr:last-child td { border-bottom: none; }
        .adm-table tbody tr:hover td { background: rgba(255,255,255,.02); }
        .adm-mobile-list { display: none; flex-direction: column; gap: 12px; }
        .adm-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .adm-ftab { padding: 7px 15px; border-radius: 20px; font-size: .79rem; font-weight: 500; cursor: pointer; border: 1px solid var(--mg); background: transparent; color: var(--mt); font-family: var(--fb); transition: all .18s; white-space: nowrap; }
        .adm-ftab.on { background: var(--pk); color: var(--bk); border-color: var(--pk); }
        .adm-ftab:hover:not(.on) { border-color: var(--pk); color: var(--pk); }
        .adm-toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
        .adm-search { flex: 1 1 200px; max-width: 320px; background: var(--bk); border: 1px solid var(--mg); border-radius: 5px; padding: 9px 13px; color: var(--wh); font-family: var(--fb); font-size: .85rem; outline: none; }
        .adm-search:focus { border-color: var(--pk); }
        .adm-selects { display: flex; gap: 14px; flex-wrap: wrap; align-items: flex-end; margin-bottom: 24px; }
        .adm-sel-wrap { display: flex; flex-direction: column; gap: 6px; }
        .adm-select { background: var(--bk); border: 1px solid var(--mg); border-radius: 5px; padding: 10px 14px; color: var(--wh); font-family: var(--fb); font-size: .88rem; outline: none; min-width: 200px; max-width: 400px; }
        .adm-select:focus { border-color: var(--pk); }
        .adm-select:disabled { color: var(--mt); opacity: .6; cursor: not-allowed; }
        .adm-no-editions { background: var(--bk); border: 1px solid var(--mg); border-radius: 5px; padding: 10px 14px; color: var(--mt); font-size: .85rem; min-width: 200px; }
        .adm-fin-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 18px; background: var(--dg); border: 1px solid var(--mg); border-radius: 8px; flex-wrap: wrap; }
        .adm-fin-row:hover { border-color: rgba(247,168,184,.25); }
        .fc { width: 100%; box-sizing: border-box; background: var(--bk); border: 1px solid var(--mg); border-radius: 5px; padding: 9px 12px; color: var(--wh); font-family: var(--fb); font-size: .85rem; outline: none; }
        .fc:focus { border-color: var(--pk); }
        @media (max-width: 900px) { .adm-metrics { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 768px) {
          .adm-topbar { padding: 0 16px; }
          .adm-main { padding: 16px; }
          .adm-table-wrap { display: none; }
          .adm-mobile-list { display: flex; }
          .adm-select { min-width: 0; max-width: 100%; width: 100%; }
          .adm-selects { gap: 10px; }
          .adm-sel-wrap { width: 100%; }
          .adm-no-editions { width: 100%; }
          .adm-btn-backup { display: none; }
        }
        @media (max-width: 520px) {
          .adm-metrics { grid-template-columns: 1fr 1fr; }
          .adm-search { max-width: 100%; }
        }
      `}</style>

      {/* Top bar */}
      <div className="adm-topbar">
        <div style={{ fontFamily: 'var(--fd)', fontSize: '1.25rem' }}>
          Lashes Beauty <span style={{ color: 'var(--pk)' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => showFinalizados ? setShowFinalizados(false) : handleOpenFinalizados()}
            style={{ ...btnGhostSm, fontSize: '.78rem', color: showFinalizados ? 'var(--pk)' : 'var(--mt)', borderColor: showFinalizados ? 'rgba(247,168,184,.4)' : 'var(--mg)' }}
          >
            {showFinalizados ? '← Volver' : 'Finalizados'}
          </button>
          <button
            className="adm-btn-backup"
            onClick={handleExportBackup}
            disabled={exportingBackup}
            style={{ ...btnGhostSm, fontSize: '.78rem', opacity: exportingBackup ? .6 : 1 }}
          >
            {exportingBackup ? 'Generando...' : 'Exportar backup'}
          </button>
          <button onClick={handleLogout} style={{ ...btnGhostSm, fontSize: '.78rem' }}>Salir</button>
        </div>
      </div>

      <div className="adm-main">

        {/* ── Finalizados view ───────────────────────────────────────────── */}
        {showFinalizados && (
          <div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: '2rem', marginBottom: 6 }}>Cursos finalizados</div>
            <p style={{ color: 'var(--mt)', fontSize: '.85rem', marginBottom: 24 }}>Ediciones marcadas como finalizadas. Solo lectura.</p>

            {loadingFinalizados && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--mt)' }}>Cargando...</div>
            )}
            {!loadingFinalizados && finalizados.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--mt)', fontSize: '.88rem' }}>
                Ningún curso marcado como finalizado todavía.
              </div>
            )}
            {!loadingFinalizados && finalizados.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {finalizados.map(f => (
                  <div key={f.key} className="adm-fin-row">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '.9rem' }}>
                        {f.curso_nombre}
                        {f.grupo && <span style={{ color: 'var(--pk)', marginLeft: 8, fontWeight: 400, fontSize: '.82rem' }}>{f.grupo}</span>}
                      </div>
                      {f.fecha_inicio && (
                        <div style={{ fontSize: '.75rem', color: 'var(--mt)', marginTop: 3 }}>Inicio: {f.fecha_inicio}</div>
                      )}
                      <div style={{ fontSize: '.75rem', color: 'var(--mt)', marginTop: 2 }}>
                        {f.alumnas} alumna{f.alumnas !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <button style={btnGhostSm} onClick={() => handleVerDetalle(f)}>Ver detalle →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Main view ─────────────────────────────────────────────────── */}
        {!showFinalizados && (
          <>
            {/* Selectors — always both visible when a course is selected */}
            <div className="adm-selects">
              {/* Level 1: all courses, always */}
              <div className="adm-sel-wrap">
                <label style={lblStyle}>Curso</label>
                <select
                  className="adm-select"
                  value={selectedCursoId}
                  onChange={e => handleSelectCurso(e.target.value)}
                >
                  <option value="">— Elegí un curso —</option>
                  {courses.map(c => (
                    <option key={c.curso_id} value={c.curso_id}>
                      {c.nombre}{courseBadges[c.curso_id] ? ` (${courseBadges[c.curso_id]})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level 2: always shown when a course is selected */}
              {selectedCourse && (
                <div className="adm-sel-wrap">
                  <label style={lblStyle}>Edición</label>

                  {/* Non-grupo course: one option with the course date, unless already finalized */}
                  {!selectedCourse.hasGrupos && (
                    selectedCourse.options[0]?.finalizado ? (
                      <div className="adm-no-editions">
                        No hay ediciones activas de este curso
                      </div>
                    ) : (
                      <select
                        className="adm-select"
                        value={selectedGrupoName}
                        onChange={e => handleSelectGrupo(e.target.value)}
                      >
                        <option value="">— Seleccioná la fecha —</option>
                        <option value="__single__">
                          {selectedCourse.fechas || selectedCourse.nombre}
                        </option>
                      </select>
                    )
                  )}

                  {/* Grupo course with active editions */}
                  {selectedCourse.hasGrupos && activeGroups.length > 0 && (
                    <select
                      className="adm-select"
                      value={selectedGrupoName}
                      onChange={e => handleSelectGrupo(e.target.value)}
                    >
                      <option value="">— Elegí una edición —</option>
                      {activeGroups.map(o => (
                        <option key={o.key} value={o.grupoNombre}>
                          {o.grupoNombre}{o.primeraFecha ? ` — ${o.primeraFecha}` : ''}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Grupo course with no active editions */}
                  {selectedCourse.hasGrupos && activeGroups.length === 0 && (
                    <div className="adm-no-editions">
                      No hay ediciones activas de este curso
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Course detail */}
            {showContent && selectedOption && (
              <>
                {/* Cupos: shown only when curso.cupos !== null in lib/cursos.js */}
                {selectedOption.tieneCupos && (
                  <div style={{ marginBottom: 20, fontSize: '.84rem', color: 'var(--mt)' }}>
                    Cupos disponibles:&nbsp;
                    <strong style={{ color: cuposDisponibles <= 0 ? '#f87171' : 'var(--wh)' }}>
                      {Math.max(0, cuposDisponibles)}
                    </strong>
                    <span style={{ color: 'var(--mt)', marginLeft: 6, fontSize: '.76rem' }}>
                      ({CUPO_MAXIMO} máximo)
                    </span>
                  </div>
                )}
                {(sobreCapacidadInfo || sobrepagoInfo) && (
                  <div style={{ marginBottom: 20, background: 'rgba(197,168,128,0.08)', border: '1px solid rgba(197,168,128,0.22)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: '.72rem', fontWeight: 600, color: '#C5A880', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: '.9rem' }}>⚠</span> Avisos
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {sobreCapacidadInfo && (
                        <li style={{ fontSize: '.8rem', color: '#C5A880' }}>
                          {sobreCapacidadInfo.count === 1
                            ? `Superaste el cupo de ${CUPO_MAXIMO} por 1 alumna — última: ${sobreCapacidadInfo.last.nombre} ${sobreCapacidadInfo.last.apellido}.`
                            : `Superaste el cupo de ${CUPO_MAXIMO} por ${sobreCapacidadInfo.count} alumnas — la última: ${sobreCapacidadInfo.last.nombre} ${sobreCapacidadInfo.last.apellido}.`
                          }
                        </li>
                      )}
                      {sobrepagoInfo && (
                        <li style={{ fontSize: '.8rem', color: '#C5A880' }}>
                          {sobrepagoInfo.count === 1
                            ? `1 alumna pagó de más. ${sobrepagoInfo.alumna.nombre} ${sobrepagoInfo.alumna.apellido} pagó ${fmt(sobrepagoInfo.exceso)} de más.`
                            : `${sobrepagoInfo.count} alumnas pagaron de más.`
                          }
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10, marginBottom: exportContactosMsg ? 10 : 20, flexWrap: 'wrap', alignItems: 'center' }}>
                  {!selectedOption.finalizado && (
                    <button style={btnPink} onClick={() => setShowAddModal(true)}>
                      + Agregar alumna
                    </button>
                  )}
                  {/* Only show "Finalizar" if there are alumnas to finalize */}
                  {!selectedOption.finalizado && inscriptas > 0 && (
                    <button
                      style={{ ...btnGhost, opacity: actionLoading ? .5 : 1 }}
                      onClick={handleClickFinalizar}
                      disabled={actionLoading}
                    >
                      ✓ Marcar como finalizado
                    </button>
                  )}
                  {selectedOption.finalizado && (
                    <span style={{ background: 'rgba(197,168,128,.07)', color: 'var(--gd)', border: '1px solid rgba(197,168,128,.2)', borderRadius: 6, padding: '8px 14px', fontSize: '.8rem', fontWeight: 600 }}>
                      ✓ Curso finalizado
                    </span>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <button
                      style={{ ...btnGhost, opacity: exportingContactos ? .6 : 1 }}
                      onClick={handleExportContactos}
                      disabled={exportingContactos}
                    >
                      {exportingContactos ? 'Generando...' : '↓ Exportar contactos'}
                    </button>
                    <span style={{ fontSize: '.71rem', color: 'var(--mt)', maxWidth: 300, lineHeight: 1.4 }}>
                      Se exportan solo las alumnas nuevas desde la última vez. Los contactos importados quedan guardados en tu teléfono de forma permanente, salvo que los borres a mano.
                    </span>
                  </div>
                </div>

                {exportContactosMsg && (
                  <div style={{ background: 'rgba(197,168,128,.06)', border: '1px solid rgba(197,168,128,.2)', borderRadius: 7, padding: '10px 14px', marginBottom: 20, fontSize: '.83rem', color: '#C5A880' }}>
                    {exportContactosMsg}
                  </div>
                )}

                {finalizarError && (
                  <div style={{ background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 7, padding: '10px 14px', marginBottom: 20, fontSize: '.83rem', color: '#f87171' }}>
                    {finalizarError}
                  </div>
                )}

                {/* Metrics */}
                <div className="adm-metrics">
                  <MetricCard label="Inscriptas" value={inscriptas} color={inscriptasColor} />
                  <MetricCard label="Con saldo pendiente" value={conSaldo} color={conSaldo > 0 ? 'var(--gd)' : 'var(--wh)'} />
                  <MetricCard label="Total cobrado" value={fmt(totalCobrado)} color="var(--pk)" />
                  <MetricCard label="Por cobrar" value={fmt(totalPorCobrar)} color={totalPorCobrar > 0 ? '#f87171' : 'var(--mt)'} />
                </div>

                {/* Toolbar */}
                <div className="adm-toolbar">
                  <input
                    type="text" className="adm-search"
                    placeholder="Buscar por nombre o teléfono..."
                    value={search} onChange={e => setSearch(e.target.value)}
                  />
                  <button style={btnGhostSm} onClick={() => setSortAsc(v => !v)}>
                    Fecha {sortAsc ? '↑ asc' : '↓ desc'}
                  </button>
                  <div className="adm-filters">
                    {[{ id: 'all', label: 'Todas' }, { id: 'debe', label: 'Debe saldo' }, { id: 'kit', label: 'Con kit' }].map(f => (
                      <button key={f.id} className={`adm-ftab${filter === f.id ? ' on' : ''}`} onClick={() => setFilter(f.id)}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingAlumnas && (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--mt)' }}>Cargando alumnas...</div>
                )}

                {!loadingAlumnas && filtered.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--mt)', fontSize: '.88rem' }}>
                    {alumnas.length === 0 ? 'No hay alumnas en este curso todavía.' : 'Ninguna alumna coincide con el filtro.'}
                  </div>
                )}

                {/* Desktop table */}
                {!loadingAlumnas && filtered.length > 0 && (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Nombre</th>
                          <th>Kit</th>
                          <th>Pagado / Total</th>
                          <th>Saldo</th>
                          <th>WhatsApp</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(a => (
                          <tr key={a.id} style={sobreCapacidadIds.has(a.id) ? { background: 'rgba(197,168,128,0.12)' } : undefined}>
                            <td style={{ color: 'var(--mt)', whiteSpace: 'nowrap', fontSize: '.8rem' }}>{fmtDate(a.fecha_inscripcion)}</td>
                            <td>
                              <div style={{ fontWeight: 500 }}>{a.nombre} {a.apellido}</div>
                              {a.notas && <div style={{ fontSize: '.72rem', color: 'var(--mt)', marginTop: 2 }}>{a.notas}</div>}
                            </td>
                            <td>
                              {a.kit
                                ? <span style={{ background: 'rgba(197,168,128,.1)', color: 'var(--gd)', border: '1px solid rgba(197,168,128,.22)', padding: '2px 8px', borderRadius: 3, fontSize: '.7rem', fontWeight: 600 }}>Kit ✓</span>
                                : <span style={{ color: 'var(--mt)', fontSize: '.8rem' }}>—</span>
                              }
                            </td>
                            <td>
                              <span style={{ color: 'var(--pk)', fontWeight: 500 }}>{fmt(a.totalPagado)}</span>
                              <span style={{ color: 'var(--mt)', fontSize: '.78rem' }}> / {fmt(a.total)}</span>
                            </td>
                            <td>
                              <span style={{ color: a.saldoPendiente > 0 ? '#f87171' : a.saldoPendiente < 0 ? '#C5A880' : 'var(--mt)', fontWeight: a.saldoPendiente !== 0 ? 600 : 400 }}>
                                {fmt(a.saldoPendiente)}
                              </span>
                            </td>
                            <td>
                              {a.whatsapp
                                ? <a href={buildWaLink(a.whatsapp)} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 500, fontSize: '.84rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{WA_ICON}{a.whatsapp}</a>
                                : <span style={{ color: 'var(--mt)', fontSize: '.8rem' }}>Sin teléfono</span>
                              }
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button style={btnGhostSm} onClick={() => setPagoAlumnaId(a.id)}>+ Pago</button>
                                <button style={btnGhostSm} onClick={() => setEditingAlumna(a)}>Editar</button>
                                <button style={{ ...btnGhostSm, color: '#f87171', borderColor: 'rgba(239,68,68,.3)' }} onClick={() => setConfirmDeleteAlumna(a)}>Eliminar</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Mobile cards */}
                {!loadingAlumnas && filtered.length > 0 && (
                  <div className="adm-mobile-list">
                    {filtered.map(a => (
                      <div key={a.id} style={{ background: sobreCapacidadIds.has(a.id) ? 'rgba(197,168,128,0.12)' : 'var(--dg)', border: '1px solid var(--mg)', borderRadius: 10, padding: '16px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '.95rem' }}>{a.nombre} {a.apellido}</div>
                            {a.notas && <div style={{ fontSize: '.72rem', color: 'var(--mt)', marginTop: 2 }}>{a.notas}</div>}
                          </div>
                          {a.kit && (
                            <span style={{ background: 'rgba(197,168,128,.1)', color: 'var(--gd)', border: '1px solid rgba(197,168,128,.22)', padding: '2px 8px', borderRadius: 3, fontSize: '.7rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>Kit ✓</span>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginBottom: 14 }}>
                          <MobileField label="Fecha">{fmtDate(a.fecha_inscripcion)}</MobileField>
                          <MobileField label="WhatsApp">
                            {a.whatsapp
                              ? <a href={buildWaLink(a.whatsapp)} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{WA_ICON}{a.whatsapp}</a>
                              : <span style={{ color: 'var(--mt)' }}>Sin teléfono</span>
                            }
                          </MobileField>
                          <MobileField label="Pagado / Total">
                            <span style={{ color: 'var(--pk)', fontWeight: 500 }}>{fmt(a.totalPagado)}</span>
                            <span style={{ color: 'var(--mt)', fontSize: '.78rem' }}> / {fmt(a.total)}</span>
                          </MobileField>
                          <MobileField label="Saldo">
                            <span style={{ color: a.saldoPendiente > 0 ? '#f87171' : a.saldoPendiente < 0 ? '#C5A880' : 'var(--mt)', fontWeight: a.saldoPendiente !== 0 ? 600 : 400 }}>
                              {fmt(a.saldoPendiente)}
                            </span>
                          </MobileField>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button style={{ ...btnGhostSm, flex: 1, justifyContent: 'center' }} onClick={() => setPagoAlumnaId(a.id)}>+ Pago</button>
                          <button style={{ ...btnGhostSm, flex: 1, justifyContent: 'center' }} onClick={() => setEditingAlumna(a)}>Editar</button>
                          <button style={{ ...btnGhostSm, color: '#f87171', borderColor: 'rgba(239,68,68,.3)', flex: 1, justifyContent: 'center' }} onClick={() => setConfirmDeleteAlumna(a)}>Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Empty state — no course selected */}
            {!selectedCursoId && (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--mt)' }}>
                <div style={{ fontFamily: 'var(--fd)', fontSize: '3rem', color: 'rgba(247,168,184,.15)', marginBottom: 16 }}>✦</div>
                <p style={{ fontSize: '.9rem' }}>Seleccioná un curso para continuar.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}

      {showAddModal && (
        <AddAlumnaModal onClose={() => setShowAddModal(false)} onSave={handleAddAlumna} loading={actionLoading} />
      )}

      {editingAlumna && (
        <EditAlumnaModal alumna={editingAlumna} onClose={() => setEditingAlumna(null)} onSave={handleEditAlumna} loading={actionLoading} />
      )}

      {pagoAlumna && (
        <AddPagoModal
          alumna={pagoAlumna}
          onClose={() => setPagoAlumnaId(null)}
          onSave={handleAddPago}
          onEditPago={handleEditPago}
          loading={actionLoading}
        />
      )}

      {confirmDeleteAlumna && (
        <ConfirmModal
          title="Eliminar alumna"
          message={`¿Segura que querés eliminar a ${confirmDeleteAlumna.nombre} ${confirmDeleteAlumna.apellido}? Se borrarán también todos sus pagos registrados.`}
          warning="Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={handleDeleteAlumna}
          onCancel={() => setConfirmDeleteAlumna(null)}
          loading={actionLoading}
        />
      )}

      {confirmFinalizar && (
        <ConfirmModal
          title="Marcar como finalizado"
          message="Una vez finalizado, el curso pasa al historial. No se podrán agregar alumnas nuevas ni marcarlo como activo nuevamente desde este panel."
          warning="Esta acción no se puede deshacer."
          confirmLabel="Finalizar curso"
          onConfirm={handleMarkFinalizado}
          onCancel={() => setConfirmFinalizar(false)}
          loading={actionLoading}
        />
      )}
    </div>
  )
}

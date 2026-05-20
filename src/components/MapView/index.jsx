import { useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Navigation, X, Edit2, Trash2, Save, AlertCircle, Zap } from 'lucide-react'
import useStore from '../../store/useStore'
import { EQUIPMENT_TYPES, getStatusColor, STATUS_OPTIONS } from '../../data/equipmentTypes'

// ─── Marker icon factory ──────────────────────────────────────
// Shows a label badge below the circle for alimentadores
const makeIcon = (color, emoji, label = '') => {
  const hasLabel = !!label
  const charW    = Math.max(60, label.length * 7 + 24)
  const totalW   = Math.max(42, charW)
  const totalH   = hasLabel ? 66 : 42

  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;width:${totalW}px">
        <div style="
          width:42px;height:42px;flex-shrink:0;
          background:${color};border-radius:50%;
          border:3px solid white;
          box-shadow:0 3px 14px rgba(0,0,0,.35);
          display:flex;align-items:center;justify-content:center;
          font-size:20px;cursor:pointer;
        ">${emoji}</div>
        ${hasLabel ? `<div style="
          margin-top:4px;
          background:#1e293b;color:white;
          padding:2px 8px;border-radius:5px;
          font-size:11px;font-weight:700;
          white-space:nowrap;
          box-shadow:0 2px 6px rgba(0,0,0,.3);
          max-width:${charW}px;overflow:hidden;text-overflow:ellipsis;
        ">${label}</div>` : ''}
      </div>`,
    iconSize:   [totalW, totalH],
    iconAnchor: [totalW / 2, 21],
    popupAnchor:[0, hasLabel ? -44 : -26],
  })
}

// ─── Internal helpers ─────────────────────────────────────────
function SizeInvalidator() {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    const t1 = setTimeout(() => map.invalidateSize(), 50)
    const t2 = setTimeout(() => map.invalidateSize(), 300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [map])
  return null
}

function ClickHandler({ onMapClick, active }) {
  const map = useMapEvents({ click: (e) => active && onMapClick(e.latlng) })
  useEffect(() => {
    map.getContainer().style.cursor = active ? 'crosshair' : ''
  }, [active, map])
  return null
}

function GeoLocator({ trigger }) {
  const map = useMap()
  useEffect(() => {
    if (!trigger) return
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => map.flyTo([coords.latitude, coords.longitude], 16),
      () => {},
    )
  }, [trigger, map])
  return null
}

// ─── Modal: nomear alimentador ao posicionar ──────────────────
const FEEDER_FIELDS = [
  { key: 'voltage',     label: 'Tensão',        placeholder: 'ex: 13.8kV'       },
  { key: 'current',     label: 'Corrente',       placeholder: 'ex: 200A'          },
  { key: 'power',       label: 'Potência',       placeholder: 'ex: 150kVA'        },
  { key: 'cable',       label: 'Seção do Cabo',  placeholder: 'ex: 150mm²'        },
  { key: 'origin',      label: 'Origem',         placeholder: 'ex: SE Principal'  },
  { key: 'destination', label: 'Destino',        placeholder: 'ex: QD-01'         },
]

function NamingModal({ latlng, onConfirm, onCancel }) {
  const [form, setForm] = useState({
    label: '', voltage: '', current: '',
    power: '', cable: '', origin: '', destination: '',
  })
  const [error, setError] = useState('')

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (k === 'label') setError('') }

  const confirm = () => {
    if (!form.label.trim()) { setError('Nome é obrigatório'); return }
    onConfirm(form)
  }

  const inputStyle = (isError) => ({
    width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 13,
    border: `1.5px solid ${isError ? '#f87171' : '#e2e8f0'}`,
    outline: 'none', boxSizing: 'border-box',
    background: isError ? '#fff5f5' : 'white',
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(15,23,42,.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: 28,
        width: '100%', maxWidth: 420,
        boxShadow: '0 24px 80px rgba(0,0,0,.35)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: '#ffe4e6',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Zap size={22} color="#e11d48" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Novo Alimentador</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
              📍 {latlng.lat.toFixed(5)}, {latlng.lng.toFixed(5)}
            </div>
          </div>
          <button onClick={onCancel}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>
            <X size={20} />
          </button>
        </div>

        {/* Nomenclatura - campo principal */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
            Nome / Nomenclatura *
          </label>
          <input
            autoFocus
            value={form.label}
            onChange={e => set('label', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && confirm()}
            placeholder="ex: AL-01, Alimentador Setor A"
            style={inputStyle(!!error)}
          />
          {error && (
            <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={12} /> {error}
            </div>
          )}
        </div>

        {/* Demais campos 2 colunas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {FEEDER_FIELDS.map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                {f.label}
              </label>
              <input
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirm()}
                placeholder={f.placeholder}
                style={inputStyle(false)}
              />
            </div>
          ))}
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '11px 0', borderRadius: 10,
            border: '1.5px solid #e2e8f0', background: 'white',
            color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={confirm} style={{
            flex: 2, padding: '11px 0', borderRadius: 10, border: 'none',
            background: '#e11d48', color: 'white',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(225,29,72,.4)',
          }}>
            Adicionar ao Mapa
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: detalhes / edição do alimentador ──────────────────
const INFO_FIELDS = [
  { key: 'voltage',     label: 'Tensão'         },
  { key: 'current',     label: 'Corrente Nominal'},
  { key: 'power',       label: 'Potência'        },
  { key: 'cable',       label: 'Seção do Cabo'   },
  { key: 'origin',      label: 'Origem'          },
  { key: 'destination', label: 'Destino'         },
  { key: 'brand',       label: 'Fabricante'      },
  { key: 'model',       label: 'Modelo'          },
  { key: 'notes',       label: 'Observações',  wide: true },
]

function AlimentadorInfoModal({ node, onClose, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ ...node.data })

  // Keep form in sync when the node changes externally (e.g., drag position update)
  useEffect(() => { setForm({ ...node.data }) }, [node.id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = () => { onUpdate(form); setEditing(false) }
  const cancel = () => { setForm({ ...node.data }); setEditing(false) }

  const statusOpt = STATUS_OPTIONS.find(s => s.value === form.status)

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 8, fontSize: 13,
    border: '1.5px solid #e2e8f0', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(15,23,42,.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'white', borderRadius: 20,
        width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,.35)',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          <div style={{
            width: 50, height: 50, borderRadius: 14, background: '#ffe4e6', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>
            🔴
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <input
                value={form.label}
                onChange={e => set('label', e.target.value)}
                autoFocus
                style={{
                  fontSize: 18, fontWeight: 700, color: '#0f172a',
                  border: 'none', borderBottom: '2px solid #e11d48',
                  outline: 'none', width: '100%', padding: '2px 0',
                  background: 'transparent',
                }}
              />
            ) : (
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                {form.label}
              </div>
            )}
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              📍 {node.data.lat?.toFixed(5)}, {node.data.lng?.toFixed(5)}
            </div>
          </div>
          <button onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, flexShrink: 0, lineHeight: 1 }}>
            <X size={20} />
          </button>
        </div>

        {/* ── Status ── */}
        <div style={{
          padding: '10px 24px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Status</span>
          {editing ? (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUS_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => set('status', opt.value)} style={{
                  padding: '3px 12px', borderRadius: 20, border: 'none',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: form.status === opt.value ? opt.color : '#e2e8f0',
                  color: form.status === opt.value ? 'white' : '#64748b',
                  transition: 'all .15s',
                }}>
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <span style={{
              padding: '3px 12px', borderRadius: 20,
              background: statusOpt?.color ?? '#6b7280',
              color: 'white', fontSize: 12, fontWeight: 700,
            }}>
              {statusOpt?.label ?? form.status}
            </span>
          )}
        </div>

        {/* ── Fields ── */}
        <div style={{ padding: '18px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {INFO_FIELDS.map(f => (
              <div key={f.key} style={f.wide ? { gridColumn: '1/-1' } : {}}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#94a3b8',
                  textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5,
                }}>
                  {f.label}
                </div>
                {editing ? (
                  f.wide ? (
                    <textarea
                      value={form[f.key] ?? ''}
                      onChange={e => set(f.key, e.target.value)}
                      rows={2}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      value={form[f.key] ?? ''}
                      onChange={e => set(f.key, e.target.value)}
                      style={inputStyle}
                    />
                  )
                ) : (
                  <div style={{
                    fontSize: 14, fontWeight: form[f.key] ? 500 : 400,
                    color: form[f.key] ? '#1e293b' : '#cbd5e1', minHeight: 22,
                  }}>
                    {form[f.key] || '—'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #f1f5f9',
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <button onClick={onDelete} style={{
            padding: '9px 14px', borderRadius: 10, border: '1.5px solid #fecaca',
            background: 'white', color: '#ef4444', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Trash2 size={14} /> Excluir
          </button>
          <div style={{ flex: 1 }} />
          {editing ? (
            <>
              <button onClick={cancel} style={{
                padding: '9px 16px', borderRadius: 10,
                border: '1.5px solid #e2e8f0', background: 'white',
                color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                Cancelar
              </button>
              <button onClick={save} style={{
                padding: '9px 20px', borderRadius: 10, border: 'none',
                background: '#e11d48', color: 'white', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 4px 14px rgba(225,29,72,.4)',
              }}>
                <Save size={14} /> Salvar
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} style={{
              padding: '9px 20px', borderRadius: 10, border: 'none',
              background: '#0f172a', color: 'white', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Edit2 size={14} /> Editar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Popup for non-alimentador markers ───────────────────────
function NodePopup({ node, onRemove }) {
  const statusLabel = { on: 'Ligado', off: 'Desligado', alarm: 'Alarme', maintenance: 'Manutenção' }
  return (
    <div style={{ padding: '4px 0', minWidth: 180 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{
          width: 36, height: 36, borderRadius: '50%', background: node.data.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
        }}>{node.data.icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{node.data.label}</div>
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{node.data.equipmentType}</div>
        </div>
      </div>
      {node.data.brand && <div style={{ fontSize: 12, color: '#475569', marginBottom: 3 }}><b>Fabricante:</b> {node.data.brand}</div>}
      {node.data.model && <div style={{ fontSize: 12, color: '#475569', marginBottom: 3 }}><b>Modelo:</b> {node.data.model}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(node.data.status) }} />
        <span style={{ fontSize: 12, color: '#475569' }}>{statusLabel[node.data.status] ?? node.data.status}</span>
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
        {node.data.lat?.toFixed(5)}, {node.data.lng?.toFixed(5)}
      </div>
      <button onClick={onRemove} style={{
        width: '100%', padding: '5px 0', background: '#fee2e2', color: '#dc2626',
        border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
      }}>
        Remover do mapa
      </button>
    </div>
  )
}

// ─── Main MapView ─────────────────────────────────────────────
export default function MapView() {
  const { nodes, addEquipmentWithData, updateNodeData, deleteNode } = useStore()

  const [placing,              setPlacing]              = useState(null)
  const [locating,             setLocating]             = useState(null)
  const [geoTick,              setGeoTick]              = useState(0)
  const [mapHeight,            setMapHeight]            = useState(window.innerHeight)
  const [pendingLatLng,        setPendingLatLng]        = useState(null)  // alimentador naming
  const [selectedAlimentadorId, setSelectedAlimentadorId] = useState(null)  // info modal

  useEffect(() => {
    const fn = () => setMapHeight(window.innerHeight)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const locatedNodes   = nodes.filter(n => n.type === 'equipment' && n.data?.lat != null && n.data?.lng != null)
  const unlocatedNodes = nodes.filter(n => n.type === 'equipment' && (n.data?.lat == null || n.data?.lng == null))
  const isActive       = !!(placing || locating)

  // Derive selected alimentador node reactively from store
  const selectedAlimentador = selectedAlimentadorId
    ? nodes.find(n => n.id === selectedAlimentadorId) ?? null
    : null

  const handleMapClick = useCallback((latlng) => {
    if (placing) {
      if (placing.type === 'alimentador') {
        // Show naming modal before saving
        setPendingLatLng(latlng)
        setPlacing(null)
      } else {
        addEquipmentWithData(placing, { x: 0, y: 0 }, { lat: latlng.lat, lng: latlng.lng })
        setPlacing(null)
      }
    } else if (locating) {
      updateNodeData(locating, { lat: latlng.lat, lng: latlng.lng })
      setLocating(null)
    }
  }, [placing, locating, addEquipmentWithData, updateNodeData])

  const handleNamingConfirm = useCallback((formData) => {
    addEquipmentWithData(
      { type: 'alimentador', label: 'Alimentador', icon: '🔴', color: '#e11d48' },
      { x: 0, y: 0 },
      { lat: pendingLatLng.lat, lng: pendingLatLng.lng, ...formData },
    )
    setPendingLatLng(null)
  }, [pendingLatLng, addEquipmentWithData])

  const handleDragEnd = useCallback((node, e) => {
    const { lat, lng } = e.target.getLatLng()
    updateNodeData(node.id, { lat, lng })
  }, [updateNodeData])

  const cancel = () => { setPlacing(null); setLocating(null) }

  return (
    <div style={{ flex: 1, position: 'relative', minWidth: 0, height: '100vh' }}>

      {/* ── Naming modal ── */}
      {pendingLatLng && (
        <NamingModal
          latlng={pendingLatLng}
          onConfirm={handleNamingConfirm}
          onCancel={() => setPendingLatLng(null)}
        />
      )}

      {/* ── Alimentador info modal ── */}
      {selectedAlimentador && (
        <AlimentadorInfoModal
          node={selectedAlimentador}
          onClose={() => setSelectedAlimentadorId(null)}
          onUpdate={(data) => updateNodeData(selectedAlimentador.id, data)}
          onDelete={() => { deleteNode(selectedAlimentador.id); setSelectedAlimentadorId(null) }}
        />
      )}

      {/* ── Toolbar ── */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, display: 'flex', alignItems: 'center', gap: 5,
        background: 'white', borderRadius: 14, padding: '8px 14px',
        boxShadow: '0 4px 24px rgba(0,0,0,.14)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginRight: 6, whiteSpace: 'nowrap', letterSpacing: '.04em' }}>
          ADICIONAR
        </span>
        {EQUIPMENT_TYPES.map(t => (
          <button
            key={t.type}
            onClick={() => { setLocating(null); setPlacing(prev => prev?.type === t.type ? null : t) }}
            title={t.label}
            style={{
              width: 36, height: 36, borderRadius: 8, border: 'none',
              background: placing?.type === t.type ? t.color : '#f1f5f9',
              cursor: 'pointer', fontSize: 18, lineHeight: 1,
              boxShadow: placing?.type === t.type ? `0 0 0 2px white,0 0 0 4px ${t.color}` : 'none',
              transition: 'all .15s',
            }}
          >
            {t.icon}
          </button>
        ))}
        {isActive && (
          <button onClick={cancel} style={{
            width: 36, height: 36, borderRadius: 8, border: '1px solid #e2e8f0',
            background: 'white', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#64748b', marginLeft: 4,
          }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Hint banner ── */}
      {isActive && (
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: '#1e293b', color: 'white',
          padding: '10px 22px', borderRadius: 999, fontSize: 13, fontWeight: 500,
          boxShadow: '0 6px 24px rgba(0,0,0,.25)',
          display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
        }}>
          <MapPin size={15} />
          {placing
            ? `Clique no mapa para posicionar: ${placing.label}`
            : 'Clique no mapa para definir a localização'}
        </div>
      )}

      {/* ── Unlocated nodes panel ── */}
      {unlocatedNodes.length > 0 && (
        <div style={{
          position: 'absolute', right: 12, top: 70, zIndex: 1000,
          background: 'white', borderRadius: 14, padding: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,.14)',
          width: 210, maxHeight: '55vh', overflowY: 'auto',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
            Sem localização · {unlocatedNodes.length}
          </p>
          {unlocatedNodes.map(n => (
            <div
              key={n.id}
              onClick={() => { setPlacing(null); setLocating(prev => prev === n.id ? null : n.id) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 8px', borderRadius: 8, marginBottom: 3,
                background: locating === n.id ? '#eff6ff' : '#f8fafc',
                border: `1px solid ${locating === n.id ? '#bfdbfe' : 'transparent'}`,
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              <span style={{
                width: 30, height: 30, borderRadius: '50%', background: n.data.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0,
              }}>{n.data.icon}</span>
              <span style={{ fontSize: 13, color: '#334155', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {n.data.label}
              </span>
              <MapPin size={13} color={locating === n.id ? '#3b82f6' : '#cbd5e1'} />
            </div>
          ))}
        </div>
      )}

      {/* ── Geolocation button ── */}
      <button
        onClick={() => setGeoTick(t => t + 1)}
        title="Minha localização"
        style={{
          position: 'absolute', left: 12, bottom: 28, zIndex: 1000,
          width: 40, height: 40, borderRadius: 10, background: 'white', border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,.15)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569',
        }}
      >
        <Navigation size={18} />
      </button>

      {/* ── Map ── */}
      <MapContainer
        center={[-15.77, -47.92]}
        zoom={13}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        zoomControl
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />
        <SizeInvalidator />
        <ClickHandler onMapClick={handleMapClick} active={isActive} />
        <GeoLocator trigger={geoTick} />

        {locatedNodes.map(node => {
          const isAlimentador = node.data.equipmentType === 'alimentador'
          return (
            <Marker
              key={node.id}
              position={[node.data.lat, node.data.lng]}
              icon={makeIcon(node.data.color, node.data.icon, isAlimentador ? node.data.label : '')}
              draggable
              eventHandlers={{
                dragend: (e) => handleDragEnd(node, e),
                click: isAlimentador
                  ? (e) => { e.originalEvent.stopPropagation(); setSelectedAlimentadorId(node.id) }
                  : undefined,
              }}
            >
              {!isAlimentador && (
                <Popup>
                  <NodePopup
                    node={node}
                    onRemove={() => updateNodeData(node.id, { lat: null, lng: null })}
                  />
                </Popup>
              )}
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

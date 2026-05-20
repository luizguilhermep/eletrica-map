import { useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Navigation, X } from 'lucide-react'
import useStore from '../../store/useStore'
import { EQUIPMENT_TYPES, getStatusColor } from '../../data/equipmentTypes'

// ─── Marker factory ──────────────────────────────────────────
const makeIcon = (color, emoji) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width:42px;height:42px;
        background:${color};
        border-radius:50%;
        border:3px solid white;
        box-shadow:0 3px 14px rgba(0,0,0,.35);
        display:flex;align-items:center;justify-content:center;
        font-size:20px;
      ">${emoji}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -26],
  })

// ─── Handles map clicks ───────────────────────────────────────
function ClickHandler({ onMapClick, active }) {
  const map = useMapEvents({ click: (e) => active && onMapClick(e.latlng) })
  useEffect(() => {
    map.getContainer().style.cursor = active ? 'crosshair' : ''
  }, [active, map])
  return null
}

// ─── Flies to user's geolocation ──────────────────────────────
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

// ─── Popup content ────────────────────────────────────────────
function NodePopup({ node, onRemove }) {
  const status = {
    on: 'Ligado', off: 'Desligado',
    alarm: 'Alarme', maintenance: 'Manutenção',
  }
  return (
    <div style={{ padding: '4px 0', minWidth: 180 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{
          width: 38, height: 38, borderRadius: '50%', background: node.data.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>
          {node.data.icon}
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{node.data.label}</div>
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>
            {node.data.equipmentType}
          </div>
        </div>
      </div>

      {node.data.brand && (
        <div style={{ fontSize: 12, color: '#475569', marginBottom: 3 }}>
          <b>Fabricante:</b> {node.data.brand}
        </div>
      )}
      {node.data.model && (
        <div style={{ fontSize: 12, color: '#475569', marginBottom: 3 }}>
          <b>Modelo:</b> {node.data.model}
        </div>
      )}
      {node.data.notes && (
        <div style={{ fontSize: 12, color: '#475569', marginBottom: 3 }}>
          <b>Obs:</b> {node.data.notes}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '10px 0 8px' }}>
        <div style={{
          width: 9, height: 9, borderRadius: '50%',
          background: getStatusColor(node.data.status), flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, color: '#475569' }}>
          {status[node.data.status] ?? node.data.status}
        </span>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
        {node.data.lat?.toFixed(5)}, {node.data.lng?.toFixed(5)}
      </div>

      <button
        onClick={onRemove}
        style={{
          width: '100%', padding: '5px 0', background: '#fee2e2',
          color: '#dc2626', border: 'none', borderRadius: 6,
          cursor: 'pointer', fontSize: 12, fontWeight: 600,
        }}
      >
        Remover do mapa
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────
export default function MapView() {
  const { nodes, addEquipmentWithData, updateNodeData } = useStore()
  const [placing, setPlacing]   = useState(null)  // equipment type being placed
  const [locating, setLocating] = useState(null)  // nodeId being located from panel
  const [geoTick, setGeoTick]   = useState(0)

  const locatedNodes   = nodes.filter(n => n.type === 'equipment' && n.data?.lat != null && n.data?.lng != null)
  const unlocatedNodes = nodes.filter(n => n.type === 'equipment' && (n.data?.lat == null || n.data?.lng == null))
  const isActive = !!(placing || locating)

  const handleMapClick = useCallback((latlng) => {
    if (placing) {
      addEquipmentWithData(placing, { x: 0, y: 0 }, { lat: latlng.lat, lng: latlng.lng })
      setPlacing(null)
    } else if (locating) {
      updateNodeData(locating, { lat: latlng.lat, lng: latlng.lng })
      setLocating(null)
    }
  }, [placing, locating, addEquipmentWithData, updateNodeData])

  const handleDragEnd = useCallback((node, e) => {
    const { lat, lng } = e.target.getLatLng()
    updateNodeData(node.id, { lat, lng })
  }, [updateNodeData])

  const cancel = () => { setPlacing(null); setLocating(null) }

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

      {/* ── Top toolbar ── */}
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
              boxShadow: placing?.type === t.type ? `0 0 0 2px white, 0 0 0 4px ${t.color}` : 'none',
              transition: 'all .15s',
            }}
          >
            {t.icon}
          </button>
        ))}
        {isActive && (
          <button
            onClick={cancel}
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: '1px solid #e2e8f0', background: 'white',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#64748b', marginLeft: 2,
            }}
          >
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
            : 'Clique no mapa para definir a localização do equipamento'}
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
          <p style={{
            fontSize: 11, fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10,
          }}>
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
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, flexShrink: 0,
              }}>
                {n.data.icon}
              </span>
              <span style={{
                fontSize: 13, color: '#334155', flex: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
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
        title="Centralizar na minha localização"
        style={{
          position: 'absolute', left: 12, bottom: 28, zIndex: 1000,
          width: 40, height: 40, borderRadius: 10,
          background: 'white', border: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,.15)',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#475569',
        }}
      >
        <Navigation size={18} />
      </button>

      {/* ── Leaflet Map ── */}
      <MapContainer
        center={[-15.77, -47.92]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ClickHandler onMapClick={handleMapClick} active={isActive} />
        <GeoLocator trigger={geoTick} />

        {locatedNodes.map(node => (
          <Marker
            key={node.id}
            position={[node.data.lat, node.data.lng]}
            icon={makeIcon(node.data.color, node.data.icon)}
            draggable
            eventHandlers={{ dragend: (e) => handleDragEnd(node, e) }}
          >
            <Popup>
              <NodePopup
                node={node}
                onRemove={() => updateNodeData(node.id, { lat: null, lng: null })}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

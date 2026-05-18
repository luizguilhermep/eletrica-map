import { useRef } from 'react'
import { Image, Trash2 } from 'lucide-react'
import { EQUIPMENT_TYPES } from '../../data/equipmentTypes'
import useStore from '../../store/useStore'

export default function Sidebar() {
  const { setBackground, clearBackground, nodes } = useStore()
  const fileRef = useRef(null)
  const hasBackground = nodes.some(n => n.id === '__background__')

  const onDragStart = (e, type) => {
    e.dataTransfer.setData('application/xyflow', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setBackground(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="w-56 h-full bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h1 className="font-bold text-slate-800 text-sm">Planta Elétrica</h1>
        <p className="text-xs text-slate-500 mt-0.5">Sistema de gerenciamento</p>
      </div>

      <div className="p-3 border-b border-slate-200">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Planta baixa
        </p>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors"
        >
          <Image size={13} />
          {hasBackground ? 'Trocar imagem' : 'Carregar imagem'}
        </button>
        {hasBackground && (
          <button
            onClick={clearBackground}
            className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-xs hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg text-red-500 transition-colors"
          >
            <Trash2 size={13} />
            Remover imagem
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Equipamentos
        </p>
        <div className="flex flex-col gap-1.5">
          {EQUIPMENT_TYPES.map((equip) => (
            <div
              key={equip.type}
              draggable
              onDragStart={(e) => onDragStart(e, equip.type)}
              className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-grab active:cursor-grabbing select-none transition-colors"
              style={{ borderLeftColor: equip.color, borderLeftWidth: 3 }}
            >
              <span className="text-lg leading-none">{equip.icon}</span>
              <span className="text-sm text-slate-700">{equip.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">Arraste para o canvas</p>
      </div>
    </div>
  )
}

import { useRef } from 'react'
import { Image, Trash2, Zap, LogOut } from 'lucide-react'
import { EQUIPMENT_TYPES } from '../../data/equipmentTypes'
import useStore from '../../store/useStore'

export default function Sidebar({ onOpenAlimentadores }) {
  const { setBackground, clearBackground, nodes, user, signOut } = useStore()
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
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-500 truncate min-w-0 flex-1">{user?.email}</p>
          <button
            onClick={signOut}
            title="Sair"
            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors shrink-0 ml-1"
          >
            <LogOut size={13} />
          </button>
        </div>
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

      <div className="p-3 border-b border-slate-200">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Alimentadores
        </p>
        <button
          onClick={onOpenAlimentadores}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-rose-700 font-medium transition-colors"
        >
          <Zap size={13} />
          Gerenciar Alimentadores
        </button>
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

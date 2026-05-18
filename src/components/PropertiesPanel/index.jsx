import { Trash2, X } from 'lucide-react'
import useStore from '../../store/useStore'
import { EQUIPMENT_TYPES, STATUS_OPTIONS } from '../../data/equipmentTypes'

export default function PropertiesPanel() {
  const { nodes, selectedNodeId, updateNodeData, deleteNode, selectNode } = useStore()

  const node = nodes.find(n => n.id === selectedNodeId && n.type === 'equipment')
  if (!node) return null

  const { data } = node
  const equipType = EQUIPMENT_TYPES.find(t => t.type === data.equipmentType)
  const set = (key, value) => updateNodeData(node.id, { [key]: value })

  return (
    <div className="w-72 h-full bg-white border-l border-slate-200 flex flex-col overflow-hidden shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl leading-none shrink-0">{data.icon}</span>
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Propriedades</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{data.label}</p>
          </div>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="p-1 hover:bg-slate-200 rounded shrink-0"
        >
          <X size={15} className="text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nome</label>
          <input
            type="text"
            value={data.label}
            onChange={e => set('label', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Status</label>
          <div className="grid grid-cols-2 gap-1.5">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => set('status', opt.value)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  data.status === opt.value
                    ? 'border-transparent text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                style={data.status === opt.value ? { backgroundColor: opt.color } : {}}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: opt.color }}
                />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {equipType?.fields?.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Dados Técnicos</label>
            <div className="space-y-2">
              {equipType.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs text-slate-500 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={data[field.key] ?? ''}
                    onChange={e => set(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Marca</label>
            <input
              type="text"
              value={data.brand ?? ''}
              onChange={e => set('brand', e.target.value)}
              placeholder="ex: ABB"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Modelo</label>
            <input
              type="text"
              value={data.model ?? ''}
              onChange={e => set('model', e.target.value)}
              placeholder="ex: CB1"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
          <textarea
            value={data.notes ?? ''}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            placeholder="Anotações sobre o equipamento..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="p-4 border-t border-slate-200">
        <button
          onClick={() => deleteNode(node.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm text-red-600 font-medium transition-colors"
        >
          <Trash2 size={13} />
          Remover equipamento
        </button>
      </div>
    </div>
  )
}

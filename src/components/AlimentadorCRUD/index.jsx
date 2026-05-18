import { useState } from 'react'
import { X, Plus, Pencil, Trash2, Zap, AlertCircle } from 'lucide-react'
import useStore from '../../store/useStore'
import { STATUS_OPTIONS } from '../../data/equipmentTypes'

const ALIMENTADOR_TYPE = {
  type: 'alimentador',
  label: 'Alimentador',
  icon: '🔴',
  color: '#e11d48',
}

const EMPTY_FORM = {
  label: '',
  voltage: '',
  current: '',
  power: '',
  cable: '',
  origin: '',
  destination: '',
  status: 'off',
  brand: '',
  model: '',
  notes: '',
}

const FORM_FIELDS = [
  { key: 'label',       label: 'Nome *',          placeholder: 'ex: Alimentador 01', span: 2 },
  { key: 'voltage',     label: 'Tensão',           placeholder: 'ex: 13.8kV' },
  { key: 'current',     label: 'Corrente Nominal', placeholder: 'ex: 200A' },
  { key: 'power',       label: 'Potência',         placeholder: 'ex: 150 kVA' },
  { key: 'cable',       label: 'Seção do Cabo',    placeholder: 'ex: 150mm²' },
  { key: 'origin',      label: 'Origem',           placeholder: 'ex: SE Principal' },
  { key: 'destination', label: 'Destino',          placeholder: 'ex: Quadro QD-01' },
  { key: 'brand',       label: 'Fabricante',       placeholder: 'ex: Pirelli' },
  { key: 'model',       label: 'Modelo',           placeholder: 'ex: PN-150' },
]

export default function AlimentadorCRUD({ onClose }) {
  const { nodes, updateNodeData, deleteNode, addEquipmentWithData } = useStore()
  const [form, setForm] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})

  const feeders = nodes.filter(
    n => n.type === 'equipment' && n.data.equipmentType === 'alimentador',
  )

  const openNew = () => {
    setForm({ ...EMPTY_FORM })
    setEditingId(null)
    setErrors({})
  }

  const openEdit = (node) => {
    const d = node.data
    setForm({
      label:       d.label       ?? '',
      voltage:     d.voltage     ?? '',
      current:     d.current     ?? '',
      power:       d.power       ?? '',
      cable:       d.cable       ?? '',
      origin:      d.origin      ?? '',
      destination: d.destination ?? '',
      status:      d.status      ?? 'off',
      brand:       d.brand       ?? '',
      model:       d.model       ?? '',
      notes:       d.notes       ?? '',
    })
    setEditingId(node.id)
    setErrors({})
  }

  const cancelForm = () => {
    setForm(null)
    setEditingId(null)
    setErrors({})
  }

  const setField = (key, value) => {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  const handleSave = () => {
    if (!form.label.trim()) {
      setErrors({ label: 'Nome é obrigatório' })
      return
    }
    if (editingId) {
      updateNodeData(editingId, form)
    } else {
      const position = {
        x: 150 + Math.floor(Math.random() * 350),
        y: 150 + Math.floor(Math.random() * 250),
      }
      addEquipmentWithData(ALIMENTADOR_TYPE, position, form)
    }
    cancelForm()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-rose-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">Alimentadores</h2>
              <p className="text-xs text-slate-500">
                {feeders.length} cadastrado{feeders.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!form && (
              <button
                onClick={openNew}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus size={14} />
                Novo
              </button>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <X size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Form */}
          {form && (
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                {editingId ? 'Editar alimentador' : 'Novo alimentador'}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {FORM_FIELDS.map(field => (
                  <div key={field.key} className={field.span === 2 ? 'col-span-2' : ''}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={form[field.key]}
                      onChange={e => setField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      onKeyDown={e => e.key === 'Enter' && handleSave()}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-slate-300 bg-white ${
                        errors[field.key] ? 'border-red-400' : 'border-slate-200'
                      }`}
                    />
                    {errors[field.key] && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} />
                        {errors[field.key]}
                      </p>
                    )}
                  </div>
                ))}

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-2">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setField('status', opt.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                          form.status === opt.value
                            ? 'border-transparent text-white'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                        style={form.status === opt.value ? { backgroundColor: opt.color } : {}}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={cancelForm}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors"
                >
                  {editingId ? 'Salvar alterações' : 'Criar alimentador'}
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {feeders.length === 0 && !form && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Zap size={22} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">Nenhum alimentador cadastrado</p>
              <p className="text-xs text-slate-400 mt-1">Clique em "Novo" para adicionar o primeiro</p>
            </div>
          )}

          {/* Table */}
          {feeders.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  {['Nome', 'Tensão', 'Corrente', 'Origem → Destino', 'Status', ''].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feeders.map((node) => {
                  const d = node.data
                  const statusOpt = STATUS_OPTIONS.find(s => s.value === d.status)
                  return (
                    <tr key={node.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{d.label}</td>
                      <td className="px-4 py-3 text-slate-600">{d.voltage || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{d.current || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {d.origin || d.destination
                          ? `${d.origin || '?'} → ${d.destination || '?'}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: statusOpt?.color ?? '#6b7280' }}
                        >
                          {statusOpt?.label ?? d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openEdit(node)}
                            title="Editar"
                            className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteNode(node.id)}
                            title="Excluir"
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

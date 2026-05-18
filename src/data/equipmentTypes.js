export const EQUIPMENT_TYPES = [
  {
    type: 'transformer',
    label: 'Transformador',
    icon: '⚡',
    color: '#f59e0b',
    fields: [
      { key: 'voltage_primary', label: 'Tensão Primária', placeholder: 'ex: 13.8kV' },
      { key: 'voltage_secondary', label: 'Tensão Secundária', placeholder: 'ex: 380V' },
      { key: 'power', label: 'Potência', placeholder: 'ex: 500 kVA' },
    ],
  },
  {
    type: 'breaker',
    label: 'Disjuntor',
    icon: '🔌',
    color: '#3b82f6',
    fields: [
      { key: 'voltage', label: 'Tensão', placeholder: 'ex: 380V' },
      { key: 'current', label: 'Corrente nominal', placeholder: 'ex: 100A' },
      { key: 'trip_current', label: 'Corrente de curto', placeholder: 'ex: 10kA' },
    ],
  },
  {
    type: 'meter',
    label: 'Medidor',
    icon: '📊',
    color: '#8b5cf6',
    fields: [
      { key: 'voltage', label: 'Tensão', placeholder: 'ex: 220V' },
      { key: 'current', label: 'Corrente', placeholder: 'ex: 200A' },
    ],
  },
  {
    type: 'generator',
    label: 'Gerador',
    icon: '🔋',
    color: '#10b981',
    fields: [
      { key: 'voltage', label: 'Tensão', placeholder: 'ex: 380V' },
      { key: 'power', label: 'Potência', placeholder: 'ex: 200 kVA' },
      { key: 'fuel', label: 'Combustível', placeholder: 'ex: Diesel' },
    ],
  },
  {
    type: 'panel',
    label: 'Quadro',
    icon: '🗂️',
    color: '#ef4444',
    fields: [
      { key: 'voltage', label: 'Tensão', placeholder: 'ex: 220/127V' },
      { key: 'circuits', label: 'Nº de Circuitos', placeholder: 'ex: 24' },
    ],
  },
  {
    type: 'motor',
    label: 'Motor',
    icon: '⚙️',
    color: '#6366f1',
    fields: [
      { key: 'voltage', label: 'Tensão', placeholder: 'ex: 380V' },
      { key: 'power', label: 'Potência', placeholder: 'ex: 75 kW' },
      { key: 'rpm', label: 'RPM', placeholder: 'ex: 1750' },
    ],
  },
  {
    type: 'load',
    label: 'Carga/Tomada',
    icon: '🔆',
    color: '#06b6d4',
    fields: [
      { key: 'voltage', label: 'Tensão', placeholder: 'ex: 220V' },
      { key: 'power', label: 'Potência', placeholder: 'ex: 2000 W' },
    ],
  },
  {
    type: 'alimentador',
    label: 'Alimentador',
    icon: '🔴',
    color: '#e11d48',
    fields: [
      { key: 'voltage', label: 'Tensão', placeholder: 'ex: 13.8kV' },
      { key: 'current', label: 'Corrente Nominal', placeholder: 'ex: 200A' },
      { key: 'power', label: 'Potência', placeholder: 'ex: 150 kVA' },
      { key: 'cable', label: 'Seção do Cabo', placeholder: 'ex: 150mm²' },
      { key: 'origin', label: 'Origem', placeholder: 'ex: SE Principal' },
      { key: 'destination', label: 'Destino', placeholder: 'ex: Quadro QD-01' },
    ],
  },
]

export const STATUS_OPTIONS = [
  { value: 'on', label: 'Ligado', color: '#22c55e' },
  { value: 'off', label: 'Desligado', color: '#6b7280' },
  { value: 'alarm', label: 'Alarme', color: '#ef4444' },
  { value: 'maintenance', label: 'Manutenção', color: '#f59e0b' },
]

export const getStatusColor = (status) =>
  STATUS_OPTIONS.find(s => s.value === status)?.color ?? '#6b7280'

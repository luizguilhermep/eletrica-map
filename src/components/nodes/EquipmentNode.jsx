import { Handle, Position } from '@xyflow/react'
import { getStatusColor } from '../../data/equipmentTypes'
import useStore from '../../store/useStore'

export default function EquipmentNode({ id, data, selected }) {
  const selectNode = useStore(s => s.selectNode)

  return (
    <div
      onClick={() => selectNode(id)}
      className={`relative flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 cursor-pointer transition-all select-none ${
        selected ? 'shadow-lg' : 'shadow-sm hover:shadow-md'
      }`}
      style={{
        backgroundColor: `${data.color}18`,
        borderColor: selected ? data.color : `${data.color}80`,
        outline: selected ? `2px solid ${data.color}` : 'none',
        outlineOffset: 2,
      }}
    >
      <div
        className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
        style={{ backgroundColor: getStatusColor(data.status) }}
      />

      <span className="text-2xl leading-none">{data.icon}</span>

      <span
        className="text-xs font-medium text-center leading-tight mt-1 px-1 w-full truncate"
        style={{ color: '#374151' }}
      >
        {data.label}
      </span>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

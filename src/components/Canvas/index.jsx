import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react'
import useStore from '../../store/useStore'
import EquipmentNode from '../nodes/EquipmentNode'
import BackgroundImageNode from '../nodes/BackgroundImageNode'
import { EQUIPMENT_TYPES } from '../../data/equipmentTypes'

const nodeTypes = {
  equipment: EquipmentNode,
  backgroundImage: BackgroundImageNode,
}

export default function Canvas() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    addEquipment, selectNode, syncNodePosition,
  } = useStore()

  const { screenToFlowPosition } = useReactFlow()

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      const typeKey = e.dataTransfer.getData('application/xyflow')
      if (!typeKey) return
      const equipType = EQUIPMENT_TYPES.find(t => t.type === typeKey)
      if (!equipType) return
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      addEquipment(equipType, position)
    },
    [screenToFlowPosition, addEquipment],
  )

  return (
    <div className="flex-1 h-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={() => selectNode(null)}
        onNodeDragStop={(_, node) => syncNodePosition(node.id, node.position)}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode="Delete"
        style={{ background: '#f1f5f9' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
        <Controls />
        <MiniMap
          nodeColor={n => n.data?.color ?? '#6b7280'}
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
        />
      </ReactFlow>
    </div>
  )
}

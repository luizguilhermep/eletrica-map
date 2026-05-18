import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'

const useStore = create(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,

      onNodesChange: (changes) =>
        set({ nodes: applyNodeChanges(changes, get().nodes) }),

      onEdgesChange: (changes) =>
        set({ edges: applyEdgeChanges(changes, get().edges) }),

      onConnect: (connection) =>
        set({
          edges: addEdge(
            { ...connection, animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } },
            get().edges,
          ),
        }),

      addEquipment: (equipType, position) => {
        const id = `node_${Date.now()}`
        set({
          nodes: [
            ...get().nodes,
            {
              id,
              type: 'equipment',
              position,
              data: {
                label: equipType.label,
                equipmentType: equipType.type,
                icon: equipType.icon,
                color: equipType.color,
                status: 'off',
                brand: '',
                model: '',
                notes: '',
              },
            },
          ],
          selectedNodeId: id,
        })
      },

      updateNodeData: (id, patch) =>
        set({
          nodes: get().nodes.map(n =>
            n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
          ),
        }),

      deleteNode: (id) =>
        set({
          nodes: get().nodes.filter(n => n.id !== id),
          edges: get().edges.filter(e => e.source !== id && e.target !== id),
          selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
        }),

      selectNode: (id) => set({ selectedNodeId: id }),

      setBackground: (dataUrl) =>
        set((state) => ({
          nodes: [
            {
              id: '__background__',
              type: 'backgroundImage',
              position: { x: 0, y: 0 },
              data: { src: dataUrl },
              draggable: false,
              selectable: false,
              deletable: false,
              zIndex: -1,
            },
            ...state.nodes.filter(n => n.id !== '__background__'),
          ],
        })),

      clearBackground: () =>
        set((state) => ({
          nodes: state.nodes.filter(n => n.id !== '__background__'),
        })),
    }),
    {
      name: 'eletrica-map',
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
    },
  ),
)

export default useStore

import { create } from 'zustand'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'
import { supabase } from '../lib/supabase'
import * as db from '../lib/db'

const makeBackgroundNode = (src) => ({
  id: '__background__',
  type: 'backgroundImage',
  position: { x: 0, y: 0 },
  data: { src },
  draggable: false,
  selectable: false,
  deletable: false,
  zIndex: -1,
})

const useStore = create((set, get) => ({
  // ─── Auth ────────────────────────────────────────────────────
  user: null,
  plantId: null,
  authLoading: true,

  // ─── React Flow ──────────────────────────────────────────────
  nodes: [],
  edges: [],
  selectedNodeId: null,

  // ─── Initialize ──────────────────────────────────────────────
  initialize: () => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          await get()._loadUserData(session.user)
        }
        set({ authLoading: false })
      } else if (event === 'SIGNED_IN' && !get().plantId) {
        await get()._loadUserData(session.user)
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, plantId: null, nodes: [], edges: [], selectedNodeId: null })
      }
    })
  },

  _loadUserData: async (user) => {
    try {
      set({ user })
      const plant = await db.getOrCreatePlant(user.id)
      const { nodes, edges } = await db.loadPlantData(plant.id)
      const allNodes = plant.background_data
        ? [makeBackgroundNode(plant.background_data), ...nodes]
        : nodes
      set({ plantId: plant.id, nodes: allNodes, edges })
    } catch (err) {
      console.error('Failed to load user data:', err)
    }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  },

  signOut: async () => {
    await supabase.auth.signOut()
  },

  // ─── React Flow handlers ─────────────────────────────────────
  onNodesChange: (changes) => {
    const { nodes, plantId } = get()
    if (plantId) {
      changes
        .filter(c => c.type === 'remove' && c.id !== '__background__')
        .forEach(c => {
          db.removeNode(plantId, c.id)
          db.removeEdgesByNode(plantId, c.id)
        })
    }
    set({ nodes: applyNodeChanges(changes, nodes) })
  },

  onEdgesChange: (changes) => {
    const { edges, plantId } = get()
    if (plantId) {
      changes
        .filter(c => c.type === 'remove')
        .forEach(c => db.removeEdge(plantId, c.id))
    }
    set({ edges: applyEdgeChanges(changes, edges) })
  },

  onConnect: (connection) => {
    const { plantId, edges } = get()
    const newEdge = {
      ...connection,
      id: `edge_${Date.now()}`,
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    }
    const nextEdges = addEdge(newEdge, edges)
    // Persist only if a new edge was actually added
    if (nextEdges.length > edges.length && plantId) {
      db.upsertEdge(plantId, newEdge)
    }
    set({ edges: nextEdges })
  },

  syncNodePosition: (nodeId, position) => {
    const { plantId } = get()
    if (plantId && nodeId !== '__background__') {
      db.updateNodePosition(plantId, nodeId, position.x, position.y)
    }
  },

  // ─── Equipment actions ───────────────────────────────────────
  addEquipment: (equipType, position) => {
    const { plantId, nodes } = get()
    const id = `node_${Date.now()}`
    const node = {
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
    }
    if (plantId) db.upsertNode(plantId, node)
    set({ nodes: [...nodes, node], selectedNodeId: id })
  },

  addEquipmentWithData: (equipType, position, data = {}) => {
    const { plantId, nodes } = get()
    const id = `node_${Date.now()}`
    const node = {
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
        ...data,
      },
    }
    if (plantId) db.upsertNode(plantId, node)
    set({ nodes: [...nodes, node] })
  },

  updateNodeData: (id, patch) => {
    const { plantId, nodes } = get()
    const updated = nodes.map(n =>
      n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
    )
    set({ nodes: updated })
    if (plantId) {
      const node = updated.find(n => n.id === id)
      if (node) db.patchNodeData(plantId, id, node.data)
    }
  },

  deleteNode: (id) => {
    const { plantId, nodes, edges, selectedNodeId } = get()
    if (plantId) {
      db.removeNode(plantId, id)
      db.removeEdgesByNode(plantId, id)
    }
    set({
      nodes: nodes.filter(n => n.id !== id),
      edges: edges.filter(e => e.source !== id && e.target !== id),
      selectedNodeId: selectedNodeId === id ? null : selectedNodeId,
    })
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  setBackground: (dataUrl) => {
    const { plantId, nodes } = get()
    if (plantId) db.updateBackground(plantId, dataUrl)
    set({
      nodes: [makeBackgroundNode(dataUrl), ...nodes.filter(n => n.id !== '__background__')],
    })
  },

  clearBackground: () => {
    const { plantId, nodes } = get()
    if (plantId) db.updateBackground(plantId, null)
    set({ nodes: nodes.filter(n => n.id !== '__background__') })
  },
}))

export default useStore

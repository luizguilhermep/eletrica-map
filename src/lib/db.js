import { auth } from './firebase'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Get a fresh Firebase ID token for every request
const getToken = async () => {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  return user.getIdToken()
}

// Generic fetch wrapper
const req = async (method, path, body) => {
  const token = await getToken()
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)

  const res = await fetch(`${BASE}${path}`, opts)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`[${method} ${path}] ${res.status}: ${text}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// ─── Converters (API ↔ React Flow) ───────────────────────────
const toRFNode = (n) => ({
  id: n.id,
  type: n.nodeType,
  position: { x: n.positionX ?? 0, y: n.positionY ?? 0 },
  data: n.data ?? {},
  zIndex: n.zIndex ?? 0,
  draggable: n.draggable ?? true,
  selectable: n.selectable ?? true,
  deletable: n.deletable ?? true,
})

const toRFEdge = (e) => ({
  id: e.id,
  source: e.source,
  target: e.target,
  sourceHandle: e.sourceHandle ?? null,
  targetHandle: e.targetHandle ?? null,
  animated: e.animated ?? true,
  style: e.style ?? {},
})

const fromRFNode = (node) => ({
  id: node.id,
  nodeType: node.type,
  positionX: node.position.x,
  positionY: node.position.y,
  data: node.data,
  zIndex: node.zIndex ?? 0,
  draggable: node.draggable ?? true,
  selectable: node.selectable ?? true,
  deletable: node.deletable ?? true,
})

const fromRFEdge = (edge) => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  sourceHandle: edge.sourceHandle ?? null,
  targetHandle: edge.targetHandle ?? null,
  animated: edge.animated ?? true,
  style: edge.style ?? {},
})

// ─── Plant ───────────────────────────────────────────────────
export const getOrCreatePlant = () => req('GET', '/api/plant')

export const updateBackground = (_uid, dataUrl) =>
  req('PATCH', '/api/plant/background', { backgroundData: dataUrl ?? null })

// ─── Load ────────────────────────────────────────────────────
export const loadPlantData = async () => {
  const [nodes, edges] = await Promise.all([
    req('GET', '/api/nodes'),
    req('GET', '/api/edges'),
  ])
  return {
    nodes: nodes.map(toRFNode),
    edges: edges.map(toRFEdge),
  }
}

// ─── Nodes ───────────────────────────────────────────────────
// Create a new node
export const upsertNode = (_uid, node) =>
  req('POST', '/api/nodes', fromRFNode(node))

// Update an existing node (full replacement)
export const updateNode = (_uid, node) =>
  req('PUT', `/api/nodes/${node.id}`, fromRFNode(node))

// Update only position
export const updateNodePosition = (_uid, nodeId, x, y) =>
  req('PATCH', `/api/nodes/${nodeId}/position`, { x, y })

// Delete node (backend also removes its edges)
export const removeNode = (_uid, nodeId) =>
  req('DELETE', `/api/nodes/${nodeId}`)

// No-op: backend handles cascade when deleting a node
export const removeEdgesByNode = () => Promise.resolve()

// ─── Edges ───────────────────────────────────────────────────
export const upsertEdge = (_uid, edge) =>
  req('POST', '/api/edges', fromRFEdge(edge))

export const removeEdge = (_uid, edgeId) =>
  req('DELETE', `/api/edges/${edgeId}`)

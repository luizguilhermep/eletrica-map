import {
  doc, collection,
  getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  writeBatch, query, where,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── Path helpers ────────────────────────────────────────────
const plantRef  = (uid)          => doc(db,  'plants', uid)
const nodesRef  = (uid)          => collection(db, 'plants', uid, 'nodes')
const edgesRef  = (uid)          => collection(db, 'plants', uid, 'edges')
const nodeRef   = (uid, nodeId)  => doc(db,  'plants', uid, 'nodes', nodeId)
const edgeRef   = (uid, edgeId)  => doc(db,  'plants', uid, 'edges', edgeId)

// ─── Converters ──────────────────────────────────────────────
const toRFNode = (id, d) => ({
  id,
  type:      d.node_type,
  position:  { x: d.position_x, y: d.position_y },
  data:      d.data,
  zIndex:    d.z_index    ?? 0,
  draggable: d.draggable  ?? true,
  selectable:d.selectable ?? true,
  deletable: d.deletable  ?? true,
})

const toRFEdge = (id, d) => ({
  id,
  source:       d.source,
  target:       d.target,
  sourceHandle: d.source_handle ?? null,
  targetHandle: d.target_handle ?? null,
  animated:     d.animated ?? true,
  style:        d.style    ?? {},
})

// ─── Plant ───────────────────────────────────────────────────
export const getOrCreatePlant = async (uid) => {
  const snap = await getDoc(plantRef(uid))
  if (snap.exists()) return { id: uid, ...snap.data() }
  const plant = { name: 'Minha Planta', background_data: null }
  await setDoc(plantRef(uid), plant)
  return { id: uid, ...plant }
}

// ─── Load ────────────────────────────────────────────────────
export const loadPlantData = async (uid) => {
  const [nodeSnap, edgeSnap] = await Promise.all([
    getDocs(nodesRef(uid)),
    getDocs(edgesRef(uid)),
  ])
  return {
    nodes: nodeSnap.docs.map(d => toRFNode(d.id, d.data())),
    edges: edgeSnap.docs.map(d => toRFEdge(d.id, d.data())),
  }
}

// ─── Nodes ───────────────────────────────────────────────────
export const upsertNode = async (uid, node) =>
  setDoc(nodeRef(uid, node.id), {
    node_type:   node.type,
    position_x:  node.position.x,
    position_y:  node.position.y,
    data:        node.data,
    z_index:     node.zIndex    ?? 0,
    draggable:   node.draggable  ?? true,
    selectable:  node.selectable ?? true,
    deletable:   node.deletable  ?? true,
  })

export const removeNode = async (uid, nodeId) =>
  deleteDoc(nodeRef(uid, nodeId))

export const updateNodePosition = async (uid, nodeId, x, y) =>
  updateDoc(nodeRef(uid, nodeId), { position_x: x, position_y: y })

export const patchNodeData = async (uid, nodeId, data) =>
  updateDoc(nodeRef(uid, nodeId), { data })

// ─── Edges ───────────────────────────────────────────────────
export const upsertEdge = async (uid, edge) =>
  setDoc(edgeRef(uid, edge.id), {
    source:        edge.source,
    target:        edge.target,
    source_handle: edge.sourceHandle ?? null,
    target_handle: edge.targetHandle ?? null,
    animated:      edge.animated ?? true,
    style:         edge.style    ?? {},
  })

export const removeEdge = async (uid, edgeId) =>
  deleteDoc(edgeRef(uid, edgeId))

export const removeEdgesByNode = async (uid, nodeId) => {
  const [srcSnap, tgtSnap] = await Promise.all([
    getDocs(query(edgesRef(uid), where('source', '==', nodeId))),
    getDocs(query(edgesRef(uid), where('target', '==', nodeId))),
  ])
  const batch = writeBatch(db)
  ;[...srcSnap.docs, ...tgtSnap.docs].forEach(d => batch.delete(d.ref))
  await batch.commit()
}

// ─── Background ──────────────────────────────────────────────
export const updateBackground = async (uid, dataUrl) =>
  setDoc(plantRef(uid), { background_data: dataUrl ?? null }, { merge: true })

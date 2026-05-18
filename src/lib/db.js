import { supabase } from './supabase'

const toRFNode = (row) => ({
  id: row.id,
  type: row.node_type,
  position: { x: row.position_x, y: row.position_y },
  data: row.data,
  zIndex: row.z_index,
  draggable: row.draggable,
  selectable: row.selectable,
  deletable: row.deletable,
})

const toRFEdge = (row) => ({
  id: row.id,
  source: row.source,
  target: row.target,
  sourceHandle: row.source_handle,
  targetHandle: row.target_handle,
  animated: row.animated,
  style: row.style,
})

export const getOrCreatePlant = async (userId) => {
  const { data: existing } = await supabase
    .from('plants')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (existing) return existing

  const { data, error } = await supabase
    .from('plants')
    .insert({ user_id: userId, name: 'Minha Planta' })
    .select()
    .single()
  if (error) throw error
  return data
}

export const loadPlantData = async (plantId) => {
  const [{ data: nodes, error: e1 }, { data: edges, error: e2 }] = await Promise.all([
    supabase.from('nodes').select('*').eq('plant_id', plantId),
    supabase.from('edges').select('*').eq('plant_id', plantId),
  ])
  if (e1) throw e1
  if (e2) throw e2
  return {
    nodes: (nodes ?? []).map(toRFNode),
    edges: (edges ?? []).map(toRFEdge),
  }
}

export const upsertNode = async (plantId, node) => {
  const { error } = await supabase.from('nodes').upsert({
    id: node.id,
    plant_id: plantId,
    node_type: node.type,
    position_x: node.position.x,
    position_y: node.position.y,
    data: node.data,
    z_index: node.zIndex ?? 0,
    draggable: node.draggable ?? true,
    selectable: node.selectable ?? true,
    deletable: node.deletable ?? true,
  })
  if (error) console.error('upsertNode:', error)
}

export const removeNode = async (plantId, nodeId) => {
  const { error } = await supabase
    .from('nodes').delete().eq('id', nodeId).eq('plant_id', plantId)
  if (error) console.error('removeNode:', error)
}

export const upsertEdge = async (plantId, edge) => {
  const { error } = await supabase.from('edges').upsert({
    id: edge.id,
    plant_id: plantId,
    source: edge.source,
    target: edge.target,
    source_handle: edge.sourceHandle ?? null,
    target_handle: edge.targetHandle ?? null,
    animated: edge.animated ?? true,
    style: edge.style ?? {},
  })
  if (error) console.error('upsertEdge:', error)
}

export const removeEdge = async (plantId, edgeId) => {
  const { error } = await supabase
    .from('edges').delete().eq('id', edgeId).eq('plant_id', plantId)
  if (error) console.error('removeEdge:', error)
}

export const removeEdgesByNode = async (plantId, nodeId) => {
  const { error } = await supabase
    .from('edges').delete().eq('plant_id', plantId)
    .or(`source.eq.${nodeId},target.eq.${nodeId}`)
  if (error) console.error('removeEdgesByNode:', error)
}

export const updateNodePosition = async (plantId, nodeId, x, y) => {
  const { error } = await supabase
    .from('nodes').update({ position_x: x, position_y: y })
    .eq('id', nodeId).eq('plant_id', plantId)
  if (error) console.error('updateNodePosition:', error)
}

export const patchNodeData = async (plantId, nodeId, data) => {
  const { error } = await supabase
    .from('nodes').update({ data }).eq('id', nodeId).eq('plant_id', plantId)
  if (error) console.error('patchNodeData:', error)
}

export const updateBackground = async (plantId, dataUrl) => {
  const { error } = await supabase
    .from('plants').update({ background_data: dataUrl ?? null })
    .eq('id', plantId)
  if (error) console.error('updateBackground:', error)
}

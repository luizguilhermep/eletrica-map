import { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import Canvas from './components/Canvas'
import Sidebar from './components/Sidebar'
import PropertiesPanel from './components/PropertiesPanel'
import AlimentadorCRUD from './components/AlimentadorCRUD'

export default function App() {
  const [showAlimentadores, setShowAlimentadores] = useState(false)

  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <Sidebar onOpenAlimentadores={() => setShowAlimentadores(true)} />
        <Canvas />
        <PropertiesPanel />
      </div>
      {showAlimentadores && (
        <AlimentadorCRUD onClose={() => setShowAlimentadores(false)} />
      )}
    </ReactFlowProvider>
  )
}

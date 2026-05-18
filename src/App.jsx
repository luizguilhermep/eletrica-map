import { ReactFlowProvider } from '@xyflow/react'
import Canvas from './components/Canvas'
import Sidebar from './components/Sidebar'
import PropertiesPanel from './components/PropertiesPanel'

export default function App() {
  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <Sidebar />
        <Canvas />
        <PropertiesPanel />
      </div>
    </ReactFlowProvider>
  )
}

import { useEffect, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import useStore from './store/useStore'
import Canvas from './components/Canvas'
import Sidebar from './components/Sidebar'
import PropertiesPanel from './components/PropertiesPanel'
import AlimentadorCRUD from './components/AlimentadorCRUD'
import AuthPage from './components/Auth'
import MapView from './components/MapView'

export default function App() {
  const { user, authLoading, initialize } = useStore()
  const [showAlimentadores, setShowAlimentadores] = useState(false)
  const [viewMode, setViewMode] = useState('canvas') // 'canvas' | 'map'

  useEffect(() => { initialize() }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-rose-500 rounded-full animate-spin" />
          Carregando...
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <Sidebar
          onOpenAlimentadores={() => setShowAlimentadores(true)}
          viewMode={viewMode}
          onViewChange={setViewMode}
        />

        {viewMode === 'canvas' ? (
          <>
            <Canvas />
            <PropertiesPanel />
          </>
        ) : (
          <MapView />
        )}
      </div>

      {showAlimentadores && (
        <AlimentadorCRUD onClose={() => setShowAlimentadores(false)} />
      )}
    </ReactFlowProvider>
  )
}

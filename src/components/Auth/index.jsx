import { useState } from 'react'
import { Zap, AlertCircle } from 'lucide-react'
import useStore from '../../store/useStore'

const ERRORS = {
  'auth/invalid-credential':     'Email ou senha incorretos.',
  'auth/user-not-found':         'Email não cadastrado.',
  'auth/wrong-password':         'Senha incorreta.',
  'auth/email-already-in-use':   'Email já cadastrado. Faça login.',
  'auth/weak-password':          'Senha muito fraca. Use ao menos 6 caracteres.',
  'auth/invalid-email':          'Email inválido.',
  'auth/too-many-requests':      'Muitas tentativas. Tente novamente mais tarde.',
}

const translate = (msg) =>
  Object.entries(ERRORS).find(([k]) => msg.includes(k))?.[1] ?? msg

export default function AuthPage() {
  const { signIn, signUp } = useStore()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const switchMode = (m) => { setMode(m); setError(''); setSuccess('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        // Firebase loga automaticamente após criar conta — sem confirmação de email
      }
    } catch (err) {
      setError(translate(err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay escuro para contraste */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-sm p-8">

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-rose-500/30 border border-rose-400/50 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-rose-300" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">Planta Elétrica</h1>
            <p className="text-xs text-white/60">Sistema de gerenciamento</p>
          </div>
        </div>

        <div className="flex rounded-lg bg-white/10 p-1 mb-6">
          {['signin', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === m
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {m === 'signin' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="seu@email.com"
              className="w-full px-3 py-2.5 text-sm bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Senha</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••••" minLength={6}
              className="w-full px-3 py-2.5 text-sm bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-white/30"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-400/40 rounded-lg text-sm text-red-200">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/20 border border-green-400/40 rounded-lg text-sm text-green-200">
              {success}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {loading ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  )
}

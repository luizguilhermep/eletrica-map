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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-rose-600" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight">Planta Elétrica</h1>
            <p className="text-xs text-slate-500">Sistema de gerenciamento</p>
          </div>
        </div>

        <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
          {['signin', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'signin' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="seu@email.com"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Senha</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••••" minLength={6}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-slate-300"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
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

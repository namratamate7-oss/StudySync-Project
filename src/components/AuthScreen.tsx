import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react'

export default function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }
      const { error } = await signUp(email, password, fullName)
      if (error) setError(error)
    } else {
      const { error } = await signIn(email, password)
      if (error) setError(error)
    }
    setLoading(false)
  }

  return (
    <div className="ss-auth-container" style={styles.container}>
      <div className="ss-auth-left" style={styles.leftPanel}>
        <div style={styles.brand}>
          <GraduationCap size={40} color="#fff" />
          <h1 style={styles.brandName}>StudySync</h1>
        </div>
        <div style={styles.heroText}>
          <h2 className="ss-auth-hero-title" style={styles.heroTitle}>Find your perfect<br />project team</h2>
          <p style={styles.heroDesc}>
            Connect with college students who share your skills and passions.
            AI-powered matching helps you find the right teammates faster.
          </p>
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.featureDot} />
              AI skill-matching recommendations
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureDot} />
              Browse and post projects instantly
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureDot} />
              Request to join teams that fit you
            </div>
          </div>
        </div>
      </div>

      <div className="ss-auth-right" style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <GraduationCap size={32} color="var(--color-primary-500)" />
            <h2 className="ss-auth-form-title" style={styles.formTitle}>
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p style={styles.formSubtitle}>
              {mode === 'signup'
                ? 'Join StudySync and find your team'
                : 'Sign in to continue to StudySync'}
            </p>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <AlertCircle size={18} color="var(--color-error-600)" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {mode === 'signup' && (
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <div style={styles.inputWrap}>
                  <User size={18} color="var(--color-neutral-400)" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    style={styles.input}
                  />
                </div>
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputWrap}>
                <Mail size={18} color="var(--color-neutral-400)" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <Lock size={18} color="var(--color-neutral-400)" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.submitBtnDisabled : {}),
              }}
            >
              {loading ? (
                <Loader2 size={20} className="spin" />
              ) : mode === 'signup' ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div style={styles.switchMode}>
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              style={styles.switchBtn}
              onClick={() => {
                setMode(mode === 'signup' ? 'login' : 'signup')
                setError(null)
              }}
            >
              {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--color-neutral-50)',
  },
  leftPanel: {
    flex: '1 1 50%',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '64px 56px',
    position: 'relative',
    overflow: 'hidden',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '64px',
  },
  brandName: {
    color: '#fff',
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '-0.5px',
  },
  heroText: {
    maxWidth: '420px',
    animation: 'slideUp 600ms ease-out',
  },
  heroTitle: {
    color: '#fff',
    fontSize: '42px',
    fontWeight: 700,
    lineHeight: 1.15,
    marginBottom: '20px',
    letterSpacing: '-1px',
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '17px',
    lineHeight: 1.6,
    marginBottom: '40px',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '15px',
    fontWeight: 500,
  },
  featureDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    flexShrink: 0,
  },
  rightPanel: {
    flex: '1 1 50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  formCard: {
    width: '100%',
    maxWidth: '400px',
    animation: 'slideUp 500ms ease-out',
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  formTitle: {
    fontSize: '26px',
    fontWeight: 700,
    color: 'var(--color-neutral-900)',
    marginTop: '12px',
    marginBottom: '8px',
  },
  formSubtitle: {
    color: 'var(--color-neutral-500)',
    fontSize: '15px',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    marginBottom: '20px',
    color: 'var(--color-error-600)',
    fontSize: '14px',
    animation: 'scaleIn 200ms ease-out',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--color-neutral-700)',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#fff',
    border: '1.5px solid var(--color-neutral-200)',
    borderRadius: 'var(--radius-md)',
    padding: '0 14px',
    transition: 'border-color var(--transition)',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '12px 0',
    fontSize: '15px',
    background: 'transparent',
    color: 'var(--color-neutral-800)',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'var(--color-primary-600)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    padding: '13px 24px',
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition)',
    marginTop: '4px',
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  switchMode: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: 'var(--color-neutral-500)',
  },
  switchBtn: {
    color: 'var(--color-primary-600)',
    fontWeight: 600,
    fontSize: '14px',
  },
}

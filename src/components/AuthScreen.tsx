import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { validateEmail, validatePassword } from '../lib/utils'
import {
  GraduationCap, Mail, Lock, User, Loader2, AlertCircle,
  Eye, EyeOff, CheckCircle2,
} from 'lucide-react'
import TermsModal from './TermsModal'

export default function AuthScreen() {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (mode === 'forgot') {
      if (!validateEmail(email)) {
        setError('Please enter a valid email address')
        return
      }
      setLoading(true)
      const { error } = await resetPassword(email)
      setLoading(false)
      if (error) {
        setError(error)
      } else {
        setSuccess('Password reset link sent! Check your email.')
      }
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (mode === 'signup') {
      if (fullName.trim().length < 2) {
        setError('Full name must contain at least 2 characters')
        return
      }
      const pwError = validatePassword(password)
      if (pwError) {
        setError(pwError)
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (!agreedToTerms) {
        setError('You must agree to the Terms & Conditions to continue')
        return
      }
    } else {
      if (!password) {
        setError('Please enter your password')
        return
      }
    }

    setLoading(true)

    if (mode === 'signup') {
      const { error } = await signUp(email, password, fullName)
      if (error) {
        setError(error)
      } else {
        setSuccess('Account created! You can now sign in.')
        setMode('login')
        setPassword('')
        setConfirmPassword('')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) setError(error)
    }

    setLoading(false)
  }

  const handleGoogle = async () => {
    setError(null)
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error)
      setLoading(false)
    }
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
            Skill-based matching helps you find the right teammates faster.
          </p>
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.featureDot} />
              Skill-based matching recommendations
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
            <GraduationCap size={32} color="var(--color-primary-600)" />
            <h2 className="ss-auth-form-title" style={styles.formTitle}>
              {mode === 'signup' ? 'Create your account' : mode === 'forgot' ? 'Reset password' : 'Welcome back'}
            </h2>
            <p style={styles.formSubtitle}>
              {mode === 'signup'
                ? 'Join StudySync and find your team'
                : mode === 'forgot'
                ? 'Enter your email to receive a reset link'
                : 'Sign in to continue to StudySync'}
            </p>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <AlertCircle size={18} color="var(--color-error-600)" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={styles.successBanner}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{success}</span>
            </div>
          )}

          {mode !== 'forgot' && (
            <>
              <button
                onClick={handleGoogle}
                disabled={loading}
                style={{
                  ...styles.googleBtn,
                  ...(loading ? styles.googleBtnDisabled : {}),
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div style={styles.divider}>
                <span style={styles.dividerLine} />
                <span style={styles.dividerText}>or</span>
                <span style={styles.dividerLine} />
              </div>
            </>
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
                    style={styles.input}
                  />
                </div>
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>College Email</label>
              <div style={styles.inputWrap}>
                <Mail size={18} color="var(--color-neutral-400)" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  style={styles.input}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div style={styles.field}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrap}>
                  <Lock size={18} color="var(--color-neutral-400)" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? <EyeOff size={18} color="var(--color-neutral-400)" /> : <Eye size={18} color="var(--color-neutral-400)" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.inputWrap}>
                  <Lock size={18} color="var(--color-neutral-400)" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={styles.eyeBtn}
                  >
                    {showConfirm ? <EyeOff size={18} color="var(--color-neutral-400)" /> : <Eye size={18} color="var(--color-neutral-400)" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <label style={styles.termsRow}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={styles.termsText}>
                  I agree to the{' '}
                  <button type="button" onClick={() => setShowTerms(true)} style={styles.termsLink}>
                    Terms & Conditions
                  </button>{' '}
                  and Community Guidelines
                </span>
              </label>
            )}

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
              ) : mode === 'forgot' ? (
                'Send Reset Link'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {mode === 'login' && (
            <div style={styles.forgotLinkWrap}>
              <button
                onClick={() => { setMode('forgot'); setError(null); setSuccess(null) }}
                style={styles.forgotLink}
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div style={styles.switchMode}>
            {mode === 'signup' ? 'Already have an account?' : mode === 'forgot' ? "Remember your password?" : "Don't have an account?"}{' '}
            <button
              style={styles.switchBtn}
              onClick={() => {
                setMode(mode === 'signup' ? 'login' : 'signup')
                setError(null)
                setSuccess(null)
              }}
            >
              {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </button>
          </div>

          {mode === 'forgot' && (
            <div style={styles.switchMode}>
              <button
                style={styles.switchBtn}
                onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

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
    background: 'linear-gradient(145deg, #0b1f3a 0%, #123e70 55%, #1e63b7 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '72px 64px',
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
    fontSize: 'clamp(38px, 4vw, 56px)',
    fontWeight: 700,
    lineHeight: 1.08,
    marginBottom: '24px',
    letterSpacing: '-2px',
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
    maxWidth: '420px',
    animation: 'slideUp 500ms ease-out',
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  formTitle: {
    fontSize: '28px',
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
    marginBottom: '16px',
    color: 'var(--color-error-600)',
    fontSize: '14px',
    animation: 'scaleIn 200ms ease-out',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    marginBottom: '16px',
    color: '#047857',
    fontSize: '14px',
    animation: 'scaleIn 200ms ease-out',
  },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    background: '#fff',
    border: '1.5px solid var(--color-neutral-200)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--color-neutral-700)',
    transition: 'all var(--transition)',
    boxShadow: 'var(--shadow-sm)',
  },
  googleBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    margin: '20px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'var(--color-neutral-200)',
  },
  dividerText: {
    fontSize: '13px',
    color: 'var(--color-neutral-400)',
    fontWeight: 500,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
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
    background: 'rgba(255,255,255,0.72)',
    border: '1px solid var(--color-neutral-200)',
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
  eyeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    flexShrink: 0,
  },
  termsRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    cursor: 'pointer',
  },
  checkbox: {
    marginTop: '2px',
    width: '18px',
    height: '18px',
    accentColor: 'var(--color-primary-600)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  termsText: {
    fontSize: '13px',
    color: 'var(--color-neutral-600)',
    lineHeight: 1.5,
  },
  termsLink: {
    color: 'var(--color-primary-600)',
    fontWeight: 600,
    fontSize: '13px',
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
    padding: '14px 24px',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 8px 20px rgba(37,99,235,0.22)',
    transition: 'all var(--transition)',
    marginTop: '4px',
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  forgotLinkWrap: {
    textAlign: 'right',
    marginTop: '12px',
  },
  forgotLink: {
    fontSize: '13px',
    color: 'var(--color-primary-600)',
    fontWeight: 500,
  },
  switchMode: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: 'var(--color-neutral-500)',
  },
  switchBtn: {
    color: 'var(--color-primary-600)',
    fontWeight: 600,
    fontSize: '14px',
  },
}

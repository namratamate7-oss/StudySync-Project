import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={styles.container}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              ...styles.toast,
              ...styles[toast.type],
            }}
            className="ss-toast"
          >
            {toast.type === 'success' && <CheckCircle2 size={20} color="#059669" />}
            {toast.type === 'error' && <AlertCircle size={20} color="#dc2626" />}
            {toast.type === 'info' && <Info size={20} color="#2563eb" />}
            <span style={styles.message}>{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} style={styles.closeBtn}>
              <X size={15} />
            </button>
          </div>
        ))}
        <style>{`
          .ss-toast {
            animation: slideInRight 250ms ease-out;
          }
        `}</style>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    pointerEvents: 'none',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 18px',
    borderRadius: 'var(--radius-md)',
    background: '#fff',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--color-neutral-200)',
    maxWidth: '380px',
    pointerEvents: 'auto',
  },
  success: {
    borderLeft: '4px solid #10b981',
  },
  error: {
    borderLeft: '4px solid #ef4444',
  },
  info: {
    borderLeft: '4px solid #3b82f6',
  },
  message: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--color-neutral-800)',
    lineHeight: 1.4,
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-neutral-400)',
    padding: '2px',
    flexShrink: 0,
  },
}

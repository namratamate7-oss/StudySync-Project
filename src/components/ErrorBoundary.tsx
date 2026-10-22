import { Component, ReactNode } from 'react'

interface State {
  hasError: boolean
  message: string
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error) {
    console.error('StudySync crashed:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '40px 20px',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif',
          background: '#f9fafb',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            fontSize: '28px',
          }}>
            !
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280', maxWidth: '380px', lineHeight: 1.5 }}>
            The app encountered an error. Try refreshing the page, or check back in a moment.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px',
              padding: '10px 24px',
              borderRadius: '10px',
              background: '#2563eb',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

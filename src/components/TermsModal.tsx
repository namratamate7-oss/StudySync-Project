import { useState } from 'react'
import { X, ScrollText, Shield } from 'lucide-react'

interface TermsModalProps {
  onClose: () => void
}

export default function TermsModal({ onClose }: TermsModalProps) {
  const [tab, setTab] = useState<'terms' | 'privacy'>('terms')

  return (
    <div style={styles.overlay} className="ss-modal-overlay" onClick={onClose}>
      <div className="ss-modal" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Platform Policies</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.tabs}>
          <button
            onClick={() => setTab('terms')}
            style={{
              ...styles.tab,
              ...(tab === 'terms' ? styles.tabActive : {}),
            }}
          >
            <ScrollText size={15} />
            Terms & Community Guidelines
          </button>
          <button
            onClick={() => setTab('privacy')}
            style={{
              ...styles.tab,
              ...(tab === 'privacy' ? styles.tabActive : {}),
            }}
          >
            <Shield size={15} />
            Privacy Policy
          </button>
        </div>

        <div style={styles.body}>
          {tab === 'terms' ? (
            <div style={styles.content}>
              <h3 style={styles.sectionTitle}>Community Guidelines</h3>
              <ol style={styles.list}>
                <li>Users must provide genuine student information.</li>
                <li>Users must not create fake profiles.</li>
                <li>Users must not send spam requests to projects.</li>
                <li>Users must respect other students and their contributions.</li>
                <li>Users must not misuse another person's personal information.</li>
                <li>Users must not create misleading or fraudulent projects.</li>
                <li>Project owners should respond to join requests responsibly and in a timely manner.</li>
                <li>Users must not impersonate other students.</li>
                <li>Repeated misuse may result in account restrictions or removal.</li>
                <li>Users must agree to these platform rules during registration and while using the platform.</li>
              </ol>
            </div>
          ) : (
            <div style={styles.content}>
              <h3 style={styles.sectionTitle}>Privacy Policy</h3>
              <p style={styles.paragraph}>
                StudySync collects the following profile information: full name, college/university,
                academic branch, year of study, short bio, technical skills, areas of interest,
                GitHub profile link, and LinkedIn profile link.
              </p>
              <p style={styles.paragraph}>
                This information is used to help you discover and connect with other students
                for project collaboration. Your profile information is visible to other
                authenticated users of the platform so they can find suitable teammates.
              </p>
              <p style={styles.paragraph}>
                Project information you create (title, description, category, required skills,
                team size) is visible to all authenticated users. Join request messages are
                visible to you and the project owner.
              </p>
              <p style={styles.paragraph}>
                We do not sell or share your data with third parties. You can update or remove
                your profile information at any time. Account deletion requests can be submitted
                and will remove your data from the platform.
              </p>
              <p style={styles.paragraph}>
                Authentication is handled through Supabase Auth. Your password is never stored
                in plain text — it is securely hashed by the authentication provider.
              </p>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.doneBtn}>
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(17,24,39,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '20px',
    animation: 'fadeIn 200ms ease-out',
  },
  modal: {
    background: '#fff',
    borderRadius: 'var(--radius-xl)',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    animation: 'scaleIn 250ms ease-out',
    boxShadow: 'var(--shadow-xl)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 28px 16px',
    borderBottom: '1px solid var(--color-neutral-100)',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--color-neutral-900)',
  },
  closeBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-neutral-500)',
    background: 'var(--color-neutral-100)',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    padding: '16px 28px 0',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--color-neutral-500)',
    borderBottom: '2px solid transparent',
    transition: 'all var(--transition)',
  },
  tabActive: {
    color: 'var(--color-primary-600)',
    borderBottomColor: 'var(--color-primary-600)',
    background: 'var(--color-primary-50)',
  },
  body: {
    padding: '20px 28px',
    flex: 1,
    overflow: 'auto',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  sectionTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: 'var(--color-neutral-900)',
  },
  list: {
    listStyleType: 'decimal',
    paddingLeft: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '14px',
    lineHeight: 1.6,
    color: 'var(--color-neutral-700)',
  },
  paragraph: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: 'var(--color-neutral-700)',
  },
  footer: {
    padding: '16px 28px 24px',
    borderTop: '1px solid var(--color-neutral-100)',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  doneBtn: {
    padding: '10px 28px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    background: 'var(--color-primary-600)',
  },
}

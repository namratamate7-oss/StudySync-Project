import { Project } from '../lib/types'
import { useAuth } from '../context/AuthContext'
import { X, Send, Loader2 } from 'lucide-react'
import Avatar from './Avatar'
import SkillBadge from './SkillBadge'
import { CATEGORY_COLORS } from '../lib/types'
import { useState } from 'react'
import { useToast } from './Toast'

interface JoinRequestModalProps {
  project: Project
  ownerName?: string
  onClose: () => void
  onSubmit: (introduction: string, whyJoin: string) => Promise<{ error: string | null }>
}

export default function JoinRequestModal({ project, ownerName, onClose, onSubmit }: JoinRequestModalProps) {
  const { profile } = useAuth()
  const { showToast } = useToast()
  const [introduction, setIntroduction] = useState('')
  const [whyJoin, setWhyJoin] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const categoryColor = CATEGORY_COLORS[project.category] || '#3b82f6'

  const relevantSkills = profile?.skills?.filter((s) =>
    project.skills_needed.some((ps) => ps.toLowerCase() === s.toLowerCase())
  ) || []

  const handleSubmit = async () => {
    if (introduction.trim().length < 20) {
      setError('Introduction message must contain at least 20 characters')
      return
    }
    setError(null)
    setLoading(true)
    const { error } = await onSubmit(introduction.trim(), whyJoin.trim())
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      setDone(true)
      showToast('Join request sent successfully!')
      setTimeout(() => onClose(), 1800)
    }
  }

  return (
    <div style={styles.overlay} className="ss-modal-overlay" onClick={onClose}>
      <div className="ss-modal" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...styles.modalAccent, background: categoryColor }} />
        <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>

        {done ? (
          <div style={styles.successState}>
            <div style={styles.successIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={styles.successTitle}>Request Sent!</h3>
            <p style={styles.successText}>
              Your request to join "{project.title}" has been submitted.
              The project owner will review it shortly.
            </p>
          </div>
        ) : (
          <>
            <div style={styles.modalHeader}>
              <span style={{ ...styles.modalCategory, color: categoryColor }}>{project.category}</span>
              <h2 style={styles.modalTitle}>{project.title}</h2>
              <p style={styles.modalDesc}>{project.description}</p>

              <div style={styles.modalSkills}>
                {project.skills_needed.map((skill) => {
                  const matched = profile?.skills?.some((s) => s.toLowerCase() === skill.toLowerCase())
                  return <SkillBadge key={skill} skill={skill} matched={matched} />
                })}
              </div>

              {ownerName && (
                <div style={styles.modalOwner}>
                  <Avatar name={ownerName} size={24} />
                  <span style={styles.modalOwnerName}>Posted by {ownerName}</span>
                </div>
              )}
            </div>

            {error && (
              <div style={styles.errorBanner}>
                <X size={16} color="var(--color-error-600)" />
                {error}
              </div>
            )}

            <div style={styles.modalBody}>
              {relevantSkills.length > 0 && (
                <div style={styles.relevantSkillsBox}>
                  <span style={styles.relevantSkillsLabel}>Your relevant skills for this project:</span>
                  <div style={styles.relevantSkillsList}>
                    {relevantSkills.map((s) => (
                      <span key={s} style={styles.relevantSkill}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.field}>
                <label style={styles.label}>
                  Introduction Message *
                  <span style={styles.optional}> — minimum 20 characters</span>
                </label>
                <textarea
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  placeholder="Introduce yourself to the project owner. Mention your background, experience, and what you bring to the team..."
                  style={styles.textarea}
                  rows={4}
                  maxLength={500}
                />
                <div style={styles.charCount}>{introduction.length}/500</div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Why do you want to join this project?
                  <span style={styles.optional}> (optional)</span>
                </label>
                <textarea
                  value={whyJoin}
                  onChange={(e) => setWhyJoin(e.target.value)}
                  placeholder="Explain what interests you about this project and what you hope to achieve..."
                  style={styles.textarea}
                  rows={3}
                  maxLength={400}
                />
                <div style={styles.charCount}>{whyJoin.length}/400</div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {}) }}
              >
                {loading ? <Loader2 size={18} className="spin" /> : (<><Send size={16} />Send Request</>)}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)',
    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 200, padding: '20px', animation: 'fadeIn 200ms ease-out',
  },
  modal: {
    background: '#fff', borderRadius: 'var(--radius-xl)', width: '100%',
    maxWidth: '540px', maxHeight: '90vh', overflow: 'hidden',
    display: 'flex', flexDirection: 'column', position: 'relative',
    animation: 'scaleIn 250ms ease-out', boxShadow: 'var(--shadow-xl)',
  },
  modalAccent: { height: '5px', width: '100%' },
  closeBtn: {
    position: 'absolute', top: '16px', right: '16px', width: '34px', height: '34px',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-neutral-500)', background: 'var(--color-neutral-100)', zIndex: 1,
  },
  modalHeader: { padding: '24px 28px 16px', borderBottom: '1px solid var(--color-neutral-100)' },
  modalCategory: { fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  modalTitle: { fontSize: '22px', fontWeight: 700, color: 'var(--color-neutral-900)', marginTop: '8px', marginBottom: '10px', lineHeight: 1.25 },
  modalDesc: { fontSize: '14px', color: 'var(--color-neutral-600)', lineHeight: 1.5 },
  modalSkills: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' },
  modalOwner: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px' },
  modalOwnerName: { fontSize: '13px', color: 'var(--color-neutral-500)', fontWeight: 500 },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: '8px', margin: '0 28px',
    padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 'var(--radius-md)', color: 'var(--color-error-600)', fontSize: '13px',
  },
  modalBody: { padding: '20px 28px', flex: 1, overflow: 'auto' },
  relevantSkillsBox: {
    background: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)',
    padding: '14px 16px', marginBottom: '18px',
  },
  relevantSkillsLabel: { fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-700)' },
  relevantSkillsList: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
  relevantSkill: {
    fontSize: '12px', fontWeight: 500, padding: '4px 10px', borderRadius: '20px',
    background: '#dbeafe', color: '#1d4ed8',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  label: { fontSize: '14px', fontWeight: 600, color: 'var(--color-neutral-700)', display: 'block' },
  optional: { fontWeight: 400, color: 'var(--color-neutral-400)' },
  textarea: {
    width: '100%', border: '1.5px solid var(--color-neutral-200)', borderRadius: 'var(--radius-md)',
    padding: '12px 14px', fontSize: '14px', color: 'var(--color-neutral-800)',
    outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5,
  },
  charCount: { textAlign: 'right', fontSize: '12px', color: 'var(--color-neutral-400)', marginTop: '4px' },
  modalFooter: {
    display: 'flex', gap: '10px', justifyContent: 'flex-end',
    padding: '16px 28px 24px', borderTop: '1px solid var(--color-neutral-100)',
  },
  cancelBtn: {
    padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: '14px',
    fontWeight: 600, color: 'var(--color-neutral-600)', background: 'var(--color-neutral-100)',
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px',
    borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600,
    color: '#fff', background: 'var(--color-primary-600)',
  },
  submitBtnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  successState: { padding: '48px 28px', textAlign: 'center', animation: 'scaleIn 300ms ease-out' },
  successIcon: {
    width: '64px', height: '64px', borderRadius: '50%', background: '#d1fae5',
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
  },
  successTitle: { fontSize: '22px', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '10px' },
  successText: { fontSize: '15px', color: 'var(--color-neutral-600)', lineHeight: 1.5, maxWidth: '360px', margin: '0 auto' },
}

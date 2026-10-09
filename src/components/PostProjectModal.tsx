import { useState } from 'react'
import { Project, CATEGORY_OPTIONS, SKILL_OPTIONS } from '../lib/types'
import { X, Plus, Check, Loader2 } from 'lucide-react'

interface PostProjectModalProps {
  onClose: () => void
  onSubmit: (data: Omit<Project, 'id' | 'user_id' | 'created_at' | 'status' | 'profiles'>) => Promise<void>
}

export default function PostProjectModal({ onClose, onSubmit }: PostProjectModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
  const [teamSize, setTeamSize] = useState(3)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredSkills = SKILL_OPTIONS.filter(
    (s) =>
      !selectedSkills.includes(s) &&
      s.toLowerCase().includes(skillInput.toLowerCase())
  )

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill))
    } else {
      setSelectedSkills([...selectedSkills, skill])
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a project title')
      return
    }
    if (!description.trim()) {
      setError('Please enter a project description')
      return
    }
    if (selectedSkills.length === 0) {
      setError('Please select at least one skill needed')
      return
    }

    setError(null)
    setLoading(true)
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      skills_needed: selectedSkills,
      team_size: teamSize,
    })
    setLoading(false)
  }

  return (
    <div style={styles.overlay} className="ss-modal-overlay" onClick={onClose}>
      <div className="ss-modal" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>Post a New Project</h2>
            <p style={styles.modalSubtitle}>
              Find teammates with the right skills for your project
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={styles.errorBanner}>{error}</div>
        )}

        <div style={styles.modalBody}>
          <div style={styles.field}>
            <label style={styles.label}>Project Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AI-Powered Study Planner"
              style={styles.input}
              maxLength={80}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project, what you're building, and what you hope to achieve..."
              style={styles.textarea}
              rows={4}
              maxLength={600}
            />
            <div style={styles.charCount}>{description.length}/600</div>
          </div>

          <div className="ss-field-row" style={styles.fieldRow}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.select}
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Team Size</label>
              <input
                type="number"
                value={teamSize}
                onChange={(e) => setTeamSize(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                min="1"
                max="10"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Skills Needed *</label>
            {selectedSkills.length > 0 && (
              <div style={styles.selectedSkills}>
                {selectedSkills.map((skill) => (
                  <span key={skill} style={styles.selectedSkill}>
                    {skill}
                    <button onClick={() => toggleSkill(skill)} style={styles.removeSkillBtn}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div style={styles.skillInputWrap}>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Search skills to add..."
                style={styles.skillInput}
              />
              <Plus size={18} color="var(--color-neutral-400)" />
            </div>
            {skillInput && filteredSkills.length > 0 && (
              <div style={styles.skillDropdown}>
                {filteredSkills.slice(0, 8).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => {
                      toggleSkill(skill)
                      setSkillInput('')
                    }}
                    style={styles.skillOption}
                  >
                    <Plus size={14} color="var(--color-primary-500)" />
                    {skill}
                  </button>
                ))}
              </div>
            )}
            <div style={styles.skillSuggestions}>
              {SKILL_OPTIONS.slice(0, 10).map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  style={{
                    ...styles.suggestionChip,
                    ...(selectedSkills.includes(skill) ? styles.suggestionChipActive : {}),
                  }}
                >
                  {selectedSkills.includes(skill) && <Check size={12} />}
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button onClick={onClose} style={styles.cancelBtn}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...styles.submitBtn,
              ...(loading ? styles.submitBtnDisabled : {}),
            }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : 'Post Project'}
          </button>
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
    maxWidth: '580px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    animation: 'scaleIn 250ms ease-out',
    boxShadow: 'var(--shadow-xl)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px 28px 16px',
    borderBottom: '1px solid var(--color-neutral-100)',
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--color-neutral-900)',
  },
  modalSubtitle: {
    fontSize: '14px',
    color: 'var(--color-neutral-500)',
    marginTop: '4px',
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
    transition: 'all var(--transition)',
  },
  errorBanner: {
    margin: '0 28px',
    padding: '10px 14px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-error-600)',
    fontSize: '13px',
    marginBottom: '8px',
  },
  modalBody: {
    padding: '20px 28px',
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldRow: {
    display: 'flex',
    gap: '16px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--color-neutral-700)',
  },
  input: {
    width: '100%',
    border: '1.5px solid var(--color-neutral-200)',
    borderRadius: 'var(--radius-md)',
    padding: '11px 14px',
    fontSize: '14px',
    color: 'var(--color-neutral-800)',
    outline: 'none',
    transition: 'border-color var(--transition)',
    background: '#fff',
  },
  textarea: {
    width: '100%',
    border: '1.5px solid var(--color-neutral-200)',
    borderRadius: 'var(--radius-md)',
    padding: '11px 14px',
    fontSize: '14px',
    color: 'var(--color-neutral-800)',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: 1.5,
  },
  select: {
    width: '100%',
    border: '1.5px solid var(--color-neutral-200)',
    borderRadius: 'var(--radius-md)',
    padding: '11px 14px',
    fontSize: '14px',
    color: 'var(--color-neutral-800)',
    outline: 'none',
    background: '#fff',
    cursor: 'pointer',
  },
  charCount: {
    textAlign: 'right',
    fontSize: '12px',
    color: 'var(--color-neutral-400)',
  },
  selectedSkills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '8px',
  },
  selectedSkill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 10px',
    background: '#dbeafe',
    color: '#1d4ed8',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 500,
  },
  removeSkillBtn: {
    display: 'flex',
    alignItems: 'center',
    color: '#1d4ed8',
    padding: 0,
  },
  skillInputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1.5px solid var(--color-neutral-200)',
    borderRadius: 'var(--radius-md)',
    padding: '0 14px',
    background: '#fff',
    position: 'relative',
  },
  skillInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '10px 0',
    fontSize: '14px',
    background: 'transparent',
  },
  skillDropdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 'calc(100% + 4px)',
    background: '#fff',
    border: '1px solid var(--color-neutral-200)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 10,
    maxHeight: '200px',
    overflow: 'auto',
  },
  skillOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    color: 'var(--color-neutral-700)',
    transition: 'background var(--transition)',
    textAlign: 'left',
  },
  skillSuggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px',
  },
  suggestionChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--color-neutral-600)',
    background: 'var(--color-neutral-100)',
    border: '1px solid var(--color-neutral-200)',
    transition: 'all var(--transition)',
  },
  suggestionChipActive: {
    color: '#1d4ed8',
    background: '#dbeafe',
    borderColor: '#bfdbfe',
  },
  modalFooter: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    padding: '16px 28px 24px',
    borderTop: '1px solid var(--color-neutral-100)',
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--color-neutral-600)',
    background: 'var(--color-neutral-100)',
    transition: 'all var(--transition)',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 24px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    background: 'var(--color-primary-600)',
    transition: 'all var(--transition)',
    minWidth: '140px',
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
}

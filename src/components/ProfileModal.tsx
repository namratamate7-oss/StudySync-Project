import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  SKILL_OPTIONS, AVATAR_COLORS, INTEREST_OPTIONS, YEAR_OPTIONS,
} from '../lib/types'
import {
  X, Check, Plus, Loader2, GraduationCap, BookOpen,
  Github, Linkedin, Calendar, Lightbulb,
} from 'lucide-react'
import { useToast } from './Toast'

interface ProfileModalProps {
  onClose: () => void
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { profile, refreshProfile } = useAuth()
  const { showToast } = useToast()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [university, setUniversity] = useState(profile?.university || '')
  const [major, setMajor] = useState(profile?.major || '')
  const [year, setYear] = useState(profile?.year || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [skills, setSkills] = useState<string[]>(profile?.skills || [])
  const [interests, setInterests] = useState<string[]>(profile?.interests || [])
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color || AVATAR_COLORS[0])
  const [githubUrl, setGithubUrl] = useState(profile?.github_url || '')
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || '')
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)

  const filteredSkills = SKILL_OPTIONS.filter(
    (s) => !skills.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase())
  )

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill))
    } else {
      setSkills([...skills, skill])
    }
  }

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest))
    } else {
      setInterests([...interests, interest])
    }
  }

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        university,
        major,
        year,
        bio,
        skills,
        interests,
        avatar_color: avatarColor,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
      })
      .eq('id', profile?.id)

    if (!error) {
      await refreshProfile()
      showToast('Profile updated successfully!')
      onClose()
    } else {
      showToast('Failed to update profile', 'error')
    }
    setLoading(false)
  }

  return (
    <div style={styles.overlay} className="ss-modal-overlay" onClick={onClose}>
      <div className="ss-modal" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>Edit Profile</h2>
            <p style={styles.modalSubtitle}>
              Your skills power the project matching recommendations
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.avatarSection}>
            <div style={{ ...styles.avatarPreview, background: avatarColor }}>
              {fullName ? fullName.charAt(0).toUpperCase() : '?'}
            </div>
            <div style={styles.colorPicker}>
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setAvatarColor(color)}
                  style={{
                    ...styles.colorSwatch,
                    background: color,
                    ...(avatarColor === color ? styles.colorSwatchActive : {}),
                  }}
                >
                  {avatarColor === color && <Check size={14} color="#fff" />}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrap}>
              <GraduationCap size={18} color="var(--color-neutral-400)" />
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" style={styles.input} />
            </div>
          </div>

          <div className="ss-field-row" style={styles.fieldRow}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>University / College</label>
              <div style={styles.inputWrap}>
                <BookOpen size={18} color="var(--color-neutral-400)" />
                <input type="text" value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="e.g., MIT" style={styles.input} />
              </div>
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Academic Branch</label>
              <input type="text" value={major} onChange={(e) => setMajor(e.target.value)} placeholder="e.g., Computer Science" style={styles.textInput} />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Year of Study</label>
            <div style={styles.yearOptions}>
              {YEAR_OPTIONS.map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  style={{
                    ...styles.yearChip,
                    ...(year === y ? styles.yearChipActive : {}),
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Short Introduction</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell other students about yourself..." style={styles.textarea} rows={3} maxLength={300} />
            <div style={styles.charCount}>{bio.length}/300</div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Technical Skills
              <span style={styles.skillCount}>{skills.length} selected</span>
            </label>
            {skills.length > 0 && (
              <div style={styles.selectedSkills}>
                {skills.map((skill) => (
                  <span key={skill} style={styles.selectedSkill}>
                    {skill}
                    <button onClick={() => toggleSkill(skill)} style={styles.removeBtn}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div style={styles.skillInputWrap}>
              <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Search skills..." style={styles.skillInput} />
              <Plus size={18} color="var(--color-neutral-400)" />
            </div>
            {skillInput && filteredSkills.length > 0 && (
              <div style={styles.skillDropdown}>
                {filteredSkills.slice(0, 8).map((skill) => (
                  <button key={skill} onClick={() => { toggleSkill(skill); setSkillInput('') }} style={styles.skillOption}>
                    <Plus size={14} color="var(--color-primary-500)" />
                    {skill}
                  </button>
                ))}
              </div>
            )}
            <div style={styles.suggestions}>
              {SKILL_OPTIONS.slice(0, 15).map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  style={{ ...styles.suggestion, ...(skills.includes(skill) ? styles.suggestionActive : {}) }}
                >
                  {skills.includes(skill) && <Check size={11} />}
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Areas of Interest
              <span style={styles.skillCount}>{interests.length} selected</span>
            </label>
            <div style={styles.suggestions}>
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  style={{ ...styles.suggestion, ...(interests.includes(interest) ? styles.interestActive : {}) }}
                >
                  {interests.includes(interest) && <Check size={11} />}
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="ss-field-row" style={styles.fieldRow}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>GitHub Profile</label>
              <div style={styles.inputWrap}>
                <Github size={18} color="var(--color-neutral-400)" />
                <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="github.com/username" style={styles.input} />
              </div>
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>LinkedIn Profile</label>
              <div style={styles.inputWrap}>
                <Linkedin size={18} color="var(--color-neutral-400)" />
                <input type="text" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/in/username" style={styles.input} />
              </div>
            </div>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{ ...styles.saveBtn, ...(loading ? styles.saveBtnDisabled : {}) }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : 'Save Profile'}
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
    position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)',
    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 200, padding: '20px',
    animation: 'fadeIn 200ms ease-out',
  },
  modal: {
    background: '#fff', borderRadius: 'var(--radius-xl)', width: '100%',
    maxWidth: '580px', maxHeight: '90vh', overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    animation: 'scaleIn 250ms ease-out', boxShadow: 'var(--shadow-xl)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '24px 28px 16px', borderBottom: '1px solid var(--color-neutral-100)',
  },
  modalTitle: { fontSize: '22px', fontWeight: 700, color: 'var(--color-neutral-900)' },
  modalSubtitle: { fontSize: '14px', color: 'var(--color-neutral-500)', marginTop: '4px' },
  closeBtn: {
    width: '34px', height: '34px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: 'var(--color-neutral-500)',
    background: 'var(--color-neutral-100)',
  },
  modalBody: {
    padding: '20px 28px', flex: 1, overflow: 'auto',
    display: 'flex', flexDirection: 'column', gap: '18px',
  },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '20px' },
  avatarPreview: {
    width: '56px', height: '56px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#fff',
    fontSize: '24px', fontWeight: 600, flexShrink: 0,
  },
  colorPicker: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  colorSwatch: {
    width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    border: '2px solid #fff', boxShadow: '0 0 0 1px var(--color-neutral-200)',
  },
  colorSwatchActive: { boxShadow: '0 0 0 2px var(--color-neutral-800)' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldRow: { display: 'flex', gap: '16px' },
  label: {
    fontSize: '14px', fontWeight: 600, color: 'var(--color-neutral-700)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  skillCount: { fontSize: '12px', fontWeight: 500, color: 'var(--color-neutral-400)' },
  inputWrap: {
    display: 'flex', alignItems: 'center', gap: '8px',
    border: '1.5px solid var(--color-neutral-200)', borderRadius: 'var(--radius-md)',
    padding: '0 14px', background: '#fff',
  },
  input: { flex: 1, border: 'none', outline: 'none', padding: '11px 0', fontSize: '14px', background: 'transparent', color: 'var(--color-neutral-800)' },
  textInput: {
    width: '100%', border: '1.5px solid var(--color-neutral-200)', borderRadius: 'var(--radius-md)',
    padding: '11px 14px', fontSize: '14px', color: 'var(--color-neutral-800)',
    outline: 'none', background: '#fff',
  },
  textarea: {
    width: '100%', border: '1.5px solid var(--color-neutral-200)', borderRadius: 'var(--radius-md)',
    padding: '11px 14px', fontSize: '14px', color: 'var(--color-neutral-800)',
    outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5,
  },
  charCount: { textAlign: 'right', fontSize: '12px', color: 'var(--color-neutral-400)' },
  yearOptions: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  yearChip: {
    padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
    color: 'var(--color-neutral-600)', background: 'var(--color-neutral-100)',
    border: '1px solid var(--color-neutral-200)',
  },
  yearChipActive: {
    color: '#1d4ed8', background: '#dbeafe', borderColor: '#bfdbfe', fontWeight: 600,
  },
  selectedSkills: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' },
  selectedSkill: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px',
    background: '#dbeafe', color: '#1d4ed8', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
  },
  removeBtn: { display: 'flex', alignItems: 'center', color: '#1d4ed8', padding: 0 },
  skillInputWrap: {
    display: 'flex', alignItems: 'center', gap: '8px',
    border: '1.5px solid var(--color-neutral-200)', borderRadius: 'var(--radius-md)',
    padding: '0 14px', background: '#fff', position: 'relative',
  },
  skillInput: { flex: 1, border: 'none', outline: 'none', padding: '10px 0', fontSize: '14px', background: 'transparent' },
  skillDropdown: {
    position: 'absolute', left: 0, right: 0, top: 'calc(100% + 4px)', background: '#fff',
    border: '1px solid var(--color-neutral-200)', borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)', zIndex: 10, maxHeight: '200px', overflow: 'auto',
  },
  skillOption: {
    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
    padding: '10px 14px', fontSize: '14px', color: 'var(--color-neutral-700)', textAlign: 'left',
  },
  suggestions: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' },
  suggestion: {
    display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px',
    borderRadius: '20px', fontSize: '12px', fontWeight: 500, color: 'var(--color-neutral-600)',
    background: 'var(--color-neutral-100)', border: '1px solid var(--color-neutral-200)',
  },
  suggestionActive: { color: '#1d4ed8', background: '#dbeafe', borderColor: '#bfdbfe' },
  interestActive: { color: '#047857', background: '#d1fae5', borderColor: '#a7f3d0' },
  modalFooter: {
    display: 'flex', gap: '10px', justifyContent: 'flex-end',
    padding: '16px 28px 24px', borderTop: '1px solid var(--color-neutral-100)',
  },
  cancelBtn: {
    padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: '14px',
    fontWeight: 600, color: 'var(--color-neutral-600)', background: 'var(--color-neutral-100)',
  },
  saveBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '10px 24px', borderRadius: 'var(--radius-md)', fontSize: '14px',
    fontWeight: 600, color: '#fff', background: 'var(--color-primary-600)', minWidth: '130px',
  },
  saveBtnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
}

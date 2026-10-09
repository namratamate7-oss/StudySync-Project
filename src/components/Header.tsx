import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Search, Plus, LogOut, User as UserIcon } from 'lucide-react'
import Avatar from './Avatar'
import { CATEGORY_OPTIONS } from '../lib/types'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  selectedCategory: string
  onCategoryChange: (cat: string) => void
  onPostProject: () => void
  onOpenProfile: () => void
}

export default function Header({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onPostProject,
  onOpenProfile,
}: HeaderProps) {
  const { profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header style={styles.header}>
      <div className="ss-header-inner" style={styles.inner}>
        <div style={styles.brandSection}>
          <div style={styles.logo}>
            <GraduationCap size={24} color="#fff" />
          </div>
          <span className="ss-brand-name" style={styles.brandName}>StudySync</span>
        </div>

        <div className="ss-search-section" style={styles.searchSection}>
          <div style={styles.searchWrap}>
            <Search size={18} color="var(--color-neutral-400)" />
            <input
              type="text"
              placeholder="Search projects, skills, or categories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <select
            className="ss-category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={styles.categorySelect}
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={styles.actions}>
          <button onClick={onPostProject} style={styles.postBtn}>
            <Plus size={18} />
            <span className="ss-post-btn-text" style={styles.postBtnText}>Post a Project</span>
          </button>

          <div style={styles.profileSection}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={styles.profileBtn}
            >
              <Avatar profile={profile} size={36} />
            </button>

            {menuOpen && (
              <>
                <div style={styles.menuOverlay} onClick={() => setMenuOpen(false)} />
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    <Avatar profile={profile} size={44} />
                    <div>
                      <div style={styles.dropdownName}>
                        {profile?.full_name || 'Student'}
                      </div>
                      <div style={styles.dropdownEmail}>
                        {profile?.university || 'Add your university'}
                      </div>
                    </div>
                  </div>
                  <div style={styles.dropdownDivider} />
                  <button
                    onClick={() => {
                      onOpenProfile()
                      setMenuOpen(false)
                    }}
                    style={styles.dropdownItem}
                  >
                    <UserIcon size={16} color="var(--color-neutral-600)" />
                    Edit Profile & Skills
                  </button>
                  <button
                    onClick={() => signOut()}
                    style={styles.dropdownItem}
                  >
                    <LogOut size={16} color="var(--color-neutral-600)" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#fff',
    borderBottom: '1px solid var(--color-neutral-200)',
    boxShadow: 'var(--shadow-sm)',
  },
  inner: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px',
    height: '68px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  brandSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  logo: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-md)',
  },
  brandName: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--color-neutral-900)',
    letterSpacing: '-0.5px',
  },
  searchSection: {
    display: 'flex',
    gap: '10px',
    flex: 1,
    maxWidth: '640px',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    background: 'var(--color-neutral-100)',
    borderRadius: 'var(--radius-md)',
    padding: '0 14px',
    border: '1.5px solid transparent',
    transition: 'border-color var(--transition)',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '10px 0',
    fontSize: '14px',
    background: 'transparent',
    color: 'var(--color-neutral-800)',
  },
  categorySelect: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--color-neutral-200)',
    background: '#fff',
    fontSize: '14px',
    color: 'var(--color-neutral-700)',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color var(--transition)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  postBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--color-primary-600)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    padding: '10px 18px',
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition)',
    whiteSpace: 'nowrap',
  },
  postBtnText: {
    display: 'inline',
  },
  profileSection: {
    position: 'relative',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    borderRadius: '50%',
    transition: 'transform var(--transition)',
  },
  menuOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 99,
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '48px',
    width: '260px',
    background: '#fff',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-xl)',
    border: '1px solid var(--color-neutral-200)',
    padding: '8px',
    zIndex: 100,
    animation: 'scaleIn 150ms ease-out',
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
  },
  dropdownName: {
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--color-neutral-900)',
  },
  dropdownEmail: {
    fontSize: '13px',
    color: 'var(--color-neutral-500)',
    marginTop: '2px',
  },
  dropdownDivider: {
    height: '1px',
    background: 'var(--color-neutral-100)',
    margin: '4px 0',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--color-neutral-700)',
    transition: 'background var(--transition)',
  },
}

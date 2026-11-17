import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Notification } from '../lib/types'
import {
  GraduationCap, Search, Plus, LogOut, User as UserIcon,
  Bell, Home, Inbox, FolderKanban, Send, LayoutDashboard,
  Check, X,
} from 'lucide-react'
import Avatar from './Avatar'
import { CATEGORY_OPTIONS } from '../lib/types'
import { formatDate } from '../lib/utils'

export type Page = 'explore' | 'dashboard' | 'incoming' | 'myprojects' | 'myrequests'

interface HeaderProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  selectedCategory: string
  onCategoryChange: (cat: string) => void
  onPostProject: () => void
  onOpenProfile: () => void
  onShowTerms: () => void
  refreshKey: number
}

export default function Header({
  currentPage, onNavigate, searchQuery, onSearchChange,
  selectedCategory, onCategoryChange, onPostProject, onOpenProfile, onShowTerms, refreshKey,
}: HeaderProps) {
  const { profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifLoading, setNotifLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!profile) return
    fetchNotifications()
  }, [profile, refreshKey])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchNotifications = async () => {
    if (!profile) return
    setNotifLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data as Notification[])
    setNotifLoading(false)
  }

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllRead = async () => {
    if (!profile) return
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'explore', label: 'Explore', icon: <Home size={17} /> },
    { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { page: 'incoming', label: 'Team Requests', icon: <Inbox size={17} /> },
    { page: 'myprojects', label: 'My Projects', icon: <FolderKanban size={17} /> },
    { page: 'myrequests', label: 'My Requests', icon: <Send size={17} /> },
  ]

  return (
    <header style={styles.header}>
      <div className="ss-header-inner" style={styles.inner}>
        <div style={styles.brandSection}>
          <div style={styles.logo}>
            <GraduationCap size={22} color="#fff" />
          </div>
          <span className="ss-brand-name" style={styles.brandName}>StudySync</span>
        </div>

        <nav className="ss-nav" style={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              style={{
                ...styles.navItem,
                ...(currentPage === item.page ? styles.navItemActive : {}),
              }}
              className="ss-nav-item"
            >
              {item.icon}
              <span className="ss-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={styles.actions}>
          <button onClick={onPostProject} style={styles.postBtn} className="ss-post-btn">
            <Plus size={18} />
            <span className="ss-post-btn-text">Post a Project</span>
          </button>

          <div ref={notifRef} style={styles.notifSection}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              style={styles.notifBtn}
              className="ss-notif-btn"
            >
              <Bell size={20} color="var(--color-neutral-600)" />
              {unreadCount > 0 && (
                <span style={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            {notifOpen && (
              <div style={styles.notifDropdown} className="ss-notif-dropdown">
                <div style={styles.notifHeader}>
                  <span style={styles.notifTitle}>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={styles.markAllBtn}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={styles.notifList}>
                  {notifLoading ? (
                    <div style={styles.notifEmpty}>Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div style={styles.notifEmpty}>
                      <Bell size={28} color="var(--color-neutral-300)" />
                      <p style={styles.notifEmptyText}>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          ...styles.notifItem,
                          ...(n.read ? styles.notifItemRead : {}),
                        }}
                      >
                        <div style={styles.notifIconWrap}>
                          {n.type === 'join_request' && <Inbox size={16} color="#2563eb" />}
                          {n.type === 'request_accepted' && <Check size={16} color="#059669" />}
                          {n.type === 'request_rejected' && <X size={16} color="#dc2626" />}
                          {n.type === 'added_to_team' && <UserIcon size={16} color="#10b981" />}
                        </div>
                        <div style={styles.notifContent}>
                          <div style={styles.notifItemTitle}>{n.title}</div>
                          <div style={styles.notifItemBody}>{n.body}</div>
                          <div style={styles.notifItemDate}>{formatDate(n.created_at)}</div>
                        </div>
                        {!n.read && (
                          <button onClick={() => markAsRead(n.id)} style={styles.notifDot} />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div ref={menuRef} style={styles.profileSection}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={styles.profileBtn}
            >
              <Avatar profile={profile} size={36} />
            </button>

            {menuOpen && (
              <div style={styles.dropdown} className="ss-dropdown">
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
                  onClick={() => { onOpenProfile(); setMenuOpen(false) }}
                  style={styles.dropdownItem}
                >
                  <UserIcon size={16} color="var(--color-neutral-600)" />
                  Edit Profile & Skills
                </button>
                <button
                  onClick={() => { onShowTerms(); setMenuOpen(false) }}
                  style={styles.dropdownItem}
                >
                  <LayoutDashboard size={16} color="var(--color-neutral-600)" />
                  Terms & Privacy
                </button>
                <div style={styles.dropdownDivider} />
                <button
                  onClick={() => signOut()}
                  style={styles.dropdownItem}
                >
                  <LogOut size={16} color="var(--color-neutral-600)" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {currentPage === 'explore' && (
        <div className="ss-search-bar" style={styles.searchBar}>
          <div style={styles.searchWrap}>
            <Search size={18} color="var(--color-neutral-400)" />
            <input
              type="text"
              placeholder="Search projects by title, description, or skills..."
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
      )}
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(20px) saturate(180%)',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  },
  inner: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px',
    height: '64px',
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
    width: '36px',
    height: '36px',
    borderRadius: '11px',
    background: 'linear-gradient(145deg, #123e70, #2878d4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sm)',
  },
  brandName: {
    fontSize: '19px',
    fontWeight: 700,
    color: 'var(--color-neutral-900)',
    letterSpacing: '-0.5px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--color-neutral-500)',
    transition: 'all var(--transition)',
    whiteSpace: 'nowrap',
  },
  navItemActive: {
    color: 'var(--color-primary-600)',
    background: 'var(--color-primary-50)',
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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
    padding: '9px 16px',
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition)',
    whiteSpace: 'nowrap',
  },
  notifSection: {
    position: 'relative',
  },
  notifBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-md)',
    position: 'relative',
    transition: 'background var(--transition)',
  },
  notifBadge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    background: '#ef4444',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 700,
    minWidth: '16px',
    height: '16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  },
  notifDropdown: {
    position: 'absolute',
    right: 0,
    top: '46px',
    width: '360px',
    background: '#fff',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-xl)',
    border: '1px solid var(--color-neutral-200)',
    zIndex: 200,
    maxHeight: '480px',
    display: 'flex',
    flexDirection: 'column',
    animation: 'scaleIn 150ms ease-out',
  },
  notifHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 18px',
    borderBottom: '1px solid var(--color-neutral-100)',
  },
  notifTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--color-neutral-900)',
  },
  markAllBtn: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-primary-600)',
  },
  notifList: {
    flex: 1,
    overflow: 'auto',
    padding: '6px',
  },
  notifEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '10px',
  },
  notifEmptyText: {
    fontSize: '14px',
    color: 'var(--color-neutral-400)',
  },
  notifItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-primary-50)',
    marginBottom: '4px',
    cursor: 'default',
  },
  notifItemRead: {
    background: 'transparent',
  },
  notifIconWrap: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--color-neutral-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    minWidth: 0,
  },
  notifItemTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--color-neutral-900)',
  },
  notifItemBody: {
    fontSize: '13px',
    color: 'var(--color-neutral-600)',
    marginTop: '2px',
    lineHeight: 1.4,
  },
  notifItemDate: {
    fontSize: '11px',
    color: 'var(--color-neutral-400)',
    marginTop: '4px',
  },
  notifDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--color-primary-600)',
    flexShrink: 0,
    marginTop: '5px',
  },
  searchBar: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '12px 24px 16px',
    display: 'flex',
    gap: '10px',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    background: 'rgba(118,118,128,0.1)',
    borderRadius: 'var(--radius-md)',
    padding: '0 14px',
    border: '1px solid transparent',
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
    whiteSpace: 'nowrap',
  },
  profileSection: {
    position: 'relative',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    borderRadius: '50%',
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
    zIndex: 200,
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

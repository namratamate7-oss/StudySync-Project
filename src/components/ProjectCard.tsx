import { Project, Profile } from '../lib/types'
import { CATEGORY_COLORS } from '../lib/types'
import { formatDate, getInitials } from '../lib/utils'
import { Users, Clock, ArrowRight, CheckCircle2 } from 'lucide-react'
import Avatar from './Avatar'
import SkillBadge from './SkillBadge'

interface ProjectCardProps {
  project: Project
  ownerProfile?: Profile
  hasRequested: boolean
  isOwner: boolean
  onJoin: (project: Project) => void
}

export default function ProjectCard({ project, ownerProfile, hasRequested, isOwner, onJoin }: ProjectCardProps) {
  const categoryColor = CATEGORY_COLORS[project.category] || '#3b82f6'

  return (
    <div style={styles.card}>
      <div style={{ ...styles.categoryBar, background: categoryColor }} />

      <div style={styles.cardBody}>
        <div style={styles.cardHeader}>
          <span style={{ ...styles.categoryTag, color: categoryColor, borderColor: categoryColor }}>
            {project.category}
          </span>
          {project.status === 'open' ? (
            <span style={styles.statusOpen}>
              <span style={styles.statusDot} /> Open
            </span>
          ) : (
            <span style={styles.statusClosed}>Closed</span>
          )}
        </div>

        <h3 style={styles.title}>{project.title}</h3>
        <p style={styles.description}>
          {project.description.length > 140
            ? project.description.slice(0, 140) + '...'
            : project.description}
        </p>

        <div style={styles.skills}>
          {project.skills_needed.slice(0, 5).map((skill) => (
            <SkillBadge key={skill} skill={skill} size="sm" />
          ))}
          {project.skills_needed.length > 5 && (
            <span style={styles.moreSkills}>+{project.skills_needed.length - 5} more</span>
          )}
        </div>

        <div className="ss-project-card-footer" style={styles.cardFooter}>
          <div style={styles.ownerInfo}>
            <Avatar profile={ownerProfile} size={28} />
            <div style={styles.ownerDetails}>
              <span style={styles.ownerName}>
                {ownerProfile?.full_name || 'Unknown'}
              </span>
              <span style={styles.ownerMeta}>
                {formatDate(project.created_at)}
              </span>
            </div>
          </div>

          <div style={styles.footerRight}>
            <div style={styles.teamSize}>
              <Users size={14} color="var(--color-neutral-500)" />
              <span>{project.team_size} seats</span>
            </div>
            {isOwner ? (
              <span style={styles.ownerBadge}>
                <CheckCircle2 size={14} color="var(--color-primary-600)" />
                Your Project
              </span>
            ) : hasRequested ? (
              <span style={styles.requestedBadge}>Requested</span>
            ) : project.status === 'open' ? (
              <button onClick={() => onJoin(project)} style={styles.joinBtn}>
                Request to Join
                <ArrowRight size={15} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#fff',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    border: '1px solid var(--color-neutral-200)',
    transition: 'all var(--transition)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideUp 300ms ease-out',
  },
  categoryBar: {
    height: '4px',
    width: '100%',
  },
  cardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    flex: 1,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '3px 10px',
    borderRadius: '20px',
    border: '1px solid',
  },
  statusOpen: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#059669',
    background: '#d1fae5',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#10b981',
  },
  statusClosed: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-neutral-500)',
    background: 'var(--color-neutral-100)',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--color-neutral-900)',
    lineHeight: 1.3,
  },
  description: {
    fontSize: '14px',
    color: 'var(--color-neutral-600)',
    lineHeight: 1.5,
  },
  skills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    minHeight: '24px',
  },
  moreSkills: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--color-neutral-500)',
    padding: '3px 8px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginTop: 'auto',
    paddingTop: '4px',
    borderTop: '1px solid var(--color-neutral-100)',
  },
  ownerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  ownerDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  ownerName: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-neutral-700)',
  },
  ownerMeta: {
    fontSize: '11px',
    color: 'var(--color-neutral-400)',
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  teamSize: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--color-neutral-500)',
  },
  joinBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--color-primary-600)',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    padding: '7px 14px',
    borderRadius: 'var(--radius-sm)',
    transition: 'all var(--transition)',
    whiteSpace: 'nowrap',
  },
  ownerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-primary-600)',
  },
  requestedBadge: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#d97706',
    background: '#fef3c7',
    padding: '4px 10px',
    borderRadius: '20px',
  },
}

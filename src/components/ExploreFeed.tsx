import { Project, Profile, JoinRequest } from '../lib/types'
import ProjectCard from './ProjectCard'
import { Search, Loader2, FolderOpen } from 'lucide-react'

interface ExploreFeedProps {
  projects: Project[]
  profiles: Map<string, Profile>
  joinRequests: JoinRequest[]
  currentUserId: string
  loading: boolean
  searchQuery: string
  selectedCategory: string
  onJoin: (project: Project) => void
}

export default function ExploreFeed({
  projects,
  profiles,
  joinRequests,
  currentUserId,
  loading,
  searchQuery,
  selectedCategory,
  onJoin,
}: ExploreFeedProps) {
  const requestedProjectIds = new Set(joinRequests.map((r) => r.project_id))

  if (loading) {
    return (
      <div style={styles.loadingState}>
        <Loader2 size={32} color="var(--color-primary-500)" className="spin" />
        <p style={styles.loadingText}>Loading projects...</p>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .spin { animation: spin 1s linear infinite; }
        `}</style>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>
          <FolderOpen size={40} color="var(--color-neutral-400)" />
        </div>
        <h3 style={styles.emptyTitle}>No projects found</h3>
        <p style={styles.emptyText}>
          {searchQuery || selectedCategory
            ? 'Try adjusting your search or filters.'
            : 'Be the first to post a project and find your team!'}
        </p>
      </div>
    )
  }

  return (
    <div style={styles.feed}>
      <div style={styles.feedHeader}>
        <h2 className="ss-feed-title" style={styles.feedTitle}>Explore Projects</h2>
        <span style={styles.feedCount}>{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="ss-feed-grid" style={styles.grid}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            ownerProfile={profiles.get(project.user_id)}
            hasRequested={requestedProjectIds.has(project.id)}
            isOwner={project.user_id === currentUserId}
            onJoin={onJoin}
          />
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  feed: {
    flex: 1,
    minWidth: 0,
  },
  feedHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  feedTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--color-neutral-900)',
  },
  feedCount: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--color-neutral-500)',
    background: 'var(--color-neutral-100)',
    padding: '3px 12px',
    borderRadius: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '16px',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    gap: '12px',
  },
  loadingText: {
    fontSize: '15px',
    color: 'var(--color-neutral-500)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'var(--color-neutral-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--color-neutral-700)',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--color-neutral-500)',
    maxWidth: '320px',
  },
}

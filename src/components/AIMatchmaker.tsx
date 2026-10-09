import { Project, Profile } from '../lib/types'
import { matchProjects, getMatchLabel, getMatchColor, formatDate } from '../lib/utils'
import { Sparkles, TrendingUp, ArrowRight, Lightbulb } from 'lucide-react'
import { CATEGORY_COLORS } from '../lib/types'

interface AIMatchmakerProps {
  projects: Project[]
  userSkills: string[]
  profile: Profile | null
  onProjectClick: (project: Project) => void
}

export default function AIMatchmaker({ projects, userSkills, profile, onProjectClick }: AIMatchmakerProps) {
  const matches = matchProjects(
    projects.filter((p) => p.status === 'open'),
    userSkills
  )
  const topMatches = matches.slice(0, 5)

  return (
    <aside className="ss-matchmaker" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <h2 style={styles.title}>AI Matchmaker</h2>
          <p style={styles.subtitle}>Smart project recommendations</p>
        </div>
      </div>

      {userSkills.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <Lightbulb size={28} color="var(--color-accent-500)" />
          </div>
          <h3 style={styles.emptyTitle}>Add your skills</h3>
          <p style={styles.emptyText}>
            Update your profile with skills like Python, React, or UI/UX to get
            personalized project recommendations.
          </p>
        </div>
      ) : (
        <>
          <div style={styles.skillsBox}>
            <div style={styles.skillsLabel}>Matching against your skills:</div>
            <div style={styles.skillsList}>
              {userSkills.map((skill) => (
                <span key={skill} style={styles.skillTag}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="ss-matchmaker-matches" style={styles.matchesList}>
            <div style={styles.matchesHeader}>
              <TrendingUp size={14} color="var(--color-primary-600)" />
              <span>Top Matches</span>
            </div>

            {topMatches.map((match, idx) => {
              const color = getMatchColor(match.matchPercentage)
              return (
                <div
                  key={match.project.id}
                  onClick={() => onProjectClick(match.project)}
                  style={styles.matchCard}
                >
                  <div style={styles.matchRank}>{idx + 1}</div>

                  <div style={styles.matchContent}>
                    <div style={styles.matchTopRow}>
                      <span
                        style={{
                          ...styles.matchCategory,
                          color: CATEGORY_COLORS[match.project.category] || '#3b82f6',
                        }}
                      >
                        {match.project.category}
                      </span>
                      <span style={{ ...styles.matchPercent, color }}>
                        {match.matchPercentage}%
                      </span>
                    </div>

                    <h4 style={styles.matchTitle}>{match.project.title}</h4>

                    <div style={styles.matchBar}>
                      <div
                        style={{
                          ...styles.matchBarFill,
                          width: `${match.matchPercentage}%`,
                          background: color,
                        }}
                      />
                    </div>

                    <div style={styles.matchLabelRow}>
                      <span style={{ ...styles.matchLabelText, color }}>
                        {getMatchLabel(match.matchPercentage)}
                      </span>
                      <span style={styles.matchDate}>
                        {formatDate(match.project.created_at)}
                      </span>
                    </div>

                    {match.matchedSkills.length > 0 && (
                      <div style={styles.matchedSkills}>
                        {match.matchedSkills.slice(0, 3).map((skill) => (
                          <span key={skill} style={styles.matchedSkill}>
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <ArrowRight size={16} color="var(--color-neutral-400)" style={{ flexShrink: 0 }} />
                </div>
              )
            })}
          </div>
        </>
      )}
    </aside>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '320px',
    flexShrink: 0,
    background: '#fff',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-neutral-200)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: '88px',
    maxHeight: 'calc(100vh - 108px)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
    background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
  },
  headerIcon: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#fff',
  },
  subtitle: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
    marginTop: '2px',
  },
  emptyState: {
    padding: '32px 24px',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#fef3c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--color-neutral-800)',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '13px',
    color: 'var(--color-neutral-500)',
    lineHeight: 1.5,
  },
  skillsBox: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--color-neutral-100)',
  },
  skillsLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--color-neutral-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  skillsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
  },
  skillTag: {
    fontSize: '11px',
    fontWeight: 500,
    padding: '3px 8px',
    borderRadius: '20px',
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
  },
  matchesList: {
    flex: 1,
    overflow: 'auto',
    padding: '8px 12px 16px',
  },
  matchesHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 8px 12px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-neutral-700)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  matchCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'background var(--transition)',
    marginBottom: '4px',
  },
  matchRank: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: 'var(--color-neutral-100)',
    color: 'var(--color-neutral-600)',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  matchContent: {
    flex: 1,
    minWidth: 0,
  },
  matchTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  matchCategory: {
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  matchPercent: {
    fontSize: '14px',
    fontWeight: 700,
  },
  matchTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--color-neutral-800)',
    lineHeight: 1.3,
    marginBottom: '8px',
  },
  matchBar: {
    height: '5px',
    background: 'var(--color-neutral-100)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  matchBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 500ms ease-out',
  },
  matchLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchLabelText: {
    fontSize: '11px',
    fontWeight: 600,
  },
  matchDate: {
    fontSize: '11px',
    color: 'var(--color-neutral-400)',
  },
  matchedSkills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '8px',
  },
  matchedSkill: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#047857',
    background: '#d1fae5',
    padding: '2px 6px',
    borderRadius: '12px',
  },
}

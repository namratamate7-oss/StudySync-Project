import { Project, Profile } from './types'

export interface MatchResult {
  project: Project
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  matchPercentage: number
}

/**
 * AI Matchmaker: scores projects against the user's skill set.
 * Projects requiring skills the user has score higher.
 */
export function matchProjects(
  projects: Project[],
  userSkills: string[]
): MatchResult[] {
  if (!userSkills.length) {
    return projects.map((project) => ({
      project,
      score: 0,
      matchedSkills: [],
      missingSkills: project.skills_needed,
      matchPercentage: 0,
    }))
  }

  const userSkillsLower = userSkills.map((s) => s.toLowerCase())

  return projects
    .map((project) => {
      const neededLower = project.skills_needed.map((s) => s.toLowerCase())
      const matched = project.skills_needed.filter((_, i) =>
        userSkillsLower.includes(neededLower[i])
      )
      const missing = project.skills_needed.filter((_, i) =>
        !userSkillsLower.includes(neededLower[i])
      )
      const matchPercentage =
        project.skills_needed.length === 0
          ? 50
          : Math.round((matched.length / project.skills_needed.length) * 100)

      return {
        project,
        score: matched.length * 10 + matchPercentage,
        matchedSkills: matched,
        missingSkills: missing,
        matchPercentage,
      }
    })
    .sort((a, b) => b.score - a.score)
}

export function getMatchLabel(percentage: number): string {
  if (percentage >= 75) return 'Excellent Match'
  if (percentage >= 50) return 'Good Match'
  if (percentage >= 25) return 'Partial Match'
  return 'Skills Gap'
}

export function getMatchColor(percentage: number): string {
  if (percentage >= 75) return '#10b981'
  if (percentage >= 50) return '#3b82f6'
  if (percentage >= 25) return '#f59e0b'
  return '#ef4444'
}

export function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function getProfileById(profiles: Profile[], id: string): Profile | undefined {
  return profiles.find((p) => p.id === id)
}

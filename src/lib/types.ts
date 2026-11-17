export interface Profile {
  id: string
  full_name: string
  university: string
  major: string
  year: string
  bio: string
  skills: string[]
  interests: string[]
  avatar_color: string
  github_url: string
  linkedin_url: string
  created_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  category: string
  skills_needed: string[]
  team_size: number
  current_team_size: number
  status: string
  user_id: string
  duration: string
  additional_requirements: string
  created_at: string
  profiles?: Profile
}

export interface JoinRequest {
  id: string
  project_id: string
  user_id: string
  message: string
  why_join: string
  status: string
  created_at: string
  profiles?: Profile
  projects?: Project
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: string
  joined_at: string
  profiles?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  project_id: string | null
  actor_id: string | null
  read: boolean
  created_at: string
}

export const SKILL_OPTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'Next.js', 'Vue.js', 'TailwindCSS', 'Java', 'C++',
  'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter',
  'PostgreSQL', 'MongoDB', 'GraphQL', 'AWS', 'Docker',
  'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Science',
  'UI/UX Design', 'Figma', 'Cybersecurity', 'Unity',
  'Blockchain', 'IoT',
]

export const CATEGORY_OPTIONS = [
  'Web Development',
  'App Development',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing',
  'IoT',
]

export const CATEGORY_COLORS: Record<string, string> = {
  'Web Development': '#3b82f6',
  'App Development': '#f59e0b',
  'Artificial Intelligence': '#10b981',
  'Machine Learning': '#14b8a6',
  'Data Science': '#6366f1',
  'Cybersecurity': '#ef4444',
  'Cloud Computing': '#0ea5e9',
  'IoT': '#f97316',
}

export const INTEREST_OPTIONS = [
  'Web Apps', 'Mobile Apps', 'AI Research', 'Open Source',
  'Game Dev', 'Robotics', 'Fintech', 'HealthTech',
  'EdTech', 'Climate Tech', 'Bioinformatics', 'Entrepreneurship',
]

export const YEAR_OPTIONS = [
  '1st Year', '2nd Year', '3rd Year', '4th Year',
  '5th Year', 'Graduate', 'PhD',
]

export const DURATION_OPTIONS = [
  '1-2 weeks', '3-4 weeks', '1-2 months', '3-6 months',
  '6+ months', 'Ongoing',
]

export const AVATAR_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ec4899',
  '#14b8a6', '#ef4444', '#f97316', '#6366f1',
]

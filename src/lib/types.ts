export interface Profile {
  id: string
  full_name: string
  university: string
  major: string
  bio: string
  skills: string[]
  avatar_color: string
  created_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  category: string
  skills_needed: string[]
  team_size: number
  status: string
  user_id: string
  created_at: string
  profiles?: Profile
}

export interface JoinRequest {
  id: string
  project_id: string
  user_id: string
  message: string
  status: string
  created_at: string
  profiles?: Profile
}

export const SKILL_OPTIONS = [
  'Python', 'JavaScript', 'React', 'TypeScript', 'Node.js',
  'UI/UX Design', 'Figma', 'Machine Learning', 'Data Science',
  'TensorFlow', 'PyTorch', 'Java', 'C++', 'Go', 'Rust',
  'Swift', 'Kotlin', 'Flutter', 'Docker', 'AWS',
  'PostgreSQL', 'MongoDB', 'GraphQL', 'TailwindCSS', 'Vue.js',
  'Next.js', 'Three.js', 'Game Dev', 'Unity', 'Blockchain',
]

export const CATEGORY_OPTIONS = [
  'Web Development',
  'AI / Machine Learning',
  'Mobile Apps',
  'Data Science',
  'UI/UX Design',
  'Game Development',
  'Blockchain',
  'IoT / Hardware',
]

export const CATEGORY_COLORS: Record<string, string> = {
  'Web Development': '#3b82f6',
  'AI / Machine Learning': '#10b981',
  'Mobile Apps': '#f59e0b',
  'Data Science': '#8b5cf6',
  'UI/UX Design': '#ec4899',
  'Game Development': '#ef4444',
  'Blockchain': '#f97316',
  'IoT / Hardware': '#14b8a6',
}

export const AVATAR_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ec4899',
  '#8b5cf6', '#14b8a6', '#ef4444', '#f97316',
]

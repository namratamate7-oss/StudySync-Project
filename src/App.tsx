import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './context/AuthContext'
import { supabase } from './lib/supabase'
import { Project, Profile, JoinRequest } from './lib/types'
import Header from './components/Header'
import AuthScreen from './components/AuthScreen'
import ExploreFeed from './components/ExploreFeed'
import AIMatchmaker from './components/AIMatchmaker'
import PostProjectModal from './components/PostProjectModal'
import JoinRequestModal from './components/JoinRequestModal'
import ProfileModal from './components/ProfileModal'
import { Loader2 } from 'lucide-react'

export default function App() {
  const { session, profile, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map())
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showPostModal, setShowPostModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [joinTarget, setJoinTarget] = useState<Project | null>(null)

  const fetchData = useCallback(async () => {
    if (!session) return

    setLoading(true)

    const [{ data: projectsData }, { data: profilesData }, { data: requestsData }] =
      await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase
          .from('join_requests')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }),
      ])

    if (projectsData) setProjects(projectsData as Project[])
    if (profilesData) {
      const map = new Map<string, Profile>()
      ;(profilesData as Profile[]).forEach((p) => map.set(p.id, p))
      setProfiles(map)
    }
    if (requestsData) setJoinRequests(requestsData as JoinRequest[])
    setLoading(false)
  }, [session])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePostProject = async (data: Omit<Project, 'id' | 'user_id' | 'created_at' | 'status' | 'profiles'>) => {
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert(data)
      .select('*')
      .single()

    if (!error && newProject) {
      setProjects((prev) => [newProject as Project, ...prev])
      setShowPostModal(false)
    }
  }

  const handleJoinRequest = async (message: string) => {
    if (!joinTarget || !session) return

    const { error } = await supabase.from('join_requests').insert({
      project_id: joinTarget.id,
      user_id: session.user.id,
      message,
    })

    if (!error) {
      setJoinRequests((prev) => [
        {
          id: crypto.randomUUID(),
          project_id: joinTarget.id,
          user_id: session.user.id,
          message,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        ...prev,
      ])
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      !searchQuery ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.skills_needed.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
    const matchesCategory =
      !selectedCategory || project.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Loader2 size={32} color="var(--color-primary-500)" className="spin" />
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .spin { animation: spin 1s linear infinite; }
        `}</style>
      </div>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  const ownerName = joinTarget ? profiles.get(joinTarget.user_id)?.full_name : undefined

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-neutral-50)' }}>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onPostProject={() => setShowPostModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      <div className="ss-content" style={styles.content}>
        <div style={styles.mainArea}>
          <ExploreFeed
            projects={filteredProjects}
            profiles={profiles}
            joinRequests={joinRequests}
            currentUserId={session.user.id}
            loading={loading}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onJoin={(project) => setJoinTarget(project)}
          />
        </div>

        <AIMatchmaker
          projects={projects}
          userSkills={profile?.skills || []}
          profile={profile}
          onProjectClick={(project) => {
            if (project.user_id === session.user.id) return
            const hasRequested = joinRequests.some((r) => r.project_id === project.id)
            if (!hasRequested && project.status === 'open') {
              setJoinTarget(project)
            }
          }}
        />
      </div>

      {showPostModal && (
        <PostProjectModal
          onClose={() => setShowPostModal(false)}
          onSubmit={handlePostProject}
        />
      )}

      {joinTarget && (
        <JoinRequestModal
          project={joinTarget}
          ownerName={ownerName}
          onClose={() => setJoinTarget(null)}
          onSubmit={handleJoinRequest}
        />
      )}

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px',
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  mainArea: {
    flex: 1,
    minWidth: 0,
  },
}

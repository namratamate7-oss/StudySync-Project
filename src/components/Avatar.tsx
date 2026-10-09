import { Profile } from '../lib/types'
import { getInitials } from '../lib/utils'

interface AvatarProps {
  profile?: Profile | null
  name?: string
  color?: string
  size?: number
}

export default function Avatar({ profile, name, color, size = 40 }: AvatarProps) {
  const displayName = profile?.full_name || name || '?'
  const bg = profile?.avatar_color || color || '#3b82f6'
  const initials = getInitials(displayName)

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: `${size * 0.38}px`,
        fontWeight: 600,
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {initials}
    </div>
  )
}

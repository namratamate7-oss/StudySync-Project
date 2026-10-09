interface SkillBadgeProps {
  skill: string
  matched?: boolean
  size?: 'sm' | 'md'
}

export default function SkillBadge({ skill, matched, size = 'md' }: SkillBadgeProps) {
  const fontSize = size === 'sm' ? '11px' : '12px'
  const padding = size === 'sm' ? '3px 8px' : '5px 10px'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding,
        borderRadius: '20px',
        fontSize,
        fontWeight: 500,
        background: matched ? '#d1fae5' : '#eff6ff',
        color: matched ? '#047857' : '#1d4ed8',
        border: `1px solid ${matched ? '#a7f3d0' : '#bfdbfe'}`,
        whiteSpace: 'nowrap',
      }}
    >
      {matched && <span style={{ fontSize: '10px' }}>✓</span>}
      {skill}
    </span>
  )
}

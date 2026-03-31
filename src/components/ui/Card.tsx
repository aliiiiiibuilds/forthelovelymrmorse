'use client'
import React from 'react'

interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  onClick?: () => void
  hoverable?: boolean
  glow?: boolean
}

export default function Card({ children, style, className, onClick, hoverable, glow }: CardProps) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered && hoverable ? 'var(--border-bright)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : undefined,
        transform: hovered && hoverable ? 'translateY(-2px)' : 'none',
        boxShadow: glow ? 'var(--shadow-glow)' : hovered && hoverable ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

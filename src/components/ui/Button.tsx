'use client'
import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const styles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #6c63ff, #8b7fff)',
    color: '#fff',
    border: '1px solid rgba(108,99,255,0.4)',
    boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
  },
  secondary: {
    background: 'rgba(0,212,170,0.1)',
    color: '#00d4aa',
    border: '1px solid rgba(0,212,170,0.3)',
  },
  ghost: {
    background: 'rgba(255,255,255,0.05)',
    color: '#f0f4ff',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  danger: {
    background: 'rgba(255,77,109,0.1)',
    color: '#ff4d6d',
    border: '1px solid rgba(255,77,109,0.3)',
  },
  success: {
    background: 'rgba(0,212,170,0.15)',
    color: '#00d4aa',
    border: '1px solid rgba(0,212,170,0.4)',
  },
}

const sizes: Record<Size, React.CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: '12px', borderRadius: '8px' },
  md: { padding: '10px 20px', fontSize: '14px', borderRadius: '10px' },
  lg: { padding: '14px 28px', fontSize: '15px', borderRadius: '12px' },
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'all 0.2s ease',
        outline: 'none',
        width: fullWidth ? '100%' : undefined,
        letterSpacing: '0.01em',
        ...styles[variant],
        ...sizes[size],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
          ;(e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)'
        }
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)'
      }}
      {...props}
    >
      {loading && <span className="spinner" style={{ width: 14, height: 14 }} />}
      {children}
    </button>
  )
}

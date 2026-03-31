'use client'
import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export default function Input({ label, error, icon, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
            {icon}
          </span>
        )}
        <input
          style={{
            width: '100%',
            padding: icon ? '11px 14px 11px 38px' : '11px 14px',
            background: 'var(--bg-elevated)',
            border: error ? '1px solid rgba(255,77,109,0.5)' : '1px solid var(--border-normal)',
            borderRadius: 10,
            color: 'var(--text-primary)',
            fontSize: 14,
            outline: 'none',
            fontFamily: 'var(--font-display)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            ...style,
          }}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: 12, color: 'var(--accent-rose)', marginTop: 2 }}>{error}</span>}
    </div>
  )
}

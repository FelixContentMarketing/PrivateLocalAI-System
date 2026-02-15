import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error'
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-dark-border text-dark-muted': variant === 'default',
          'bg-green-900/40 text-green-400': variant === 'success',
          'bg-yellow-900/40 text-yellow-400': variant === 'warning',
          'bg-red-900/40 text-red-400': variant === 'error',
        },
        className,
      )}
    >
      {children}
    </span>
  )
}

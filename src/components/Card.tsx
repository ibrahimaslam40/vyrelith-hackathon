import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-card border-[0.5px] border-vyr-lavenderPl bg-white p-4 ${className}`}
    >
      {children}
    </div>
  )
}

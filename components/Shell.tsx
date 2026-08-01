import type { ReactNode } from 'react'

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-vyr-lavenderPl flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-vyr-bg flex flex-col">
        {children}
      </div>
    </div>
  )
}

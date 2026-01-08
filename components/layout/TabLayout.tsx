'use client'

import { BottomNav } from './BottomNav'

interface TabLayoutProps {
  children: React.ReactNode
}

export function TabLayout({ children }: TabLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-nav">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface HeaderProps {
  title: string
  subtitle?: string
  showSettings?: boolean
  rightAction?: React.ReactNode
}

export function Header({ title, subtitle, showSettings = true, rightAction }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border safe-area-inset-top">
      <div className="flex items-center justify-between h-14 px-4">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {rightAction}
          {showSettings && (
            <Link
              href="/settings"
              className={cn(
                'tap-target flex items-center justify-center',
                'text-muted-foreground hover:text-foreground transition-colors'
              )}
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

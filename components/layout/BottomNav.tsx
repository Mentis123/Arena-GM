'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  Play,
  Users,
  Calendar,
  Gift,
  Dices,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/session', label: 'Session', icon: Play },
  { href: '/roll', label: 'Roll', icon: Dices },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/loot', label: 'Loot', icon: Gift },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full h-full',
                'tap-target touch-manipulation transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn(
                'text-xs',
                isActive && 'font-medium'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

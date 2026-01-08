'use client'

import { useState } from 'react'
import { TabLayout } from '@/components/layout/TabLayout'
import { Header } from '@/components/layout/Header'
import { cn } from '@/lib/utils/cn'
import {
  Copy,
  Check,
  Gamepad2,
  BookOpen,
  Users,
  Flag,
  Gift,
  Dices,
  ScrollText,
  Settings,
  Eye,
  User,
} from 'lucide-react'

const BASE_URL = 'arena-gm.vercel.app'

interface LinkItem {
  path: string
  label: string
  description: string
  icon: React.ReactNode
}

const GM_LINKS: LinkItem[] = [
  {
    path: '/session',
    label: 'Session',
    description: 'Main dashboard with scoreboard & dice',
    icon: <Gamepad2 className="w-5 h-5" />,
  },
  {
    path: '/wizard',
    label: 'Campaign Guide',
    description: 'Step-by-step setup & rules tutorial',
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    path: '/players',
    label: 'Players',
    description: 'Manage commoners, HP & status',
    icon: <Users className="w-5 h-5" />,
  },
  {
    path: '/events',
    label: 'Events',
    description: 'Start & run tournament events',
    icon: <Flag className="w-5 h-5" />,
  },
  {
    path: '/loot',
    label: 'Loot',
    description: 'Silver & Crap deck management',
    icon: <Gift className="w-5 h-5" />,
  },
  {
    path: '/roll',
    label: 'Dice Roller',
    description: 'Full dice roller with modifiers',
    icon: <Dices className="w-5 h-5" />,
  },
  {
    path: '/rules',
    label: 'Rules',
    description: 'Quick reference for game rules',
    icon: <ScrollText className="w-5 h-5" />,
  },
  {
    path: '/settings',
    label: 'Settings',
    description: 'Import/export & preferences',
    icon: <Settings className="w-5 h-5" />,
  },
]

const PLAYER_LINKS: LinkItem[] = [
  {
    path: '/play',
    label: 'All Players',
    description: 'Live scoreboard for everyone',
    icon: <Eye className="w-5 h-5" />,
  },
  {
    path: '/play/1',
    label: 'Player 1',
    description: 'Personal view for Player 1',
    icon: <User className="w-5 h-5" />,
  },
  {
    path: '/play/2',
    label: 'Player 2',
    description: 'Personal view for Player 2',
    icon: <User className="w-5 h-5" />,
  },
  {
    path: '/play/3',
    label: 'Player 3',
    description: 'Personal view for Player 3',
    icon: <User className="w-5 h-5" />,
  },
  {
    path: '/play/4',
    label: 'Player 4',
    description: 'Personal view for Player 4',
    icon: <User className="w-5 h-5" />,
  },
  {
    path: '/play/5',
    label: 'Player 5',
    description: 'Personal view for Player 5',
    icon: <User className="w-5 h-5" />,
  },
]

function CopyableLink({ item }: { item: LinkItem }) {
  const [copied, setCopied] = useState(false)
  const fullUrl = `${BASE_URL}${item.path}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = fullUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border">
      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{item.label}</div>
        <div className="text-xs text-muted-foreground truncate">{item.description}</div>
        <div className="text-xs text-primary font-mono mt-0.5 truncate">{fullUrl}</div>
      </div>
      <button
        onClick={handleCopy}
        className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center shrink-0',
          'tap-target touch-manipulation transition-all',
          copied
            ? 'bg-green-500/20 text-green-400'
            : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
        )}
        aria-label={copied ? 'Copied!' : 'Copy URL'}
      >
        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
      </button>
    </div>
  )
}

export default function LinksPage() {
  return (
    <TabLayout>
      <Header title="Share Links" subtitle="Copy URLs to share" showSettings={false} />

      <div className="p-4 space-y-6 pb-nav">
        {/* GM Links */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            GM Views (For You)
          </h2>
          <div className="space-y-2">
            {GM_LINKS.map((item) => (
              <CopyableLink key={item.path} item={item} />
            ))}
          </div>
        </section>

        {/* Player Links */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            Player Views (Share These)
          </h2>
          <div className="space-y-2">
            {PLAYER_LINKS.map((item) => (
              <CopyableLink key={item.path} item={item} />
            ))}
          </div>
        </section>

        {/* Tip */}
        <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
          <p className="text-sm text-primary/90">
            <span className="font-medium">Tip:</span> Send each player their personal
            link (/play/1, /play/2, etc.) so they can see their commoners on their own phone!
          </p>
        </div>
      </div>
    </TabLayout>
  )
}

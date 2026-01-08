import { NextRequest, NextResponse } from 'next/server'
import { getLatestSession, upsertSession, initDb } from '@/lib/neondb'

// GET /api/session - Get the latest session (for player view)
export async function GET() {
  try {
    // Initialize DB on first request
    await initDb()

    const session = await getLatestSession()

    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 })
    }

    return NextResponse.json({ session }, { status: 200 })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

// POST /api/session - Create or update a session
export async function POST(request: NextRequest) {
  try {
    // Initialize DB on first request
    await initDb()

    const body = await request.json()
    const { session } = body

    if (!session || !session.id) {
      return NextResponse.json(
        { error: 'Session data with id is required' },
        { status: 400 }
      )
    }

    await upsertSession(session.id, session)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error saving session:', error)
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    )
  }
}

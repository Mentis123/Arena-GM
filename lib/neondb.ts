import { neon } from '@neondatabase/serverless'

// Get database connection
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return neon(databaseUrl)
}

// Initialize the sessions table if it doesn't exist
export async function initDb() {
  const sql = getDb()

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `
}

// Get session by ID
export async function getSession(id: string) {
  const sql = getDb()

  const result = await sql`
    SELECT data FROM sessions WHERE id = ${id}
  `

  return result[0]?.data ?? null
}

// Upsert session (create or update)
export async function upsertSession(id: string, data: unknown) {
  const sql = getDb()

  await sql`
    INSERT INTO sessions (id, data, updated_at)
    VALUES (${id}, ${JSON.stringify(data)}, NOW())
    ON CONFLICT (id)
    DO UPDATE SET data = ${JSON.stringify(data)}, updated_at = NOW()
  `
}

// Get the most recent session (for player view when no ID specified)
export async function getLatestSession() {
  const sql = getDb()

  const result = await sql`
    SELECT data FROM sessions
    ORDER BY updated_at DESC
    LIMIT 1
  `

  return result[0]?.data ?? null
}

/** Domain types shared across the app. Mirror the API's JSON exactly. */

export type Role = 'client' | 'professional'
export type UserRole = Role | string

export interface User {
  id: number
  name: string
  email?: string
  role?: UserRole
  bio?: string
  portfolio_link?: string
  /** The API returns this as an array or a JSON string — read it through `parseSkills`. */
  skills?: string[] | string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: Role
  skills?: string[]
  bio?: string
  portfolio_link?: string
}

export interface Message {
  id?: number
  sender_id: number
  receiver_id: number
  text: string
  timestamp: string
  conversation_id: string
}

export interface Post {
  id: number
  title: string
  description: string
  skill_needed: string
  deadline?: string | null
  budget?: number | null
  currency?: string
  status: 'open' | 'closed' | string
  posted_by: number
}

export type PostInput = Pick<Post, 'title' | 'description' | 'skill_needed'> &
  Partial<Pick<Post, 'deadline' | 'budget' | 'currency'>>

/** Normalizes the `skills` field, which the API returns inconsistently. */
export function parseSkills(skills: User['skills']): string[] {
  if (Array.isArray(skills)) return skills.filter((s) => typeof s === 'string')
  if (typeof skills === 'string') {
    try {
      const parsed = JSON.parse(skills || '[]')
      return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : []
    } catch {
      return []
    }
  }
  return []
}

export function isProfessional(user: Pick<User, 'role'> | null | undefined): boolean {
  return user?.role === 'professional'
}

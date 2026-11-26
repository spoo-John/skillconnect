import type { AuthResponse, Message, Post, PostInput, RegisterPayload, User } from '../types'

export const API_BASE =
  import.meta.env.VITE_API_URL || 'https://skillconnect-backend-production.up.railway.app/api'

const TIMEOUT_MS = 15_000

export class ApiError extends Error {
  /** HTTP status, or 0 when the request never reached the server. */
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Human-readable message for any error thrown by the API layer. */
export function errorMessage(err: unknown, fallback = 'Something went wrong. Try again.'): string {
  return err instanceof ApiError ? err.message : fallback
}

let onUnauthorized: (() => void) | null = null

/** AuthContext registers this so an expired token signs the user out everywhere at once. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  token?: string | null
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.token) headers.Authorization = `Bearer ${options.token}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  options.signal?.addEventListener('abort', () => controller.abort())

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    })
  } catch {
    throw new ApiError("Can't reach SkillConnect. Check your connection and try again.", 0)
  } finally {
    clearTimeout(timer)
  }

  // The API doesn't always return JSON (e.g. on 204 or some errors), so guard the parse.
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 401 && options.token) onUnauthorized?.()
    const message =
      (res.status < 500 &&
        data && typeof data === 'object' && ('error' in data || 'message' in data)
        ? String((data as { error?: unknown; message?: unknown }).error ?? (data as { message?: unknown }).message)
        : '') || defaultMessage(res.status)
    throw new ApiError(message, res.status)
  }

  return data as T
}

function defaultMessage(status: number): string {
  if (status === 401) return 'Your session has ended. Log in again.'
  if (status === 403) return "You don't have access to that."
  if (status === 404) return 'Not found.'
  if (status >= 500) return 'SkillConnect is having trouble right now. Try again in a minute.'
  return 'Request failed.'
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),
  register: (payload: RegisterPayload) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: payload }),
}

export const usersApi = {
  list: (signal?: AbortSignal) => request<User[]>('/users', { signal }),
  get: (id: number | string, signal?: AbortSignal) => request<User>(`/users/${id}`, { signal }),
}

export const postsApi = {
  list: (token?: string | null, signal?: AbortSignal) => request<Post[]>('/posts', { token, signal }),
  get: (id: number | string, signal?: AbortSignal) => request<Post>(`/posts/${id}`, { signal }),
  create: (payload: PostInput, token: string) => request<Post>('/posts', { method: 'POST', body: payload, token }),
  update: (id: number | string, payload: Partial<PostInput>, token: string) =>
    request<Post>(`/posts/${id}`, { method: 'PUT', body: payload, token }),
  remove: (id: number | string, token: string) => request<void>(`/posts/${id}`, { method: 'DELETE', token }),
}

export const messagesApi = {
  listForConversation: (conversationId: string, token: string, signal?: AbortSignal) =>
    request<Message[]>(`/messages/${conversationId}`, { token, signal }),
  send: (payload: { receiver_id: number; text: string; conversation_id: string }, token: string) =>
    request<Message>('/messages', { method: 'POST', body: payload, token }),
}

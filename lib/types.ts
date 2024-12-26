export type UserRole = 'admin' | 'children'

export interface Profile {
  id: string
  full_name: string | null
  website: string | null
  role: UserRole
  created_at: string
  updated_at: string
} 
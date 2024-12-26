'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/app/actions'
import { createClient } from '@/utils/supabase/client'
import { UserRole, Profile } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [website, setWebsite] = useState('')
  const [role, setRole] = useState<UserRole>('children')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) {
            console.error('Error fetching profile:', error)
            return
          }

          if (profile) {
            console.log('Fetched profile:', profile) // Debug log
            setFullName(profile.full_name || '')
            setWebsite(profile.website || '')
            setRole(profile.role as UserRole)
            setIsAdmin(profile.role === 'admin')
          }
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error)
      }
    }

    fetchProfile()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const result = await updateProfile({ full_name: fullName, website })
      if (result.error) {
        setMessage(result.error)
      } else {
        setMessage('Profile updated successfully!')
        router.refresh()
      }
    } catch (error) {
      setMessage('An error occurred while updating profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col w-full justify-center gap-2">
        <label className="text-md" htmlFor="fullName">
          Full Name
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border"
          name="fullName"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <label className="text-md" htmlFor="website">
          Website
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border"
          name="website"
          placeholder="Your website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />

        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <p className="text-sm font-medium">
            Role: <span className="font-bold">{role}</span>
          </p>
          {isAdmin && (
            <p className="text-xs mt-2 text-gray-600">
              As an admin, you can manage other users' profiles and roles
            </p>
          )}
        </div>

        <button
          className="bg-green-700 rounded px-4 py-2 text-white mb-2"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>

        {message && (
          <p className={`text-sm ${message.includes('error') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
} 
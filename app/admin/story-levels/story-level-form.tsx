'use client'

import { createStoryLevel } from '@/app/actions/story-levels'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function StoryLevelForm() {
  const [levelNumber, setLevelNumber] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      await createStoryLevel(parseInt(levelNumber), description)
      setLevelNumber('')
      setDescription('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="level_number" className="block text-sm font-medium mb-1">
            Level Number (1-50)
          </label>
          <Input
            id="level_number"
            type="number"
            min="1"
            max="50"
            required
            value={levelNumber}
            onChange={(e) => setLevelNumber(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <Input
            id="description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <Button type="submit">Add Level</Button>
    </form>
  )
} 
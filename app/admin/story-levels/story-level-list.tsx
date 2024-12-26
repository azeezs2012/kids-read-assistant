'use client'

import { StoryLevel, deleteStoryLevel, updateStoryLevel } from '@/app/actions/story-levels'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function StoryLevelList({ levels }: { levels: StoryLevel[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{ level_number: string; description: string }>({
    level_number: '',
    description: ''
  })

  function startEdit(level: StoryLevel) {
    setEditingId(level.id)
    setEditForm({
      level_number: level.level_number.toString(),
      description: level.description
    })
  }

  async function handleUpdate(id: number) {
    try {
      await updateStoryLevel(id, parseInt(editForm.level_number), editForm.description)
      setEditingId(null)
    } catch (error) {
      console.error('Failed to update:', error)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this level?')) return
    try {
      await deleteStoryLevel(id)
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  return (
    <div className="space-y-4">
      {levels.map((level) => (
        <div key={level.id} className="border rounded-lg p-4 flex items-center justify-between">
          {editingId === level.id ? (
            <div className="flex-1 flex gap-4">
              <Input
                type="number"
                min="1"
                max="50"
                value={editForm.level_number}
                onChange={(e) => setEditForm({ ...editForm, level_number: e.target.value })}
                className="w-24"
              />
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="flex-1"
              />
              <Button onClick={() => handleUpdate(level.id)}>Save</Button>
              <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
            </div>
          ) : (
            <>
              <div>
                <span className="font-medium">Level {level.level_number}</span>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => startEdit(level)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDelete(level.id)}>Delete</Button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
} 
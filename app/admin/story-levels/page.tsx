import { getStoryLevels } from '@/app/actions/story-levels'
import StoryLevelForm from './story-level-form'
import StoryLevelList from './story-level-list'

export default async function StoryLevelsPage() {
  const levels = await getStoryLevels()

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Manage Story Levels</h1>
      
      <div className="space-y-8">
        <section className="bg-card rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Add New Level</h2>
          <StoryLevelForm />
        </section>

        <section className="bg-card rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Existing Levels</h2>
          <StoryLevelList levels={levels} />
        </section>
      </div>
    </div>
  )
} 
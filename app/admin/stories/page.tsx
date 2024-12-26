import { getStories } from '@/app/actions/stories';
import { getStoryLevels } from '@/app/actions/story-levels';
import StoryList from './story-list';

export default async function StoriesPage() {
  const [stories, levels] = await Promise.all([
    getStories(),
    getStoryLevels()
  ]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Stories Management</h1>
      <StoryList stories={stories} levels={levels} />
    </div>
  );
} 
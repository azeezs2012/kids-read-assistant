'use client';

import { useState } from 'react';
import { Story, StoryLevel } from '@/lib/types';
import StoryForm from './story-form';
import { deleteStory } from '@/app/actions/stories';

// Add a helper function for consistent date formatting
function formatDate(dateString: string) {
  return new Date(dateString).toISOString().split('T')[0];
}

export default function StoryList({ 
  stories: initialStories,
  levels 
}: { 
  stories: Story[],
  levels: StoryLevel[]
}) {
  const [stories, setStories] = useState(initialStories);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    
    try {
      await deleteStory(id);
      setStories(stories.filter(story => story.id !== id));
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story');
    }
  };

  // Add image preview modal
  const ImagePreviewModal = ({ images, onClose }: { images: string[], onClose: () => void }) => {
    if (images.length === 0) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex justify-end mb-2">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt={`Story image ${index + 1}`} className="w-full rounded" />
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"
                >
                  Open
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <button
        onClick={() => setIsCreating(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Create New Story
      </button>

      {(isCreating || editingStory) && (
        <StoryForm
          story={editingStory}
          levels={levels}
          onClose={() => {
            setEditingStory(null);
            setIsCreating(false);
          }}
          onSave={(updatedStory: Story) => {
            if (editingStory) {
              setStories(stories.map(s => 
                s.id === updatedStory.id ? updatedStory : s
              ));
            } else {
              setStories([...stories, updatedStory]);
            }
            setEditingStory(null);
            setIsCreating(false);
          }}
        />
      )}

      {selectedImages.length > 0 && (
        <ImagePreviewModal 
          images={selectedImages} 
          onClose={() => setSelectedImages([])} 
        />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-left">ID</th>
              <th className="px-6 py-3 border-b text-left">Title</th>
              <th className="px-6 py-3 border-b text-left">Level</th>
              <th className="px-6 py-3 border-b text-left">Images</th>
              <th className="px-6 py-3 border-b text-left">Created At</th>
              <th className="px-6 py-3 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((story) => (
              <tr key={story.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">{story.id}</td>
                <td className="px-6 py-4 border-b">{story.title}</td>
                <td className="px-6 py-4 border-b">
                  Level {story.level.level_number}
                </td>
                <td className="px-6 py-4 border-b">
                  {story.images.length > 0 ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-2">
                        {story.images.slice(0, 3).map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt=""
                            className="w-8 h-8 rounded-full border-2 border-white object-cover"
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setSelectedImages(story.images)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        View all ({story.images.length})
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400">No images</span>
                  )}
                </td>
                <td className="px-6 py-4 border-b">
                  {formatDate(story.created_at)}
                </td>
                <td className="px-6 py-4 border-b">
                  <div className="space-x-2">
                    <a
                      href={`/stories/${story.id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded inline-block"
                    >
                      View
                    </a>
                    <button
                      onClick={() => setEditingStory(story)}
                      className="bg-gray-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
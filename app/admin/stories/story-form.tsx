'use client';

import { useState, useRef } from 'react';
import { Story, StoryLevel, NewStory } from '@/lib/types';
import { createStory, updateStory } from '@/app/actions/stories';
import { uploadImage, deleteImage } from '@/app/actions/images';

export default function StoryForm({
  story,
  levels,
  onClose,
  onSave,
}: {
  story: Story | null;
  levels: StoryLevel[];
  onClose: () => void;
  onSave: (story: Story) => void;
}) {
  const [formData, setFormData] = useState<NewStory>({
    title: story?.title || '',
    story_html: story?.story_html || '',
    level_id: story?.level_id || levels[0]?.id,
    images: story?.images || [],
  });
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newImages = [...formData.images];
      
      for (const file of files) {
        const publicUrl = await uploadImage(file);
        newImages.push(publicUrl);
      }

      setFormData({ ...formData, images: newImages });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (urlToRemove: string) => {
    try {
      await deleteImage(urlToRemove);
      setFormData({
        ...formData,
        images: formData.images.filter(url => url !== urlToRemove)
      });
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Failed to remove image');
    }
  };

  const ImagePreviewModal = ({ url, onClose }: { url: string, onClose: () => void }) => {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div 
          className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <a 
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              Open in new tab
            </a>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <img src={url} alt="Preview" className="max-w-full h-auto" />
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let savedStory;
      if (story) {
        savedStory = await updateStory(story.id, formData);
      } else {
        savedStory = await createStory(formData);
      }
      onSave(savedStory);
    } catch (error) {
      console.error('Error saving story:', error);
      alert('Failed to save story');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl my-8">
        <h2 className="text-xl font-bold mb-4">
          {story ? 'Edit Story' : 'Create New Story'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Story Content (HTML)</label>
            <textarea
              value={formData.story_html}
              onChange={(e) => setFormData({ ...formData, story_html: e.target.value })}
              className="w-full border rounded p-2 h-40"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Level</label>
            <select
              value={formData.level_id}
              onChange={(e) => setFormData({ ...formData, level_id: Number(e.target.value) })}
              className="w-full border rounded p-2"
              required
            >
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  Level {level.level_number} - {level.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="mb-2"
              disabled={uploading}
            />
            <div className="grid grid-cols-4 gap-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Story image ${index + 1}`}
                    className="w-full h-24 object-cover rounded cursor-pointer"
                    onClick={() => setPreviewImage(url)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 text-white p-1 rounded text-sm"
                        onClick={e => e.stopPropagation()}
                      >
                        Open
                      </a>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(url);
                        }}
                        className="bg-red-500 text-white p-1 rounded text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      {previewImage && (
        <ImagePreviewModal 
          url={previewImage} 
          onClose={() => setPreviewImage(null)} 
        />
      )}
    </div>
  );
} 
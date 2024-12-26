export type UserRole = 'admin' | 'children'

export interface Profile {
  id: string
  full_name: string | null
  website: string | null
  role: UserRole
  created_at: string
  updated_at: string
} 

export type StoryLevel = {
  id: number;
  level_number: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export type Story = {
  id: number;
  title: string;
  story_html: string;
  level_id: number;
  images: string[];
  created_at: string;
  updated_at: string;
  level?: StoryLevel;
};

export type NewStory = Omit<Story, 'id' | 'created_at' | 'updated_at'>; 
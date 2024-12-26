import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Helper function to extract first image URL from content
function getFirstImageUrl(content: string): string | null {
  try {
    const contentObj = JSON.parse(content);
    for (const block of contentObj.blocks) {
      if (block.type === 'image' && block.data?.url) {
        return block.data.url;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export default async function StoryLevelPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch the level details
  const { data: level } = await supabase
    .from('story_levels')
    .select('*')
    .eq('id', params.id)
    .single();

  // Fetch stories for this level
  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .eq('level_id', params.id)
    .order('created_at');

  if (!level) {
    return redirect("/dashboard");
  }

  return (
    <div className="flex-1 w-full px-8 py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-purple-600">
            Level {level.level_number} Stories
          </h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Back to Levels
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories?.map((story) => {
            const featuredImage = story.images.length > 0 ? story.images[0] : '/default-story-image.jpg';
            
            return (
              <div
                key={story.id}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={featuredImage}
                    alt={story.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="relative p-6">
                  <div className="absolute top-0 right-0 mt-4 mr-4">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                      Level {level.level_number}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{story.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {story.description}
                  </p>
                  <Link
                    href={`/stories/${story.id}`}
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors group-hover:bg-purple-600"
                  >
                    Read Story
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {stories?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-500 text-lg">
              No stories available for this level yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
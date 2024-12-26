import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const { data: storyLevels } = await supabase
    .from('story_levels')
    .select('*')
    .order('level_number');

  return (
    <div className="flex-1 w-full px-8 py-16">
      {profile?.role === 'admin' ? (
        // Admin links
        <div className="flex flex-col sm:max-w-md mx-auto gap-2">
          <Link
            href="/dashboard/profile"
            className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
          >
            Update Profile
          </Link>
          <Link
            href="/admin/users"
            className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
          >
            Admin Users
          </Link>
          <Link 
            href="/admin/story-levels"
            className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
          >
            Admin Story Levels
          </Link>
          <Link 
            href="/admin/stories"
            className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
          >
            Admin Stories
          </Link>
        </div>
      ) : (
        // Children view with story level bubbles
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12 text-purple-600 drop-shadow-lg">
            SELECT LEVEL
          </h1>
          <div className="grid grid-cols-5 gap-6">
            {storyLevels?.map((level, index) => (
              <div key={level.id} className="flex flex-col items-center gap-1">
                <Link
                  href={`/story-levels/${level.id}`}
                  className={`w-16 h-16 flex items-center justify-center rounded-lg text-2xl font-bold bg-purple-500 hover:bg-purple-600 text-white cursor-pointer`}
                >
                  {level.level_number}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

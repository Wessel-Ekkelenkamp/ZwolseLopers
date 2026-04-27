import { createServerSupabase } from "@/lib/supabase-server";
import { DB } from "@/lib/db";
import PostCard from "../components/cards/PostCard";
import RunCard from "../components/cards/RunCard";
import { Post } from "@/src/app/types/post";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const revalidate = 60;

export default async function TimelinePage() {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from(DB.TABLES.POSTS)
    .select(`
      *,
      images:post_images(image_url),
      run:runs(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading posts:', error);
  }

  const posts: Post[] = (data || []).map((p: any) => ({
    ...p,
    run: Array.isArray(p.run) ? p.run[0] || null : p.run || null,
  }));

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Timeline</h1>

        {posts.length === 0 ? (
          <p className="text-center text-gray-500">Nog geen posts</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id}>
                {post.type === 'run' && post.run ? (
                  <RunCard post={post} run={post.run} clickable />
                ) : (
                  <PostCard post={post} clickable />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

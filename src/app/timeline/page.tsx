import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { DB } from "@/lib/db";
import PostCard from "../components/cards/PostCard";
import { Post } from "@/src/app/types/post";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const revalidate = 60;

const PAGE_SIZE = 20;

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createServerSupabase();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from(DB.TABLES.POSTS)
    .select(`
      *,
      images:post_images(image_url),
      event:events(*)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error loading posts:', error);
  }

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const posts: Post[] = (data || []).map((p: any) => ({
    ...p,
    event: Array.isArray(p.event) ? p.event[0] || null : p.event || null,
  }));

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Alle berichten</h1>

        {posts.length === 0 ? (
          <p className="text-center text-gray-500">Nog geen posts</p>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} clickable />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Link
              href={`/timeline?page=${page - 1}`}
              aria-disabled={page <= 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                page <= 1
                  ? "pointer-events-none opacity-40 border-gray-200 text-gray-400"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Vorige
            </Link>
            <span className="text-sm text-gray-500">
              Pagina {page} van {totalPages}
            </span>
            <Link
              href={`/timeline?page=${page + 1}`}
              aria-disabled={page >= totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                page >= totalPages
                  ? "pointer-events-none opacity-40 border-gray-200 text-gray-400"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Volgende
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SignupButton from "../../components/buttons/SignupButton";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { DB } from "@/lib/db";
import ImageCarousel from "../../components/cards/ImageCarousel";
import AdminActions from "../../components/buttons/AdminActions";
import sanitizeHtml from "sanitize-html";
import CommentPanel from "../../components/cards/CommentPanel";
import LiveParticipants from "../../components/post/LiveParticipants";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: post, error }, profileResult] = await Promise.all([
    supabase
      .from(DB.TABLES.POSTS)
      .select(`
        *,
        profiles!posts_author_id_fkey(username, avatar_url),
        post_images(id, image_url),
        run:runs(
          *,
          signups:run_signups(
            user_id,
            status,
            profiles(username, avatar_url)
          )
        ),
        comments:comments(
          id,
          content,
          created_at,
          profiles(username, avatar_url)
        )
      `)
      .eq('id', id)
      .single(),
    user
      ? supabase.from(DB.TABLES.PROFILES).select('role').eq('id', user.id).single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (error || !post) return notFound();

  const isAdmin = profileResult?.data?.role === DB.ROLES.ADMIN;

  const imageUrls = post?.post_images?.map((img: any) => img.image_url) || [];

  const sanitizedContent = sanitizeHtml(post.content || "", {
  allowedTags: [
    // Headings
    "h1", "h2", "h3", "h4", "h5", "h6",
    // Text formatting
    "p", "strong", "em", "s", "code", "pre", "blockquote",
    // Lists
    "ul", "ol", "li",
    // Links & media
    "a", "img", "figure", "figcaption",
    // Structure
    "br", "hr", "div", "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "class"],
    img: ["src", "alt", "width", "height", "class"],
    "*": ["class"],
  },
  // Force all links to be safe
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
});

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto w-full p-4 md:p-8">

        {/* ADMIN ACTIONS */}
        {isAdmin && <AdminActions post={post} />}

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* LEFT COLUMN: Main Content */}
          <div className="flex-1 w-full space-y-6">

            {/* Run Stats Dashboard (Only for runs) */}
            {post.type === 'run' && post.run && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Afstand', val: `${post.run.distance} km`, color: 'blue' },
                  { label: 'Datum', val: post.run.run_date, color: 'slate' },
                  { label: 'Tijd', val: post.run.run_time?.substring(0, 5) ?? '—', color: 'slate' },
                  { label: 'Tempo', val: `${post.run.average_speed} min/km`, color: 'orange' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-lg font-black text-${stat.color}-600`}>{stat.val}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Main Post Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8">
                <header className="mb-6">
                  <h1 className="text-4xl font-black text-slate-800 mb-2 leading-tight">
                    {post.title}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="text-sm">Gepost door</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg text-sm">
                      @{post.profiles?.username}
                    </span>
                  </div>
                </header>

                <div
                  className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-8"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />

                {imageUrls.length > 0 && (
                  <div className="rounded-2xl overflow-hidden shadow-inner bg-gray-50 p-2">
                    <ImageCarousel images={imageUrls} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interaction Sidebar */}
          <aside className="w-full lg:w-80 space-y-6 sticky top-8">

            {post.type === 'run' && post.run && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-black mb-4">Deelnemers</h3>
                <LiveParticipants runId={id} initialData={post.run.signups} />
                <div className="mt-6 pt-6 border-t">
                  <SignupButton runId={id} maxParticipants={post.run.max_participants} />
                </div>
              </div>
            )}

            {/* Integrated Comment Panel */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
              <CommentPanel postId={id} />
            </div>

          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

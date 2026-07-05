import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { DB } from "@/lib/db";
import ImageCarousel from "../../components/cards/ImageCarousel";
import AdminActions from "../../components/buttons/AdminActions";
import sanitizeHtml from "sanitize-html";

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
        event:events(*)
      `)
      .eq('id', id)
      .single(),
    user
      ? supabase.from(DB.TABLES.PROFILES).select('role').eq('id', user.id).single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (error || !post) return notFound();

  const isAdmin = profileResult?.data?.role === DB.ROLES.ADMIN;
  const event = Array.isArray(post.event) ? post.event[0] ?? null : post.event ?? null;
  const imageUrls = post?.post_images?.map((img: any) => img.image_url) || [];

  const sanitizedContent = sanitizeHtml(post.content || "", {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "strong", "em", "s", "code", "pre", "blockquote",
      "ul", "ol", "li",
      "a", "img", "figure", "figcaption",
      "br", "hr", "div", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "class"],
      img: ["src", "alt", "width", "height", "class"],
      "*": ["class"],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });

  function formatEventDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto w-full p-4 md:p-8">

        {isAdmin && <AdminActions post={post} />}

        <div className="space-y-6">

          {/* Event stats */}
          {post.type === 'event' && event && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Datum', val: formatEventDate(event.event_date) },
                { label: 'Tijd', val: event.event_time?.slice(0, 5) ?? '—' },
                { label: 'Locatie', val: event.location },
                { label: 'Afstand', val: event.distance ? `${event.distance} km` : '—' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{stat.label}</p>
                  <p className="text-base font-black text-gray-800 leading-snug">{stat.val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Main post card */}
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
      </main>

      <Footer />
    </div>
  );
}

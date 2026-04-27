import { createServerSupabase } from "@/lib/supabase-server";
import { DB } from "@/lib/db";
import Header from "./components/Header";
import PostCard from "./components/cards/PostCard";
import RunCard from "./components/cards/RunCard";
import { Post } from "@/src/app/types/post";
import Link from "next/link";
import { ArrowRight, Calendar, Pin } from "lucide-react";
import Footer from "./components/Footer";
import RunCardMini from "./components/cards/RunCardMini";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createServerSupabase();
  const today = new Date().toISOString().split('T')[0];

  const [{ data: pinnedData }, { data: nextRunData }] = await Promise.all([
    supabase
      .from(DB.TABLES.POSTS)
      .select('*, images:post_images(image_url), runs(*)')
      .eq('is_pinned', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from(DB.TABLES.POSTS)
      .select('id, type, title, content, created_at, run:runs!inner(id, run_date, run_time, distance, start_location, average_speed, max_participants)')
      .eq('type', 'run')
      .filter('runs.run_date', 'gte', today)
      .order('run_date', { ascending: true, referencedTable: 'runs' })
      .limit(1)
      .maybeSingle(),
  ]);

  const pinnedPost: Post | null = pinnedData
    ? { ...pinnedData, run: pinnedData.runs?.[0] || null }
    : null;

  const nextRun: Post | null = nextRunData
    ? {
        ...nextRunData,
        run: Array.isArray(nextRunData.run) ? nextRunData.run[0] || null : nextRunData.run || null,
        images: [],
      }
    : null;

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT COLUMN: Main Content (approx 2/3) */}
          <div className="flex-1 space-y-8">

            {/* 1. Welcome / Intro Div */}
            <section
              className="rounded-xl p-8 text-white shadow-lg border-b-4 border-blue-900/20"
              style={{ backgroundColor: '#2454a3' }}
            >
              <h1 className="text-3xl md:text-4xl font-black mb-3 italic tracking-tight">
                Welkom bij ZwolseLopers
              </h1>
              <p className="text-blue-100 text-lg max-w-xl">

              </p>
              <div className="mt-6 flex gap-3">
                <Link href="/timeline" className="bg-white text-[#2454a3] px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition shadow-md">
                  Bekijk alle runs
                </Link>
              </div>
            </section>

            {/* 2. Pinned Post Section */}
            <section className="w-full max-w-4xl mx-auto overflow-hidden">
              <div className="flex items-center gap-2 mb-4 text-gray-800">
                <Pin size={20} className="text-orange-500" />
                <h2 className="text-xl font-bold">Uitgelicht bericht</h2>
              </div>

              {pinnedPost ? (
                <div className="relative group min-w-0 w-full overflow-hidden">
                  {pinnedPost.type === 'run' && pinnedPost.run ? (
                    <RunCard post={pinnedPost} run={pinnedPost.run} hideComments clickable />
                  ) : (
                    <PostCard post={pinnedPost} hideComments clickable />
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-200 text-gray-400">
                  Geen gepind bericht gevonden.
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: Sidebar Preview (approx 1/3) */}
          <aside className="lg:w-80 xl:w-96">
            <div className="sticky top-24 space-y-6">

              {/* Timeline Preview Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500" />
                    Volgende Run
                  </h3>
                  <Link href="/timeline" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Alle posts <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="p-5">
                  {nextRun && nextRun.run ? (
                    <div className="space-y-4">
                      <RunCardMini
                        run={nextRun.run}
                        title={nextRun.title}
                      />
                      <Link
                        href={`/post/${nextRun.id}`}
                        className="block w-full text-center py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition"
                      >
                        Bekijk details & meld je aan
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nog geen runs gepland!
                    </p>
                  )}
                </div>
              </div>

              {/* Basic Info / Stats Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-3">Over de Club</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  ..
                </p>
                <hr className="my-4 border-gray-50" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Leden</p>
                    <p className="font-bold text-gray-800">..</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Locatie</p>
                    <p className="font-bold text-gray-800">..</p>
                  </div>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </main>
      <Footer />
    </div>
  );
}

import { createServerSupabase } from "@/lib/supabase-server";
import { DB } from "@/lib/db";
import Footer from "./components/Footer";
import PostCard from "./components/cards/PostCard";
import { Post } from "@/src/app/types/post";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, MapPin, Ruler } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createServerSupabase();
  const today = new Date().toISOString().split('T')[0];

  const [{ data: recentData }, { data: nextEventData }] = await Promise.all([
    supabase
      .from(DB.TABLES.POSTS)
      .select(`*, images:post_images(image_url), event:events(*)`)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from(DB.TABLES.POSTS)
      .select(`id, title, event:events!inner(id, event_date, event_time, location, distance)`)
      .eq('type', 'event')
      .filter('events.event_date', 'gte', today)
      .order('event_date', { ascending: true, referencedTable: 'events' })
      .limit(1)
      .maybeSingle(),
  ]);

  const recentPosts: Post[] = (recentData || []).map((p: any) => ({
    ...p,
    event: Array.isArray(p.event) ? p.event[0] || null : p.event || null,
  }));

  const nextEvent = nextEventData
    ? {
        ...nextEventData,
        event: Array.isArray(nextEventData.event)
          ? nextEventData.event[0] || null
          : nextEventData.event || null,
      }
    : null;

  function formatEventDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  return (
    <div className="min-h-screen bg-[#f0f4fb] flex flex-col">

      {/* HERO */}
      <section className="w-full overflow-hidden" style={{ backgroundColor: '#2454a3' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-32 py-8 md:py-2 flex items-center gap-2 md:gap-4">

          {/* Left: text + trailing motion lines */}
          <div className="flex-1 min-w-0">
            <p className="text-blue-200/70 text-[10px] font-bold uppercase tracking-widest mb-1.5">Hardloopclub · Zwolle</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white tracking-tight leading-none">
              ZWOLSELOPERS
            </h1>
            <div className="mt-3 flex flex-col gap-1.5">
              <div className="h-[3px] rounded-full" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.55), transparent)', width: '88%' }} />
              <div className="h-[2px] rounded-full" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.30), transparent)', width: '68%', marginLeft: '12px' }} />
              <div className="h-[2px] rounded-full" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.15), transparent)', width: '46%', marginLeft: '24px' }} />
            </div>
          </div>

          {/* Right: runner icon — oversized, bleeds off the right edge for asymmetry */}
          <div className="flex-shrink-0 ml-[-5rem] md:ml-[-7rem] mr-[-1rem]">
            <img src="/icons/zwolseloperslighticon.svg" alt="" className="w-28 h-28 md:w-40 md:h-40 lg:w-52 lg:h-52 opacity-90" />
          </div>

        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* LEFT: Post cards — stacked flush */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Laatste berichten</h2>

            {recentPosts.length === 0 ? (
              <p className="text-gray-400 text-sm">Nog geen berichten geplaatst.</p>
            ) : (
              <div className="space-y-0">
                {recentPosts.map((post) => (
                  <PostCard key={post.id} post={post} clickable />
                ))}
              </div>
            )}

            {recentPosts.length > 0 && (
              <div className="mt-4">
                <Link
                  href="/timeline"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#2454a3] hover:text-[#1d4490] transition"
                >
                  Bekijk alle posts <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <aside className="lg:w-80 xl:w-88 flex-shrink-0">
            <div className="sticky top-24 space-y-6">

              {/* Volgend Event card */}
              {nextEvent && nextEvent.event && (
                <div>
                  <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Volgend Event</h2>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 text-center">
                      <span className="font-bold text-gray-900 text-sm">{nextEvent.title}</span>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar size={15} className="text-orange-400 flex-shrink-0" />
                        <span>{formatEventDate(nextEvent.event.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock size={15} className="text-orange-400 flex-shrink-0" />
                        <span>{nextEvent.event.event_time?.slice(0, 5)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin size={15} className="text-orange-400 flex-shrink-0" />
                        <span>{nextEvent.event.location}</span>
                      </div>
                      {nextEvent.event.distance && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Ruler size={15} className="text-orange-400 flex-shrink-0" />
                          <span>{nextEvent.event.distance} km</span>
                        </div>
                      )}
                      <div className="pt-2">
                        <Link
                          href={`/post/${nextEvent.id}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#2454a3] text-white rounded-xl font-bold text-sm hover:bg-[#1d4490] transition"
                        >
                          Bekijk details <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Over de club */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Over de club</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="w-full aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    <Image
                      src="/images/zwolselopersfrontpage.jpg"
                      alt="ZwolseLopers groepsfoto"
                      fill
                      sizes="(max-width: 1024px) 100vw, 320px"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-black text-gray-900 text-lg italic mb-3">Welkom bij de Zwolselopers!</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Hou je van hardlopen én gezelligheid? Dan ben je bij de Zwolselopers aan het juiste adres.
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed mt-3">
                      Wij organiseren ieder weekend een gezamenlijke duurloop: de ene week op zaterdag, de andere week op zondag. Want een lange duurloop is niet alleen goed voor je conditie, maar wordt nóg leuker als je hem samen loopt.
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed mt-3">
                      Om ervoor te zorgen dat iedereen prettig kan meelopen, lopen we momenteel in twee groepen:
                    </p>
                    <ul className="list-disc pl-6">
                      <li className="text-sm text-gray-600 leading-relaxed mt-3">
                       Groep A: richttempo 5:00 - 5:30 min/km
                      </li>
                      <li className="text-sm text-gray-600 leading-relaxed mt-3">
                        Groep B: richttempo 5:30 - 6:00 min/km
                      </li>
                    </ul>
                    <p className="text-sm text-gray-600 leading-relaxed mt-3">
                      Naast onze wekelijkse duurlopen organiseren we regelmatig gezellige evenementen. Het absolute hoogtepunt is Rondje Zwolle de Marathon: een unieke marathon rondom onze prachtige stad, georganiseerd voor en door hardlopers.
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed mt-3">
                      Of je nu traint voor je eerste 10 kilometer, een halve marathon of een hele marathon, of gewoon graag samen loopt: bij de Zwolselopers is iedereen welkom. Trek je hardloopschoenen aan en loop een keer met ons mee!
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed mt-3">
                      Benieuwd naar de volgende activiteit? Volg ons op{' '}
                      <a
                        href="https://www.instagram.com/zwolselopers/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#2454a3] hover:text-[#1d4490] underline"
                      >
                        Instagram
                      </a>{' '}
                      of{' '}
                      <a
                        href="https://www.strava.com/clubs/1344253"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#2454a3] hover:text-[#1d4490] underline"
                      >
                        Strava
                      </a>{' '}
                      of join de{' '}
                      <a
                        href="https://chat.whatsapp.com/EtW74mWb5MTIBTbE7s1fxV"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#2454a3] hover:text-[#1d4490] underline"
                      >
                        WhatsApp groep
                      </a>
                      .
                    </p>
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

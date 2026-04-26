"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RunCardMini from "../components/cards/RunCardMini";
import Header from "../components/Header";
import { LogOut, Calendar } from "lucide-react";
import { useUser } from "../hooks/useUser";

export default function UserPage() {
  const router = useRouter();
  const { user, isAdmin, username, avatar_url, loading: authLoading } = useUser();
  const [upcomingRuns, setUpcomingRuns] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchUpcomingRuns(user.id);
  }, [user]);

  const fetchUpcomingRuns = async (userId: string) => {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("run_signups")
      .select(`
        *,
        run:run_id (
          *,
          post:posts ( title )
        )
      `)
      .eq("user_id", userId)
      .eq("status", "confirmed");

    if (error) { console.error("Supabase error:", error); return; }

    const sorted = (data || [])
      .filter(s => s.run && s.run.run_date >= today)
      .sort((a, b) => a.run.run_date.localeCompare(b.run.run_date));

    setUpcomingRuns(sorted);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/");
      router.refresh();
    }
  };

  if (authLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen flex justify-center p-6 bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl space-y-6">

          {/* PROFILE PIC */}
          <div className="flex justify-center">
            {avatar_url ? (
              <img src={avatar_url} className="w-32 h-32 rounded-full object-cover" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>

          {/* STATS */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">{username}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>

          {/* UPCOMING RUNS */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600" />
              Jouw volgende runs
            </h2>

            {upcomingRuns.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 italic">Nog geen runs op de planning...</p>
                <Link href="/" className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block">
                  Bekijk beschikbare runs →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {upcomingRuns.map((signup) => (
                  <RunCardMini
                    key={signup.run.id}
                    run={signup.run}
                    title={signup.run.post?.title || "Gezamenlijke Run"}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            Uitloggen
          </button>

          {/* EDIT BUTTON */}
          <div className="flex justify-center pt-4">
            <Link href="/user/edit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              Edit Profile
            </Link>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              className="mt-3 inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

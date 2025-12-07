"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RunCard from "../components/cards/RunCard";
import Header from "../components/Header";


export default function UserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [upcomingRuns, setUpcomingRuns] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, avatar_url, role")
        .eq("id", user.id)
        .single();

        if (profileData) {
    setIsAdmin(profileData.role === "admin");
  }

      setCurrentUser(user);
      setProfile(profileData);
      fetchUpcomingRuns(user.id);
      setLoading(false);
    };
    loadUser();
  }, []);

  const fetchUpcomingRuns = async (userId: string) => {
    const { data } = await supabase
      .from("run_signups")
      .select("*, run:run_id(*)")
      .eq("user_id", userId)
      .order("run.run_date", { ascending: true });

    const today = new Date();
    const filtered = (data || []).filter(
      s => new Date(s.run.run_date) >= today
    );

    setUpcomingRuns(filtered);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
    <Header />
    <div className="min-h-screen flex justify-center p-6 bg-gray-50">
      
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl space-y-6">
        
        {/* PROFILE PIC */}
        <div className="flex justify-center">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
        </div>

        {/* STATS */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{profile?.username}</h1>
          <p className="text-gray-600">{currentUser.email}</p>
        </div>

        {/* UPCOMING RUNS */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Upcoming Runs</h2>
          {upcomingRuns.length === 0 ? (
            <p>No upcoming runs</p>
          ) : (
            <div className="space-y-3">
              {upcomingRuns.map(signup => (
                <RunCard key={signup.run.id} {...signup.run} />
              ))}
            </div>
          )}
        </div>

        {/* EDIT BUTTON */}
        <div className="flex justify-center pt-4">
          <Link
            href="/user/edit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
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

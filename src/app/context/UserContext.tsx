"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

type UserContextValue = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  username: string;
  avatar_url: string | null;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  isAdmin: false,
  loading: true,
  username: "Gebruiker",
  avatar_url: null,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username: string; avatar_url: string | null; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url, role")
        .eq("id", userId)
        .single();
      if (!error && data) setProfile(data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (currentUser) fetchProfile(currentUser.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      isAdmin: profile?.role === "admin",
      loading,
      username: profile?.username || user?.user_metadata?.username || "Gebruiker",
      avatar_url: profile?.avatar_url || null,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

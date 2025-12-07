"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Facebook, Instagram, LogIn, LogOut, User } from "lucide-react";
import { FaStrava } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const Header: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        setCurrentUser({ id: user.id, username: profile?.username || "" });
      }
    };

    fetchUser();

    // Listen to auth changes to update header
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser();
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    router.push("/");
  };

  const goToUserPage = () => {
    router.push("/user");
  };

  return (
    <header
      className="w-full h-16 md:h-20 flex items-center justify-between px-3 md:px-6 relative"
      style={{ backgroundColor: "#2454a3" }}
    >
      {/* Left: Sign In / User Info */}
      <div className="flex items-center gap-2 z-10">
        {currentUser ? (
          <div className="flex items-center gap-2">
            <button
              onClick={goToUserPage}
              className="flex items-center gap-2 text-white hover:underline"
            >
              <User size={18} />
              <span className="text-sm font-medium">{currentUser.username}</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <LogIn size={16} />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        )}
      </div>

      {/* Center: Logo */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Link href="/">
          <Image
            src="/images/zwolseloperslight.svg"
            alt="Zwolselopers Logo"
            width={100}
            height={40}
            className="w-20 h-auto sm:w-24 md:w-28"
            priority
          />
        </Link>
      </div>

      {/* Right: Social icons + Menu */}
      <div className="flex items-center gap-2 md:gap-4 z-10">
        <Link href="https://www.strava.com/clubs/1344253" target="_blank">
          <FaStrava
            size={20}
            className="text-orange-500 hover:opacity-80 sm:w-5 sm:h-5 md:w-6 md:h-6"
          />
        </Link>

        <Link href="https://www.instagram.com/zwolselopers/" target="_blank">
          <Instagram
            size={20}
            className="text-pink-500 hover:opacity-80 sm:w-5 sm:h-5 md:w-6 md:h-6"
          />
        </Link>

        <Link href="/facebook" target="_blank">
          <Facebook
            size={20}
            className="text-cyan-500 hover:opacity-80 sm:w-5 sm:h-5 md:w-6 md:h-6"
          />
        </Link>

        <button
          aria-label="Menu"
          className="p-1.5 md:p-2 rounded hover:bg-white/20 transition-colors"
        >
          <Menu size={24} className="text-white w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, LogIn, User, ShieldCheck } from "lucide-react"; 
import { useUser } from "../hooks/useUser";


const Header: React.FC = () => {
  const { user, isAdmin, username, avatar_url, loading } = useUser();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header
      className="w-full h-16 md:h-20 flex items-center justify-between px-3 md:px-6 relative"
      style={{ backgroundColor: "#2454a3" }}
    >
      {/* Left: Sign In / User Info */}
      <div className="flex items-center gap-2 z-10">
        {!loading && (
          user ? (
            <div className="flex items-center gap-2">
              <Link
  href="/user"
  className="flex items-center gap-2 text-white hover:bg-white/10 p-1 pr-3 rounded-full transition-colors"
>
  <div className="w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 flex items-center justify-center">
    {avatar_url ? (
      <img 
        src={avatar_url} 
        alt={username} 
        className="w-full h-full object-cover" 
      />
    ) : (
      <User size={18} />
    )}
  </div>
  <div className="flex flex-col">
    <span className="text-sm font-bold leading-none">{username}</span>
    {isAdmin && <span className="text-[9px] text-orange-400 font-black uppercase">Admin</span>}
  </div>
</Link>

              {/* Added a shortcut to Admin Panel if user is admin */}
              {isAdmin && (
                <Link href="/admin" className="p-1.5 text-orange-400 hover:text-orange-300">
                  <ShieldCheck size={20} />
                </Link>
              )}       
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )
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

      {/* Right: Menu */}
      <div className="flex items-center gap-2 md:gap-4 z-20 relative">
  <button
    onClick={() => setMenuOpen(!menuOpen)}
    aria-label="Menu"
    className={`p-1.5 md:p-2 rounded-xl transition-colors ${menuOpen ? 'bg-white text-[#2454a3]' : 'hover:bg-white/20 text-white'}`}
  >
    <Menu size={24} />
  </button>

  {/* Dropdown Menu */}
  {menuOpen && (
    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-blue-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
      <Link href="/" className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 transition-colors">Home</Link>
      <Link href="/timeline" className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 transition-colors">Tijdlijn</Link>
<Link href="/privacy" className="block px-4 py-3 text-[10px] uppercase tracking-widest text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors border-t border-gray-50 mt-1">Privacy & Cookies</Link>
    </div>
  )}
</div>
    </header>
  );
};

export default Header;
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, ShieldCheck } from "lucide-react";
import { useUser } from "../hooks/useUser";

const Header: React.FC = () => {
  const { isAdmin } = useUser();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header
      className="w-full h-16 md:h-20 flex items-center justify-between px-3 md:px-6 relative"
      style={{ backgroundColor: "#2454a3" }}
    >
      {/* Left: empty placeholder for layout balance */}
      <div className="w-10" />

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

      {/* Right: Admin shortcut (only when logged in as admin) + hamburger menu */}
      <div className="flex items-center gap-2 md:gap-3 z-20 relative">
        {isAdmin && (
          <Link
            href="/admin"
            className="p-1.5 text-orange-400 hover:text-orange-300 transition-colors"
            aria-label="Admin panel"
          >
            <ShieldCheck size={22} />
          </Link>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          className={`p-1.5 md:p-2 rounded-xl transition-colors ${menuOpen ? 'bg-white text-[#2454a3]' : 'hover:bg-white/20 text-white'}`}
        >
          <Menu size={24} />
        </button>

        {menuOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-blue-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
            <Link href="/" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 transition-colors">Home</Link>
            <Link href="/timeline" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 transition-colors">Alle berichten</Link>
            <Link href="/privacy" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-[10px] uppercase tracking-widest text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors border-t border-gray-50 mt-1">Privacy & Cookies</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

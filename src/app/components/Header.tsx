import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Facebook, Instagram } from "lucide-react";
import { FaStrava } from "react-icons/fa";

const Header: React.FC = () => {
  return (
    <header
      className="w-full h-30 flex items-center justify-between px-6 bg-cover bg-center"
      style={{
        backgroundImage: `url('/images/jenny-hill-mQVWb7kUoOE-unsplash.jpg')`,
      }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <Image
          src="/zwolselopers.png"
          alt="Zwolselopers Logo"
          width={120}
          height={50}
          priority
        />
      </div>

      {/* Right: Menu + Social icons */}
      <div className="flex items-center gap-4">
        {/* Strava */}
        <Link href="/strava">
          <FaStrava size={24} className="text-orange-500 hover:opacity-80" />
        </Link>

        {/* Instagram */}
        <Link href="/instagram">
          <Instagram size={24} className="text-pink-500 hover:opacity-80" />
        </Link>

        {/* Facebook */}
        <Link href="/facebook">
          <Facebook size={24} className="text-blue-500 hover:opacity-80" />
        </Link>

        {/* Menu Button */}
        <button
          aria-label="Menu"
          className="p-2 rounded hover:bg-white/20 transition-colors"
        >
          <Menu size={28} className="text-white" />
        </button>
      </div>
    </header>
  );
};

export default Header;

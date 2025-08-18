import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Facebook, Instagram } from "lucide-react";
import { FaStrava } from "react-icons/fa";

const Header: React.FC = () => {
  return (
    <header
  className="w-full h-20 flex items-center justify-between px-6 bg-cover bg-center"
  style={{ backgroundColor: "#2454a3" }}
>
  {/* Left: Logo */}
  <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
  <Link href={"/"}>
    <Image
      src="/images/zwolseloperslight.svg"
      alt="Zwolselopers Logo"
      width={120}
      height={50}
      priority
    />
    </Link>
  </div>

  {/* Right: Menu + Social icons */}
  <div className="flex items-center gap-4 ml-auto">
    <Link href="https://www.strava.com/clubs/1344253">
      <FaStrava size={24} className="text-orange-500 hover:opacity-80" />
    </Link>

    <Link href="https://www.instagram.com/zwolselopers/">
      <Instagram size={24} className="text-pink-500 hover:opacity-80" />
    </Link>

    <Link href="/facebook">
      <Facebook size={24} className="text-cyan-500 hover:opacity-80" />
    </Link>

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

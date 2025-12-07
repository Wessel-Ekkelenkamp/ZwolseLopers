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

  {/* Left: Sign In / User Info */}
      <div className="flex items-center gap-2 z-10">
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

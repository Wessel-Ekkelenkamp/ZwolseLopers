import Image from 'next/image';
import Link from 'next/link';
import { SiInstagram, SiTiktok, SiStrava } from '@icons-pack/react-simple-icons';

const Footer = () => {
  return (
    <footer className="w-full py-12 bg-white border-t border-blue-50 mt-12">
      <div className="max-w-7xl mx-auto px-4">
      <div className="relative flex items-center justify-center mb-8">
        <div className="w-full border-t border-gray-300"></div>
        <div className="absolute px-4 bg-white">
          <Image 
            src="\images\zwolselopers.svg" 
            alt="Logo" 
            width={80} 
            height={80} 
            className="h-10 w-auto"
          />
        </div>
      </div>
      </div>

      <div className="flex justify-center space-x-6">
        <Link href="https://www.instagram.com/zwolselopers/" className="text-gray-600 hover:text-pink-600 transition-colors">
          <span className="sr-only">Instagram</span>
          <SiInstagram size={24} />
        </Link>
        <Link href="https://www.strava.com/clubs/1344253" className="text-gray-600 hover:text-orange-600 transition-colors">
          <span className="sr-only">Strava</span>
          <SiStrava size={24} />
        </Link>
        <Link href="https://www.tiktok.com/@zwolselopers" className="text-gray-600 hover:text-black transition-colors">
          <span className="sr-only">TikTok</span>
          <SiTiktok size={24} />
        </Link>
      </div>

      <div className="mt-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} ZwolseLopers. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
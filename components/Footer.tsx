import Link from 'next/link';
import Image from 'next/image';
import { FaInstagram, FaFacebook, FaTiktok, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200/60">
      <div className="container mx-auto px-6 md:px-12 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Brand */}
          <Link 
            href="/" 
            className="hover:opacity-80 transition-opacity duration-300 select-none"
            aria-label="Orama Creativ Home"
          >
            <Image
              src="/Logo name.png"
              alt="Orama Creativ Logo"
              width={120}
              height={40}
              className="h-auto"
              priority
            />
          </Link>

          {/* Social Links */}
          <div className="flex gap-4" role="list" aria-label="Social media links">
            {[
              { 
                name: 'Instagram', 
                href: 'https://www.instagram.com/oramacreativ/',
                icon: <FaInstagram className="w-4 h-4" />
              },
              { 
                name: 'Facebook', 
                href: 'https://www.facebook.com/oramacreativ/',
                icon: <FaFacebook className="w-4 h-4" />
              },
              { 
                name: 'TikTok', 
                href: 'https://www.tiktok.com/@oramacreativ',
                icon: <FaTiktok className="w-4 h-4" />
              },
              { 
                name: 'Email', 
                href: 'mailto:hello@orama.com',
                icon: <FaEnvelope className="w-4 h-4" />
              },
            ].map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="text-zinc-400 hover:text-rose-600 transition-colors duration-300 p-1"
                aria-label={`Visit our ${social.name}`}
                role="listitem"
              >
                {social.icon}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-xs text-zinc-400 font-medium">
            © {new Date().getFullYear()} Orama Creativ
          </div>
          
        </div>
      </div>
    </footer>
  );
}
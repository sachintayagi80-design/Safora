import { Radio, Twitter, Instagram, Facebook, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <Radio className="h-5 w-5 text-redbrand" /> SAFORA
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500">PRODUCT</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-400">
              <a href="#how" className="transition-colors hover:text-white">How it works</a>
              <a href="#map" className="transition-colors hover:text-white">Live map</a>
              <Link to="/sos" className="transition-colors hover:text-redbrand">SOS feature</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500">PROJECT</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-400">
              <a href="#top" className="transition-colors hover:text-white">About SAFORA</a>
              <a href="#top" className="transition-colors hover:text-white">ISMLDS-2026</a>
              <a href="#top" className="transition-colors hover:text-white">Architecture</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500">ACCOUNT</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-400">
              <Link to="/login" className="transition-colors hover:text-white">Sign in</Link>
              <Link to="/login?mode=signup" className="transition-colors hover:text-white">Create account</Link>
              <Link to="/sos" className="transition-colors hover:text-redbrand">Emergency SOS</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500">SUPPORT</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-400">
              <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
              <a href="#top" className="transition-colors hover:text-white">Guide: K. Jaiswal</a>
              <a href="#top" className="transition-colors hover:text-white">BIT, Gorakhpur</a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-8">
          <div className="text-xs leading-relaxed text-gray-500">
            
            <p className="mt-1">© SAFORA 2026 — Concept project, not an active service.</p>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <a href="#top" className="transition-colors hover:text-white"><Twitter className="h-4 w-4" /></a>
            <a href="#top" className="transition-colors hover:text-white"><Instagram className="h-4 w-4" /></a>
            <a href="#top" className="transition-colors hover:text-white"><Facebook className="h-4 w-4" /></a>
            <a href="#top" className="transition-colors hover:text-white"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

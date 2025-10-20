'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Yes, You Deserve!"
              width={50}
              height={50}
              className="rounded-full"
            />
            <span className="font-montserrat text-xl font-bold hidden sm:block" style={{ color: '#222222' }}>
              Yes, You Deserve!
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/#tours"
              className="text-black hover:text-gray-700 transition font-medium"
            >
              Tours
            </Link>
            <Link
              href="/#about"
              className="text-black hover:text-gray-700 transition font-medium"
            >
              About
            </Link>
            <Link
              href="/#contact"
              className="text-black hover:text-gray-700 transition font-medium"
            >
              Contact
            </Link>
            <a
              href="http://wa.link/y0m3y9"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-yyd-whatsapp"
            >
              💬 Talk With A Human
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-black"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <Link
                href="/#tours"
                onClick={() => setIsMenuOpen(false)}
                className="text-black hover:text-gray-700 transition font-medium py-2"
              >
                Tours
              </Link>
              <Link
                href="/#about"
                onClick={() => setIsMenuOpen(false)}
                className="text-black hover:text-gray-700 transition font-medium py-2"
              >
                About
              </Link>
              <Link
                href="/#contact"
                onClick={() => setIsMenuOpen(false)}
                className="text-black hover:text-gray-700 transition font-medium py-2"
              >
                Contact
              </Link>
              <a
                href="http://wa.link/y0m3y9"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-yyd-whatsapp inline-block text-center"
              >
                💬 Talk With A Human
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

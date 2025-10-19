import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
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
            <span className="text-2xl font-bold text-brand-black">
              Yes, You Deserve!
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/#tours"
              className="text-brand-black hover:text-brand-turquoise transition"
            >
              Tours
            </Link>
            <Link
              href="/#about"
              className="text-brand-black hover:text-brand-turquoise transition"
            >
              About
            </Link>
            <Link
              href="/#contact"
              className="text-brand-black hover:text-brand-turquoise transition"
            >
              Contact
            </Link>
            <a
              href="http://wa.link/y0m3y9"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
            >
              Book Now
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}

import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header / Navigation */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-brand-black">Yes, You Deserve!</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#tours" className="text-brand-black hover:text-brand-turquoise transition">Tours</Link>
              <Link href="#about" className="text-brand-black hover:text-brand-turquoise transition">About</Link>
              <Link href="#contact" className="text-brand-black hover:text-brand-turquoise transition">Contact</Link>
            </nav>
            <Link 
              href="#contact" 
              className="bg-brand-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
            >
              Book Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-brand-black mb-6">
              Private Tuk Tuk Tours in<br />
              <span className="text-brand-turquoise">Sintra & Cascais</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              See the best of Sintra and Cascais with a local guide on a comfortable tuk tuk.
            </p>
            <p className="text-lg text-gray-500 mb-8">
              Personalized tours, no crowds, and the freedom to explore your way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="#tours" 
                className="bg-brand-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition"
              >
                Explore Our Tours
              </Link>
              <Link 
                href="#contact" 
                className="border-2 border-brand-black text-brand-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition"
              >
                Talk to Our Team
              </Link>
            </div>
            
            {/* Trust Badge */}
            <div className="mt-12 flex items-center justify-center gap-2">
              <div className="flex text-brand-gold">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-700 font-semibold">257 reviews</span>
            </div>
            
            <div className="mt-4 text-gray-600">
              <span className="font-semibold">As seen on:</span> ABC Good Morning America
            </div>
          </div>
        </div>
      </section>

      {/* No Crowds Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-brand-black mb-4">
              No Crowds. No Stress. Just You and Sintra.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Say goodbye to crowded buses and rigid schedules. Our private tuk tuk tours offer the freedom to explore Sintra & Cascais on your terms.
            </p>
          </div>
        </div>
      </section>

      {/* How We Simplify Your Experience */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-brand-black text-center mb-12">
            How We Simplify Your Experience
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-brand-black mb-2">Personalized Itineraries</h3>
              <p className="text-gray-600">
                Choose what you want to see. We'll design a tour around your interests and timing — no rigid plans, no rush.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-bold text-brand-black mb-2">Local Expert Guides</h3>
              <p className="text-gray-600">
                Our friendly, English-speaking guides know Sintra like no one else. Expect history, stories, and the best local tips.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">🚗</div>
              <h3 className="text-xl font-bold text-brand-black mb-2">Spacious & Comfortable Tuk Tuks</h3>
              <p className="text-gray-600">
                Travel with ease in our premium electric tuk tuks — perfect for exploring narrow streets while staying relaxed.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-brand-black mb-2">Easy Booking & Support</h3>
              <p className="text-gray-600">
                From the first message to the final goodbye, we're here to help. Booking is quick, and we answer fast.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-brand-turquoise mb-2">600+</div>
              <div className="text-gray-600">happy clients</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-brand-turquoise mb-2">10+</div>
              <div className="text-gray-600">years of expertise</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-brand-turquoise mb-2">2</div>
              <div className="text-gray-600">professional team members</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-brand-turquoise mb-2">257+</div>
              <div className="text-gray-600">5-star reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Options */}
      <section id="tours" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-brand-black text-center mb-4">
            Choose Your Perfect Tuk Tuk Tour
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Whether you want to explore majestic palaces or ride along dramatic coastal roads, our tuk tuk tours offer the perfect match.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Half-Day Tour */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-brand-black mb-2">Personalized Half-Day Tour</h3>
                <div className="text-gray-600 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span>⏱️</span>
                    <span>4 hours</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span>👥</span>
                    <span>1 - 36 People</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span className="font-semibold text-brand-black">Starting at €340</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  Short on time but want the full Sintra experience? In just 4 hours, explore iconic spots and hidden gems.
                </p>
                <Link 
                  href="/tours/personalized-half-day-tour" 
                  className="block w-full bg-brand-black text-white text-center px-6 py-3 rounded hover:bg-gray-800 transition"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Full-Day Tour - BEST CHOICE */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition border-2 border-brand-turquoise relative">
              <div className="absolute top-4 right-4 bg-brand-turquoise text-white px-3 py-1 rounded text-sm font-bold">
                BEST CHOICE
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-brand-black mb-2">Personalized Full-Day Tour</h3>
                <div className="text-gray-600 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span>⏱️</span>
                    <span>7-8 hours</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span>👥</span>
                    <span>1 - 36 People</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span className="font-semibold text-brand-black">Starting at €440</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  Discover the magic of Sintra with iconic landmarks, hidden gems, and authentic local flavors — all at your pace.
                </p>
                <Link 
                  href="/tours/personalized-full-day-tour" 
                  className="block w-full bg-brand-turquoise text-white text-center px-6 py-3 rounded hover:bg-teal-600 transition"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* All-Inclusive Experience */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-brand-black mb-2">All-Inclusive Experience</h3>
                <div className="text-gray-600 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span>⏱️</span>
                    <span>7-8 hours</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span>👥</span>
                    <span>1 - 36 People</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span className="font-semibold text-brand-black">Starting at €580</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  Everything arranged for you — transfers, lunch, monument tickets, wine tasting, and professional photos.
                </p>
                <Link 
                  href="/tours/all-inclusive-experience" 
                  className="block w-full bg-brand-gold text-brand-black text-center px-6 py-3 rounded hover:bg-yellow-500 transition font-semibold"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-brand-black text-center mb-4">
            Ready to Plan Your Unforgettable Trip?
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Let's make your dream tour a reality. Whether you have questions or are ready to book, we're here to help you every step of the way.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <a 
              href="http://wa.link/y0m3y9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-500 text-white p-8 rounded-lg text-center hover:bg-green-600 transition shadow-md"
            >
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
              <p className="text-sm mb-4">Fastest way to reach us</p>
              <span className="inline-block bg-white text-green-500 px-4 py-2 rounded font-semibold text-sm">
                Recommended
              </span>
            </a>

            <a 
              href="https://www.m.me/1566043420168290" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-500 text-white p-8 rounded-lg text-center hover:bg-blue-600 transition shadow-md"
            >
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">Messenger</h3>
              <p className="text-sm mb-4">Prefer Facebook?</p>
              <span className="inline-block bg-white text-blue-500 px-4 py-2 rounded font-semibold text-sm">
                Recommended
              </span>
            </a>

            <a 
              href="mailto:info@yesyoudeserve.tours"
              className="bg-gray-600 text-white p-8 rounded-lg text-center hover:bg-gray-700 transition shadow-md"
            >
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-sm mb-4">For detailed inquiries</p>
              <span className="inline-block bg-white text-gray-600 px-4 py-2 rounded font-semibold text-sm">
                Last option
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Yes, You Deserve!</h3>
              <p className="text-gray-400">
                Premium private tuk tuk tours in Sintra & Cascais, Portugal.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#tours" className="hover:text-white transition">Tours</Link></li>
                <li><Link href="#about" className="hover:text-white transition">About</Link></li>
                <li><Link href="#contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>WhatsApp: <a href="http://wa.link/y0m3y9" className="hover:text-white transition" target="_blank">Message Us</a></li>
                <li>Email: <a href="mailto:info@yesyoudeserve.tours" className="hover:text-white transition">info@yesyoudeserve.tours</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Yes, You Deserve! All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo.png"
                alt="Yes, You Deserve!"
                width={40}
                height={40}
                className="rounded-full"
              />
              <h3 className="text-xl font-bold font-montserrat">Yes, You Deserve!</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Premium private tuk tuk tours in Sintra & Cascais, Portugal.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#tours" className="text-gray-400 hover:text-white transition">
                  Our Tours
                </a>
              </li>
              <li>
                <a href="/#about" className="text-gray-400 hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="/#contact" className="text-gray-400 hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="https://wa.me/14155238886"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://www.m.me/1566043420168290"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Messenger
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@yesyoudeserve.tours"
                  className="hover:text-white transition"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="https://www.facebook.com/yesyoudeserve"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/yesyoudeserve"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.tripadvisor.com/Attraction_Review-g189158-d13339331"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  TripAdvisor
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Yes, You Deserve! All rights reserved.</p>
          <p className="mt-2">
            <a href="/privacy-policy" className="hover:text-white transition">
              Privacy Policy
            </a>
            {' | '}
            <a href="/terms" className="hover:text-white transition">
              Terms & Conditions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

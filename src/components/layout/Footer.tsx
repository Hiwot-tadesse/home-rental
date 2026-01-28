// src/components/layout/Footer.tsx
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Us */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Contact Us</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>myhome@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>09-00000000</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Addis Ababa, Ethiopia</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/browse" className="block text-gray-300 hover:text-white transition-colors">
                Browse Properties
              </Link>
              <Link to="/favorites" className="block text-gray-300 hover:text-white transition-colors">
                Favorites
              </Link>
              <Link to="/auth" className="block text-gray-300 hover:text-white transition-colors">
                Sign In / Sign Up
              </Link>
            </div>
          </div>

          {/* Follow Us */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Follow Us</h3>
            <div className="flex items-center gap-4">
              {/* Telegram */}
              <a 
                href="https://t.me/myhome" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                aria-label="Telegram"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm-2 8.5c-.55 0-1 .45-1 1s.45 1 1 1 1 .45 1 1v3.5c0 .55-.45 1-1 1s-1-.45-1-1v-2c0-.55-.45-1-1-1s-1-.45-1-1 .45-1 1-1 1-.45 1-1v-2c0-.55-.45-1-1-1zm2 0c-.55 0-1 .45-1 1s.45 1 1 1 1 .45 1 1v3.5c0 .55-.45 1-1 1s-1-.45-1-1v-2c0-.55-.45-1-1-1s-1-.45-1-1 .45-1 1-1 1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z"/>
                </svg>
              </a>
              
              {/* X (Twitter) */}
              <a 
                href="https://twitter.com/myhome" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                aria-label="X (Twitter)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.505 11.24H16.17l-5.214-6.817L4.989 21.746H1.68l7.73-8.835L1.254 2.25H4.57l6.485 7.732 7.193-8.26z"/>
                </svg>
              </a>
              
              {/* Facebook */}
              <a 
                href="https://facebook.com/myhome" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                aria-label="Facebook"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.523-4.477-10-10-10s-10 4.477-10 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.583-1.63 1.195v1.988h2.773l-.443 2.09h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              
              {/* Instagram */}
              <a 
                href="https://instagram.com/myhome" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                aria-label="Instagram"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584 0 4.85 0 3.252 0 4.771 1.519 4.917 4.655 0 1.405 0 1.665 0 4.917 0 3.252-1.519 4.771-4.655 4.917-1.405 0-1.665 0-4.917 0-3.252 0-4.771-1.519-4.917-4.655 0-1.405 0-1.665 0-4.917 0-3.252 1.519-4.771 4.655-4.917 1.405 0 1.665 0 4.917 0zm0-2.163c-3.259 0-3.667 0-4.947 0-4.058 0-5.09 1.042-5.09 5.09 0 1.28 0 1.688 0 4.947 0 3.259 0 3.668 0 4.947 0 4.058 1.042 5.09 5.09 5.09 1.28 0 1.689 0 4.948 0 3.259 0 3.667 0 4.947 0 4.058 0 5.09-1.042 5.09-5.09 0-1.28 0-1.689 0-4.948 0-3.259 0-3.667 0-4.947 0-4.058-1.042-5.09-5.09-5.09zm0 1.792c-2.331 0-4.098 1.768-4.098 4.098 0 2.33 1.767 4.098 4.098 4.098 2.33 0 4.098-1.768 4.098-4.098 0-2.33-1.768-4.098-4.098-4.098zm0 6.406c-1.34 0-2.308-1.095-2.308-2.308 0-1.34 1.095-2.308 2.308-2.308 1.34 0 2.309 1.095 2.309 2.308 0 1.213-1.096 2.308-2.309 2.308zM19.438 12c0-1.34 0-2.308-1.095-2.308-1.34 0-2.308 1.095-2.308 2.308 0 1.34 1.095 2.308 2.308 2.308 1.095 0 1.095-.968 1.095-2.308z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} myHome. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
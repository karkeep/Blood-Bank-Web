import { Link } from 'wouter';
import { Heart, Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { JiwandanLogo } from '@/components/ui/jiwandan-logo';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/">
              <a className="flex items-center">
                <JiwandanLogo size="md" withText={true} />
              </a>
            </Link>
            <p className="mt-3 text-sm text-gray-600">
              Connecting blood donors with those in need during emergencies.
              Our platform helps save lives through rapid response and coordination.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-red-600">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-red-600">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-red-600">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-red-600">
                {/* Use code icon instead of GitHub since GitHub icon is not available */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M12 2a10 10 0 0 0-3.16 19.5c.5.08.66-.23.66-.5v-1.69c-2.5.46-3.13-.5-3.3-.94-.11-.26-.59-1.08-1.01-1.3-.34-.18-.83-.63-.01-.64.77-.01 1.32.7 1.5.99.88 1.53 2.27 1.1 2.83.84.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.23 1.65-.34 2.5-.34.85 0 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.69 0 3.84-2.34 4.69-4.57 4.94.36.31.67.91.67 1.85v2.76c0 .26.16.58.67.49A10 10 0 0 0 12 2Z" />
                </svg>
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/find-donors">
                  <a className="text-sm text-gray-600 hover:text-red-600">
                    Find Donors
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/emergency-request">
                  <a className="text-sm text-gray-600 hover:text-red-600">
                    Request Blood
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/patients/blood-banks">
                  <a className="text-sm text-gray-600 hover:text-red-600">
                    Blood Banks
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/donors/register">
                  <a className="text-sm text-gray-600 hover:text-red-600">
                    Become a Donor
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/donors/eligibility">
                  <a className="text-sm text-gray-600 hover:text-red-600">
                    Donation Eligibility
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/donors/how-to-donate">
                  <a className="text-sm text-gray-600 hover:text-red-600">
                    Donation Process
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/patients/resources">
                  <a className="text-sm text-gray-600 hover:text-red-600">
                    Patient Resources
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about/faq">
                  <a className="text-sm text-gray-600 hover:text-red-600">
                    FAQ
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Contact
            </h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                <a href="mailto:contact@jiwandan.com" className="text-sm text-gray-600 hover:text-red-600">
                  contact@jiwandan.com
                </a>
              </li>
              <li>
                <Link href="/about/contact">
                  <a className="text-sm text-gray-600 hover:text-red-600">
                    Contact Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about/terms">
                  <a className="text-sm text-gray-600 hover:text-red-600">
                    Terms of Service
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about/privacy">
                  <a className="text-sm text-gray-600 hover:text-red-600">
                    Privacy Policy
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {year} Jiwandan. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex items-center">
              <Link href="/about/mission">
                <a className="text-sm text-gray-500 hover:text-red-600 flex items-center">
                  <Heart className="h-4 w-4 text-red-500 mr-1" />
                  <span>Made with love for humanity</span>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
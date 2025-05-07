import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">LifeLink</h3>
            <p className="text-gray-400 mb-4">Connecting blood donors with those in need, anywhere, anytime.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">For Donors</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">How to Donate</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Eligibility Requirements</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Donor Safety</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Frequent Donor Program</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">For Patients</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/emergency">
                  <a className="text-gray-400 hover:text-white">Request Blood</a>
                </Link>
              </li>
              <li><a href="#" className="text-gray-400 hover:text-white">Emergency Protocol</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Hospital Integration</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Patient Resources</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">About</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Our Mission</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} LifeLink - Emergency Blood Donor Network. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

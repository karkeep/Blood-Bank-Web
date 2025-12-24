import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { UserPlus, MapPin, Bell } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">How Jiwandan Works</h2>
        <p className="text-gray-600 text-center mb-8">Simple steps to save lives</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-2xl text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Register as a Donor</h3>
            <p className="text-gray-600">Create your profile, verify your identity, and specify your blood type and medical history.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-2xl text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Enable Location Services</h3>
            <p className="text-gray-600">Allow the app to know your location so you can be matched with nearby emergency requests.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-2xl text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Respond to Alerts</h3>
            <p className="text-gray-600">When an emergency matching your blood type occurs nearby, you'll receive an alert to help save a life.</p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/auth">
            <Button className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg shadow-md">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

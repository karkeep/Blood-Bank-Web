// src/pages/donors/how-to-donate.tsx
import { InformationPage } from "@/components/ui/information-page";
import { Droplet, Clock, MapPin, Award } from "lucide-react";

export default function HowToDonate() {
  return (
    <InformationPage 
      title="How to Donate Blood" 
      description="Learn about the blood donation process, what to expect, and how to prepare for your donation."
    >
      <div className="prose max-w-none">
        <p className="text-lg text-red-800">Donating blood is a simple process that takes about an hour from start to finish. Here's what you can expect:</p>
        
        <div className="mt-8 space-y-8">
          <div className="flex">
            <div className="mr-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-800 font-bold text-xl">1</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Registration</h3>
              <p className="text-gray-700">Sign in, show your ID, and complete a brief donor registration form. Your information will be kept confidential.</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-800 font-bold text-xl">2</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Health History</h3>
              <p className="text-gray-700">You'll answer questions about your health history and travel in a private, confidential setting. Your honesty ensures safety for both you and recipients.</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-800 font-bold text-xl">3</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Mini-Physical</h3>
              <p className="text-gray-700">We'll check your temperature, pulse, blood pressure, and hemoglobin level to ensure you're healthy enough to donate.</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-800 font-bold text-xl">4</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-800 mb-2">The Donation</h3>
              <p className="text-gray-700">The actual donation takes about 8-10 minutes. You'll be seated comfortably while a pint of blood is drawn. The process is safe and sterile.</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-800 font-bold text-xl">5</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Refreshments</h3>
              <p className="text-gray-700">After donating, you'll rest and enjoy refreshments for 10-15 minutes. This helps your body adjust to the slight decrease in fluid volume.</p>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-red-800 mt-10 mb-4">Preparing for Your Donation</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <Droplet className="text-red-600 mr-2" />
              <h3 className="font-bold text-red-800">Stay Hydrated</h3>
            </div>
            <p className="text-gray-700">Drink an extra 16 oz of water before your appointment.</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <Award className="text-red-600 mr-2" />
              <h3 className="font-bold text-red-800">Eat Healthy</h3>
            </div>
            <p className="text-gray-700">Have iron-rich foods in the weeks before donation.</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <Clock className="text-red-600 mr-2" />
              <h3 className="font-bold text-red-800">Get Rest</h3>
            </div>
            <p className="text-gray-700">Get a good night's sleep before your donation day.</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <MapPin className="text-red-600 mr-2" />
              <h3 className="font-bold text-red-800">Bring ID</h3>
            </div>
            <p className="text-gray-700">Don't forget to bring identification to your appointment.</p>
          </div>
        </div>
      </div>
    </InformationPage>
  );
}
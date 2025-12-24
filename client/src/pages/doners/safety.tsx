// src/pages/donors/safety.tsx
import { InformationPage } from "@/components/ui/information-page";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";

export default function DonorSafety() {
  return (
    <InformationPage 
      title="Donor Safety" 
      description="Learn about the safety measures and protocols we follow to ensure a safe blood donation experience."
    >
      <div className="prose max-w-none">
        <p className="text-lg text-red-800">Your safety is our top priority. We follow strict protocols to ensure that donating blood is safe, comfortable, and positive for every donor.</p>
        
        <div className="bg-red-50 p-6 rounded-lg mt-6 border-l-4 border-red-600">
          <div className="flex items-start">
            <Shield className="text-red-600 mr-3 mt-1 flex-shrink-0 h-6 w-6" />
            <p className="text-red-800 font-medium">
              Our donation centers adhere to the highest safety standards and are regularly inspected and certified by health authorities.
            </p>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-red-800 mt-8 mb-4">Our Safety Measures</h2>
        
        <div className="space-y-6 mt-6">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="text-red-600 h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-bold text-red-800 text-xl">Sterile Equipment</h3>
              <p className="text-gray-700">All needles, blood bags, and collection tubes are sterile, single-use only, and discarded after each donation.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="text-red-600 h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-bold text-red-800 text-xl">Trained Professionals</h3>
              <p className="text-gray-700">Our collection staff are certified healthcare professionals who receive extensive training in blood collection procedures.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="text-red-600 h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-bold text-red-800 text-xl">Health Screening</h3>
              <p className="text-gray-700">Each donor undergoes a health screening before donation to ensure donating is safe for both the donor and potential recipients.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="text-red-600 h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-bold text-red-800 text-xl">Post-Donation Care</h3>
              <p className="text-gray-700">We monitor donors after collection and provide refreshments to help maintain your health and comfort.</p>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-red-800 mt-10 mb-4">Possible Side Effects</h2>
        
        <p className="text-gray-700 mb-4">While blood donation is very safe, some donors may experience minor side effects:</p>
        
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="flex items-start mb-4">
            <AlertTriangle className="text-yellow-600 mr-3 mt-1 flex-shrink-0" />
            <h3 className="font-bold text-gray-800">Common Mild Effects</h3>
          </div>
          
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Bruising at the needle site</li>
            <li>Feeling lightheaded or dizzy (usually brief)</li>
            <li>Fatigue for a few hours</li>
            <li>Arm soreness</li>
          </ul>
          
          <p className="mt-4 text-gray-700">These effects are typically mild and resolve quickly. Our staff is trained to minimize these effects and to respond immediately if they occur.</p>
        </div>
        
        <h2 className="text-2xl font-bold text-red-800 mt-10 mb-4">Your Questions Answered</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-red-800">Can I get any diseases from donating blood?</h3>
            <p className="text-gray-700">No. All equipment used for blood donation is sterile and used only once, eliminating any risk of contracting diseases.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-red-800">How long does it take for my body to replace the donated blood?</h3>
            <p className="text-gray-700">Your body replaces the plasma from your donation within 24 hours. Red blood cells are replaced within 4-6 weeks.</p>
          </div>
          
          <div>
            <h3 className="font-bold text-red-800">Is it safe to donate blood during the COVID-19 pandemic?</h3>
            <p className="text-gray-700">Yes. We've implemented additional safety measures including enhanced cleaning, social distancing, and staff health screenings.</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-6 bg-red-800 text-white rounded-lg mt-8">
          <div>
            <h3 className="font-bold text-xl mb-1">Ready to save lives?</h3>
            <p>Your donation can help up to three people in need.</p>
          </div>
          <button className="bg-white text-red-800 font-bold py-2 px-6 rounded-lg hover:bg-red-100">
            Become a Donor
          </button>
        </div>
      </div>
    </InformationPage>
  );
}
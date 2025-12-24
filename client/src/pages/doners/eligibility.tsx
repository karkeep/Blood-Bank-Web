// src/pages/donors/eligibility.tsx
import { InformationPage } from "@/components/ui/information-page";
import { CheckCircle, XCircle } from "lucide-react";

export default function EligibilityRequirements() {
  return (
    <InformationPage 
      title="Donor Eligibility Requirements" 
      description="Learn about the requirements and eligibility criteria for blood donation."
    >
      <div className="prose max-w-none">
        <p className="text-lg text-red-800">For the safety of both donors and patients, there are certain requirements that must be met before donating blood. These requirements ensure that donation is safe for you and that your blood is safe for patients.</p>
        
        <h2 className="text-2xl font-bold text-red-800 mt-8 mb-4">Basic Requirements</h2>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <CheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Age</h3>
              <p className="text-gray-700">You must be at least 17 years old to donate (16 years old with parental consent in some states).</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <CheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Weight</h3>
              <p className="text-gray-700">You must weigh at least 110 pounds (50 kg).</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <CheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Health</h3>
              <p className="text-gray-700">You must be in good general health and feeling well on the day of donation.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <CheckCircle className="text-green-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Identification</h3>
              <p className="text-gray-700">You must provide a valid government-issued photo ID.</p>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-red-800 mt-10 mb-4">Temporary Deferrals</h2>
        <p className="text-gray-700">Some conditions may temporarily prevent you from donating:</p>
        
        <div className="space-y-4 mt-4">
          <div className="flex items-start">
            <XCircle className="text-red-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Recent illness</h3>
              <p className="text-gray-700">You should be symptom-free and fully recovered from any illness.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <XCircle className="text-red-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Low iron levels</h3>
              <p className="text-gray-700">Your hemoglobin must be at least 12.5 g/dL for women and 13.0 g/dL for men.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <XCircle className="text-red-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Pregnancy</h3>
              <p className="text-gray-700">Pregnant women cannot donate. You must wait 6 weeks after giving birth.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <XCircle className="text-red-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Recent tattoos or piercings</h3>
              <p className="text-gray-700">Wait times vary by state, typically 3-12 months.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <XCircle className="text-red-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Travel to certain countries</h3>
              <p className="text-gray-700">Recent travel to areas with high risk of malaria or other infectious diseases may require a waiting period.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 p-6 rounded-lg mt-8">
          <h3 className="text-xl font-bold text-red-800 mb-2">Eligibility Check</h3>
          <p className="text-gray-700 mb-4">Not sure if you're eligible? Use our quick eligibility checker to find out.</p>
          <button className="bg-red-800 hover:bg-red-900 text-white font-bold py-2 px-4 rounded">
            Check Your Eligibility
          </button>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Note: This information is provided as a general guide. Specific eligibility criteria may vary. The final determination will be made by our medical professionals at the time of your donation.
          </p>
        </div>
      </div>
    </InformationPage>
  );
}
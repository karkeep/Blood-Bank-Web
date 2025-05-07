import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Shield, Hospital, MapPin, FileText, Camera, IdCard } from "lucide-react";

export function VerificationSection() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="md:flex md:space-x-8 items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Become a Verified Donor</h2>
            <p className="text-gray-600 mb-6">We prioritize safety and trust. Our verification process ensures that all donors are genuine and medically eligible to donate.</p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex-shrink-0 flex items-center justify-center mr-4 mt-1">
                  <Shield className="text-xl text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Identity Verification</h3>
                  <p className="text-gray-600 text-sm">Upload your government-issued ID and take a selfie for biometric verification.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex-shrink-0 flex items-center justify-center mr-4 mt-1">
                  <Hospital className="text-xl text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Medical History</h3>
                  <p className="text-gray-600 text-sm">Complete a comprehensive medical questionnaire to ensure your eligibility for donation.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex-shrink-0 flex items-center justify-center mr-4 mt-1">
                  <MapPin className="text-xl text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Location Verification</h3>
                  <p className="text-gray-600 text-sm">Confirm your address to help us match you with nearby emergency requests.</p>
                </div>
              </div>
            </div>
            
            <Link href="/auth">
              <Button className="mt-8 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow-md">
                Start Verification Process
              </Button>
            </Link>
          </div>
          
          <div className="md:w-1/2">
            <div className="bg-gray-50 rounded-xl overflow-hidden shadow-md border border-gray-200">
              <div className="p-6">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Verification Process</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold">1</div>
                    <div className="ml-4 flex-grow">
                      <div className="h-2 bg-accent rounded-full"></div>
                    </div>
                    <div className="text-accent font-medium">Complete</div>
                  </div>
                  
                  <div>
                    <div className="ml-12 mb-4">
                      <h4 className="font-medium text-gray-800 mb-1">Basic Information</h4>
                      <p className="text-gray-500 text-sm">Personal details and contact information</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold">2</div>
                    <div className="ml-4 flex-grow">
                      <div className="h-2 bg-accent rounded-full"></div>
                    </div>
                    <div className="text-accent font-medium">Complete</div>
                  </div>
                  
                  <div>
                    <div className="ml-12 mb-4">
                      <h4 className="font-medium text-gray-800 mb-1">Blood Type & Medical History</h4>
                      <p className="text-gray-500 text-sm">Blood group and health questionnaire</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-500 font-bold">3</div>
                    <div className="ml-4 flex-grow">
                      <div className="h-2 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="text-gray-400 font-medium">Pending</div>
                  </div>
                  
                  <div>
                    <div className="ml-12 mb-4">
                      <h4 className="font-medium text-gray-800 mb-1">Identity Verification</h4>
                      <p className="text-gray-500 text-sm">Upload ID documents and verification photo</p>
                      
                      <div className="mt-4 flex space-x-3">
                        <div className="w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <IdCard className="text-gray-400 block mb-1 mx-auto" />
                            <span className="text-xs text-gray-500">ID Front</span>
                          </div>
                        </div>
                        
                        <div className="w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <IdCard className="text-gray-400 block mb-1 mx-auto" />
                            <span className="text-xs text-gray-500">ID Back</span>
                          </div>
                        </div>
                        
                        <div className="w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Camera className="text-gray-400 block mb-1 mx-auto" />
                            <span className="text-xs text-gray-500">Selfie</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-500 font-bold">4</div>
                    <div className="ml-4 flex-grow">
                      <div className="h-2 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="text-gray-400 font-medium">Pending</div>
                  </div>
                  
                  <div>
                    <div className="ml-12">
                      <h4 className="font-medium text-gray-800 mb-1">Address Verification</h4>
                      <p className="text-gray-500 text-sm">Confirm your location for emergency matching</p>
                    </div>
                  </div>
                </div>
                
                <Button className="mt-6 w-full bg-accent hover:bg-accent-dark text-white font-bold py-3 rounded-lg">
                  Continue Verification
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

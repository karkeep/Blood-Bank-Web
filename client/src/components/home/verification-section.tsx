import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Shield, Hospital, MapPin, FileText, Camera, IdCard } from "lucide-react";

// Define types for authentication state
interface UserAuthState {
  isLoggedIn: boolean;
  verificationStatus?: {
    isInProgress: boolean;
    completedSteps: number[];
    currentStep: number;
  };
  userProfile?: {
    name?: string;
    email?: string;
  };
}

export function VerificationSection({
  auth = { isLoggedIn: false }
}: {
  auth?: UserAuthState
}) {
  // Determine if the verification process UI should be shown
  const showVerificationProgress = auth.isLoggedIn && auth.verificationStatus?.isInProgress;

  // Helper functions to check step status
  const isStepCompleted = (stepNumber: number) =>
    auth.verificationStatus?.completedSteps.includes(stepNumber) || false;

  const isCurrentStep = (stepNumber: number) =>
    auth.verificationStatus?.currentStep === stepNumber;

  return (
    <section className="py-12 bg-red-50">
      <div className="container mx-auto px-4">
        <div className="md:flex md:space-x-8 items-center">
          {/* Left side - Information about verification - always shown */}
          <div className={`${showVerificationProgress ? 'md:w-1/2' : 'md:w-2/3 mx-auto'} mb-8 md:mb-0`}>
            <h2 className="text-2xl font-bold text-red-800 mb-4">Become a Verified Donor</h2>
            <p className="text-red-600 mb-6">We prioritize safety and trust. Our verification process ensures that all donors are genuine and medically eligible to donate.</p>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-red-800/10 rounded-full flex-shrink-0 flex items-center justify-center mr-4 mt-1">
                  <Shield className="text-xl text-red-700" />
                </div>
                <div>
                  <h3 className="font-bold text-red-800 mb-1">Identity Verification</h3>
                  <p className="text-red-600 text-sm">Upload your government-issued ID and take a selfie for biometric verification.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-red-800/10 rounded-full flex-shrink-0 flex items-center justify-center mr-4 mt-1">
                  <Hospital className="text-xl text-red-700" />
                </div>
                <div>
                  <h3 className="font-bold text-red-800 mb-1">Medical History</h3>
                  <p className="text-red-600 text-sm">Complete a comprehensive medical questionnaire to ensure your eligibility for donation.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-red-800/10 rounded-full flex-shrink-0 flex items-center justify-center mr-4 mt-1">
                  <MapPin className="text-xl text-red-700" />
                </div>
                <div>
                  <h3 className="font-bold text-red-800 mb-1">Location Verification</h3>
                  <p className="text-red-600 text-sm">Confirm your address to help us match you with nearby emergency requests.</p>
                </div>
              </div>
            </div>

            {/* Show appropriate button based on auth state */}
            {!auth.isLoggedIn ? (
              <Link href="/donors/verify">
                <Button className="mt-8 bg-red-800 hover:bg-red-900 text-white font-bold py-3 px-6 rounded-lg shadow-md">
                  Start Verification Process
                </Button>
              </Link>
            ) : !auth.verificationStatus?.isInProgress ? (
              <Link href="/donors/verify">
                <Button className="mt-8 bg-red-800 hover:bg-red-900 text-white font-bold py-3 px-6 rounded-lg shadow-md">
                  Begin Verification
                </Button>
              </Link>
            ) : null}
          </div>

          {/* Right side - Verification Progress - only shown for logged in users in verification process */}
          {showVerificationProgress && (
            <div className="md:w-1/2">
              <div className="bg-white rounded-xl overflow-hidden shadow-md border border-red-200">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-red-800 text-lg">Verification Progress</h3>
                    {auth.userProfile?.email && (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        {auth.userProfile.email}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${isStepCompleted(1) ? 'bg-red-600 text-white' : 'bg-white border-2 border-red-300 text-red-400'} flex items-center justify-center font-bold`}>
                        1
                      </div>
                      <div className="ml-4 flex-grow">
                        <div className={`h-2 ${isStepCompleted(1) ? 'bg-red-600' : 'bg-red-200'} rounded-full`}></div>
                      </div>
                      <div className={`${isStepCompleted(1) ? 'text-red-600' : 'text-red-400'} font-medium`}>
                        {isStepCompleted(1) ? 'Complete' : 'Pending'}
                      </div>
                    </div>
                    <div>
                      <div className="ml-12 mb-4">
                        <h4 className="font-medium text-red-800 mb-1">Basic Information</h4>
                        <p className="text-red-600 text-sm">Personal details and contact information</p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${isStepCompleted(2) ? 'bg-red-600 text-white' : 'bg-white border-2 border-red-300 text-red-400'} flex items-center justify-center font-bold`}>
                        2
                      </div>
                      <div className="ml-4 flex-grow">
                        <div className={`h-2 ${isStepCompleted(2) ? 'bg-red-600' : 'bg-red-200'} rounded-full`}></div>
                      </div>
                      <div className={`${isStepCompleted(2) ? 'text-red-600' : 'text-red-400'} font-medium`}>
                        {isStepCompleted(2) ? 'Complete' : 'Pending'}
                      </div>
                    </div>
                    <div>
                      <div className="ml-12 mb-4">
                        <h4 className="font-medium text-red-800 mb-1">Blood Type &amp; Medical History</h4>
                        <p className="text-red-600 text-sm">Blood group and health questionnaire</p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${isStepCompleted(3) ? 'bg-red-600 text-white' : 'bg-white border-2 border-red-300 text-red-400'} flex items-center justify-center font-bold`}>
                        3
                      </div>
                      <div className="ml-4 flex-grow">
                        <div className={`h-2 ${isStepCompleted(3) ? 'bg-red-600' : 'bg-red-200'} rounded-full`}></div>
                      </div>
                      <div className={`${isStepCompleted(3) ? 'text-red-600' : 'text-red-400'} font-medium`}>
                        {isStepCompleted(3) ? 'Complete' : 'Pending'}
                      </div>
                    </div>
                    <div>
                      <div className="ml-12 mb-4">
                        <h4 className="font-medium text-red-800 mb-1">Identity Verification</h4>
                        <p className="text-red-600 text-sm">Upload ID documents and verification photo</p>

                        {/* Only show upload UI if this is the current step */}
                        {isCurrentStep(3) && (
                          <div className="mt-4 flex space-x-3">
                            <div className="w-24 h-16 border-2 border-dashed border-red-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-50 transition-colors">
                              <div className="text-center">
                                <IdCard className="text-red-400 block mb-1 mx-auto" />
                                <span className="text-xs text-red-500">ID Front</span>
                              </div>
                            </div>
                            <div className="w-24 h-16 border-2 border-dashed border-red-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-50 transition-colors">
                              <div className="text-center">
                                <IdCard className="text-red-400 block mb-1 mx-auto" />
                                <span className="text-xs text-red-500">ID Back</span>
                              </div>
                            </div>
                            <div className="w-24 h-16 border-2 border-dashed border-red-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-50 transition-colors">
                              <div className="text-center">
                                <Camera className="text-red-400 block mb-1 mx-auto" />
                                <span className="text-xs text-red-500">Selfie</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${isStepCompleted(4) ? 'bg-red-600 text-white' : 'bg-white border-2 border-red-300 text-red-400'} flex items-center justify-center font-bold`}>
                        4
                      </div>
                      <div className="ml-4 flex-grow">
                        <div className={`h-2 ${isStepCompleted(4) ? 'bg-red-600' : 'bg-red-200'} rounded-full`}></div>
                      </div>
                      <div className={`${isStepCompleted(4) ? 'text-red-600' : 'text-red-400'} font-medium`}>
                        {isStepCompleted(4) ? 'Complete' : 'Pending'}
                      </div>
                    </div>
                    <div>
                      <div className="ml-12">
                        <h4 className="font-medium text-red-800 mb-1">Address Verification</h4>
                        <p className="text-red-600 text-sm">Confirm your location for emergency matching</p>
                      </div>
                    </div>
                  </div>

                  {/* Continue button - show if there are more steps */}
                  {auth.verificationStatus?.currentStep <= 4 && (
                    <Button
                      className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg"
                      onClick={() => {/* Handle continue action */ }}
                    >
                      {auth.verificationStatus?.completedSteps.length === 4
                        ? 'Verification Complete'
                        : 'Continue Verification'
                      }
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Example usage in a page component
export function VerificationPage() {
  // This would come from your auth context/provider
  const authState = {
    isLoggedIn: true,
    verificationStatus: {
      isInProgress: true,
      completedSteps: [1, 2],
      currentStep: 3
    },
    userProfile: {
      name: "John Doe",
      email: "john.doe@example.com"
    }
  };

  return (
    <>
      <VerificationSection auth={authState} />
      {/* Other page content */}
    </>
  );
}
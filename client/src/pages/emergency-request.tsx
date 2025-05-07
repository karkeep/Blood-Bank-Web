import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RequestForm } from "@/components/emergency/request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet";
import { HeartPulse, Clock, Users, MapPin } from "lucide-react";

export default function EmergencyRequest() {
  return (
    <>
      <Helmet>
        <title>Emergency Blood Request - LifeLink</title>
        <meta name="description" content="Create an emergency blood request to find compatible donors nearby. Time-critical blood donation coordination." />
        <meta property="og:title" content="Emergency Blood Request - LifeLink" />
        <meta property="og:description" content="Create an emergency blood request to find compatible donors near you." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Emergency alert banner */}
              <div className="bg-primary text-white p-4 rounded-lg mb-6 flex items-center">
                <div className="mr-4">
                  <HeartPulse className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Emergency Blood Request</h1>
                  <p>This system is for genuine emergencies only. For routine blood needs, please contact your local blood bank.</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Main form area */}
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Create Emergency Request</CardTitle>
                      <CardDescription>Fill out the form below to find compatible donors near you</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RequestForm />
                    </CardContent>
                  </Card>
                </div>
                
                {/* Information sidebar */}
                <div className="md:col-span-1">
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Emergency Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Avg. response time</span>
                        <span className="font-medium">8 minutes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Success rate</span>
                        <span className="font-medium">94%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Lives saved this month</span>
                        <span className="font-medium">487</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        What Happens Next?
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex">
                          <div className="w-6 h-6 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xs mr-3 mt-0.5">
                            1
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">Donor Matching</h3>
                            <p className="text-xs text-gray-500">
                              Our system instantly matches your request with eligible donors in your area based on blood compatibility.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex">
                          <div className="w-6 h-6 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xs mr-3 mt-0.5">
                            2
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">Donor Notifications</h3>
                            <p className="text-xs text-gray-500">
                              Compatible donors receive emergency alerts via SMS, email, and app notifications.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex">
                          <div className="w-6 h-6 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xs mr-3 mt-0.5">
                            3
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">Donor Confirmation</h3>
                            <p className="text-xs text-gray-500">
                              When a donor confirms, you'll receive their ETA and contact details. Your medical team will be notified as well.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex">
                          <div className="w-6 h-6 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-xs mr-3 mt-0.5">
                            4
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">Live Tracking</h3>
                            <p className="text-xs text-gray-500">
                              Track the donor's arrival in real-time and communicate through our secure messaging system.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

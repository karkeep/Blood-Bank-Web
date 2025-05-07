import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Helmet } from "react-helmet";
import { Calendar, Clock, FileText, MapPin, HeartPulse, Award, History } from "lucide-react";

export default function DonorProfile() {
  const { user } = useAuth();
  
  if (!user) {
    return null; // Protected route will handle redirecting
  }
  
  return (
    <>
      <Helmet>
        <title>Donor Profile - LifeLink</title>
        <meta name="description" content="Manage your donor profile, track your donations, and update your availability for blood donation requests." />
        <meta property="og:title" content="Donor Profile - LifeLink" />
        <meta property="og:description" content="Manage your donor profile on LifeLink Emergency Blood Donor Network." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sidebar / Profile Overview */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <CardTitle>{user.username}</CardTitle>
                    <CardDescription>Donor ID: #{user.id}</CardDescription>
                    
                    <div className="flex justify-center mt-2">
                      <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                        Bronze Donor
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex justify-center mb-4">
                      <BloodTypeBadge type="O+" size="lg" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">New York, NY</span>
                      </div>
                      <div className="flex items-center">
                        <History className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">Donor since June 2023</span>
                      </div>
                      <div className="flex items-center">
                        <Award className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">5 donations</span>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch id="emergency-available" />
                        <Label htmlFor="emergency-available">Available for emergencies</Label>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-500">
                      When enabled, you may receive emergency donation requests matching your blood type
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button variant="outline" className="w-full">Edit Profile</Button>
                  </CardFooter>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-base">Donation Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Level Progress</span>
                          <span>5/10 to Silver</span>
                        </div>
                        <Progress value={50} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Total Donations</span>
                          <span>5</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Lives Saved</span>
                          <span>15</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Blood Donated</span>
                          <span>2.25L</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Content Area */}
              <div className="md:col-span-2">
                <Tabs defaultValue="dashboard">
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="donations">Donation History</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dashboard">
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>Health Dashboard</CardTitle>
                        <CardDescription>Track your donation eligibility and health metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-base font-medium mb-3 flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-primary" />
                              Donation Eligibility
                            </h3>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <span className="font-medium text-green-800">You are eligible to donate</span>
                              </div>
                              <p className="text-sm text-green-700 mt-1">
                                Your last donation was 70 days ago. You're clear to donate again.
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-base font-medium mb-3 flex items-center">
                              <HeartPulse className="w-4 h-4 mr-2 text-primary" />
                              Health Metrics
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="border rounded-lg p-4">
                                <div className="text-sm text-gray-500 mb-1">Hemoglobin</div>
                                <div className="text-xl font-medium">14.2 g/dL</div>
                                <div className="text-xs text-green-600 mt-1">Normal range</div>
                              </div>
                              <div className="border rounded-lg p-4">
                                <div className="text-sm text-gray-500 mb-1">Blood Pressure</div>
                                <div className="text-xl font-medium">120/80</div>
                                <div className="text-xs text-green-600 mt-1">Normal range</div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-base font-medium mb-3 flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-primary" />
                              Recent Activity
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white">
                                  <HeartPulse className="w-5 h-5" />
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium">Successful donation</p>
                                  <p className="text-sm text-gray-500">2 months ago at New York Blood Center</p>
                                </div>
                              </div>
                              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-alert">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="M12 8v4" />
                                    <path d="M12 16h.01" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium">Emergency request received</p>
                                  <p className="text-sm text-gray-500">3 months ago (No action taken)</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Upcoming Blood Drives</CardTitle>
                        <CardDescription>Blood donation events near your location</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">New York Blood Center</h4>
                                <p className="text-sm text-gray-500">310 E 67th St, New York, NY</p>
                                <div className="flex items-center mt-2">
                                  <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                                  <span className="text-sm text-gray-500">July 15, 2023</span>
                                  <Clock className="w-4 h-4 ml-3 mr-1 text-gray-500" />
                                  <span className="text-sm text-gray-500">9:00 AM - 5:00 PM</span>
                                </div>
                              </div>
                              <Badge>1.2 miles away</Badge>
                            </div>
                            <div className="mt-3">
                              <Button size="sm" variant="outline">Schedule Appointment</Button>
                            </div>
                          </div>
                          
                          <div className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">Community Blood Drive - Central Park</h4>
                                <p className="text-sm text-gray-500">Central Park, New York, NY</p>
                                <div className="flex items-center mt-2">
                                  <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                                  <span className="text-sm text-gray-500">July 22, 2023</span>
                                  <Clock className="w-4 h-4 ml-3 mr-1 text-gray-500" />
                                  <span className="text-sm text-gray-500">10:00 AM - 3:00 PM</span>
                                </div>
                              </div>
                              <Badge>0.8 miles away</Badge>
                            </div>
                            <div className="mt-3">
                              <Button size="sm" variant="outline">Schedule Appointment</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="donations">
                    <Card>
                      <CardHeader>
                        <CardTitle>Donation History</CardTitle>
                        <CardDescription>Record of your blood donations</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:bg-primary before:rounded-full before:content-[''] after:absolute after:left-[5.5px] after:top-5 after:bottom-0 after:w-0.5 after:bg-gray-200 after:content-['']">
                            <div className="mb-1 font-medium">New York Blood Center</div>
                            <div className="text-sm text-gray-500 mb-1">May 17, 2023</div>
                            <div className="flex space-x-3 mt-2">
                              <Badge variant="outline">O+ Blood</Badge>
                              <Badge variant="outline">450ml</Badge>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Successful</Badge>
                            </div>
                          </div>
                          
                          <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:bg-primary before:rounded-full before:content-[''] after:absolute after:left-[5.5px] after:top-5 after:bottom-0 after:w-0.5 after:bg-gray-200 after:content-['']">
                            <div className="mb-1 font-medium">Emergency Donation - Mount Sinai Hospital</div>
                            <div className="text-sm text-gray-500 mb-1">March 3, 2023</div>
                            <div className="flex space-x-3 mt-2">
                              <Badge variant="outline">O+ Blood</Badge>
                              <Badge variant="outline">450ml</Badge>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Successful</Badge>
                            </div>
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                              <div className="font-medium mb-1">Recipient note:</div>
                              <p className="text-gray-600">Thank you so much for your timely donation. Your blood helped save my brother's life after his surgery complications.</p>
                            </div>
                          </div>
                          
                          <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:bg-primary before:rounded-full before:content-['']">
                            <div className="mb-1 font-medium">Community Blood Drive - Brooklyn</div>
                            <div className="text-sm text-gray-500 mb-1">January 12, 2023</div>
                            <div className="flex space-x-3 mt-2">
                              <Badge variant="outline">O+ Blood</Badge>
                              <Badge variant="outline">450ml</Badge>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Successful</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="documents">
                    <Card>
                      <CardHeader>
                        <CardTitle>Verification Documents</CardTitle>
                        <CardDescription>Manage your identity and medical documents</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-base font-medium mb-3 flex items-center">
                              <FileText className="w-4 h-4 mr-2 text-primary" />
                              Identity Verification
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-medium">Government ID</h4>
                                    <p className="text-xs text-gray-500">Uploaded May 10, 2023</p>
                                  </div>
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Verified
                                  </Badge>
                                </div>
                                <div className="h-24 bg-gray-100 rounded flex items-center justify-center">
                                  <FileText className="h-6 w-6 text-gray-400" />
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-medium">Verification Selfie</h4>
                                    <p className="text-xs text-gray-500">Uploaded May 10, 2023</p>
                                  </div>
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Verified
                                  </Badge>
                                </div>
                                <div className="h-24 bg-gray-100 rounded flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera text-gray-400">
                                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                                    <circle cx="12" cy="13" r="3" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-base font-medium mb-3 flex items-center">
                              <FileText className="w-4 h-4 mr-2 text-primary" />
                              Medical Documentation
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-medium">Blood Type Certificate</h4>
                                    <p className="text-xs text-gray-500">Uploaded May 10, 2023</p>
                                  </div>
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Verified
                                  </Badge>
                                </div>
                                <div className="h-24 bg-gray-100 rounded flex items-center justify-center">
                                  <FileText className="h-6 w-6 text-gray-400" />
                                </div>
                              </div>
                              
                              <div className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-medium">Recent Health Check</h4>
                                    <p className="text-xs text-gray-500">Expires in 5 months</p>
                                  </div>
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    Update Soon
                                  </Badge>
                                </div>
                                <div className="h-24 bg-gray-100 rounded flex items-center justify-center">
                                  <FileText className="h-6 w-6 text-gray-400" />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Button>Upload New Document</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

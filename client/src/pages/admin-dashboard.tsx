import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { DonorMap } from "@/components/maps/donor-map";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { 
  Activity, 
  AlertTriangle, 
  BarChart3,
  FileText, 
  Globe,
  Heart, 
  Users, 
  User
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  if (!user) {
    return null; // Protected route will handle redirecting
  }
  
  return (
    <>
      <Helmet>
        <title>Admin Dashboard - LifeLink</title>
        <meta name="description" content="LifeLink administrative dashboard for managing donors, requests, and monitoring the blood donation network." />
        <meta property="og:title" content="Admin Dashboard - LifeLink" />
        <meta property="og:description" content="Manage and monitor the LifeLink emergency blood donor network." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Monitor and manage the LifeLink donor network</p>
            </div>
            
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Donors</p>
                      <p className="text-2xl font-bold">2,841</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-xs">
                      <span className="text-green-500 flex items-center mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up">
                          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                          <polyline points="16 7 22 7 22 13" />
                        </svg>
                        12%
                      </span>
                      <span className="text-gray-500">from last month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Emergencies</p>
                      <p className="text-2xl font-bold">7</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-xs">
                      <span className="text-red-500 flex items-center mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up">
                          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                          <polyline points="16 7 22 7 22 13" />
                        </svg>
                        18%
                      </span>
                      <span className="text-gray-500">from last week</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Donations This Month</p>
                      <p className="text-2xl font-bold">149</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-xs">
                      <span className="text-green-500 flex items-center mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up">
                          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                          <polyline points="16 7 22 7 22 13" />
                        </svg>
                        8%
                      </span>
                      <span className="text-gray-500">from last month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Lives Saved</p>
                      <p className="text-2xl font-bold">487</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-xs">
                      <span className="text-green-500 flex items-center mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up">
                          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                          <polyline points="16 7 22 7 22 13" />
                        </svg>
                        15%
                      </span>
                      <span className="text-gray-500">from last quarter</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="monitoring">
              <TabsList className="mb-6">
                <TabsTrigger value="monitoring">Real-Time Monitoring</TabsTrigger>
                <TabsTrigger value="donors">Donor Management</TabsTrigger>
                <TabsTrigger value="requests">Emergency Requests</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="monitoring">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card className="mb-6">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Globe className="h-5 w-5 mr-2" />
                          Global Blood Inventory Heatmap
                        </CardTitle>
                        <CardDescription>Live view of blood inventory levels worldwide</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px] rounded-md overflow-hidden">
                          <DonorMap />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Active Emergency Requests
                        </CardTitle>
                        <CardDescription>Currently ongoing emergency donation requests</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Request ID</TableHead>
                              <TableHead>Blood Type</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Time Remaining</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">ER-2458</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <BloodTypeBadge type="O-" size="sm" className="mr-2" />
                                  O-
                                </div>
                              </TableCell>
                              <TableCell>Mount Sinai Hospital, NY</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  Critical
                                </Badge>
                              </TableCell>
                              <TableCell className="text-red-600">28 minutes</TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline">View</Button>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">ER-2457</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <BloodTypeBadge type="A+" size="sm" className="mr-2" />
                                  A+
                                </div>
                              </TableCell>
                              <TableCell>NYU Langone, NY</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Matching
                                </Badge>
                              </TableCell>
                              <TableCell>43 minutes</TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline">View</Button>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">ER-2456</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <BloodTypeBadge type="B+" size="sm" className="mr-2" />
                                  B+
                                </div>
                              </TableCell>
                              <TableCell>Lenox Hill Hospital, NY</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Donor Found
                                </Badge>
                              </TableCell>
                              <TableCell>1 hour 12 minutes</TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline">View</Button>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card className="mb-6">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <BarChart3 className="h-5 w-5 mr-2" />
                          Blood Inventory Status
                        </CardTitle>
                        <CardDescription>National inventory levels by blood type</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-5">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>O-</span>
                              <span className="text-red-600 font-medium">Critical (18%)</span>
                            </div>
                            <Progress value={18} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>O+</span>
                              <span className="text-yellow-600 font-medium">Low (42%)</span>
                            </div>
                            <Progress value={42} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>A-</span>
                              <span className="text-yellow-600 font-medium">Low (48%)</span>
                            </div>
                            <Progress value={48} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>A+</span>
                              <span className="text-green-600 font-medium">Stable (65%)</span>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>B-</span>
                              <span className="text-yellow-600 font-medium">Low (32%)</span>
                            </div>
                            <Progress value={32} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>B+</span>
                              <span className="text-green-600 font-medium">Stable (58%)</span>
                            </div>
                            <Progress value={58} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>AB-</span>
                              <span className="text-green-600 font-medium">Stable (75%)</span>
                            </div>
                            <Progress value={75} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>AB+</span>
                              <span className="text-green-600 font-medium">Good (82%)</span>
                            </div>
                            <Progress value={82} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Recent Activity Log
                        </CardTitle>
                        <CardDescription>Latest system events and activities</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="border-l-4 border-green-500 pl-4 py-1">
                            <p className="font-medium">Donor Match Confirmed</p>
                            <p className="text-sm text-gray-500">O+ donor #12458 matched with ER-2453</p>
                            <p className="text-xs text-gray-400">12 minutes ago</p>
                          </div>
                          <div className="border-l-4 border-red-500 pl-4 py-1">
                            <p className="font-medium">Critical Request Created</p>
                            <p className="text-sm text-gray-500">Emergency O- request from Mount Sinai Hospital</p>
                            <p className="text-xs text-gray-400">28 minutes ago</p>
                          </div>
                          <div className="border-l-4 border-yellow-500 pl-4 py-1">
                            <p className="font-medium">Verification Pending</p>
                            <p className="text-sm text-gray-500">New user #34921 submitted verification documents</p>
                            <p className="text-xs text-gray-400">54 minutes ago</p>
                          </div>
                          <div className="border-l-4 border-blue-500 pl-4 py-1">
                            <p className="font-medium">System Alert</p>
                            <p className="text-sm text-gray-500">Low inventory notification sent for O- blood type</p>
                            <p className="text-xs text-gray-400">1 hour ago</p>
                          </div>
                          <div className="border-l-4 border-green-500 pl-4 py-1">
                            <p className="font-medium">Donation Complete</p>
                            <p className="text-sm text-gray-500">Donor #23571 completed donation at NYU Langone</p>
                            <p className="text-xs text-gray-400">2 hours ago</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="donors">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          <User className="h-5 w-5 mr-2" />
                          Donor Management
                        </CardTitle>
                        <CardDescription>View and manage registered donors</CardDescription>
                      </div>
                      <Button size="sm" variant="outline">Add New Donor</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Blood Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Donations</TableHead>
                          <TableHead>Verification</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">#12458</TableCell>
                          <TableCell>johnsmith</TableCell>
                          <TableCell>
                            <BloodTypeBadge type="O+" size="sm" />
                          </TableCell>
                          <TableCell>New York, NY</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Available
                            </Badge>
                          </TableCell>
                          <TableCell>24</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Verified
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" variant="outline">Edit</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#23571</TableCell>
                          <TableCell>sarahjones</TableCell>
                          <TableCell>
                            <BloodTypeBadge type="A-" size="sm" />
                          </TableCell>
                          <TableCell>Brooklyn, NY</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Unavailable
                            </Badge>
                          </TableCell>
                          <TableCell>18</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Verified
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" variant="outline">Edit</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#34782</TableCell>
                          <TableCell>robertjohnson</TableCell>
                          <TableCell>
                            <BloodTypeBadge type="O-" size="sm" />
                          </TableCell>
                          <TableCell>Queens, NY</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Available
                            </Badge>
                          </TableCell>
                          <TableCell>12</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Verified
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" variant="outline">Edit</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">#45693</TableCell>
                          <TableCell>emilydavis</TableCell>
                          <TableCell>
                            <BloodTypeBadge type="B+" size="sm" />
                          </TableCell>
                          <TableCell>Manhattan, NY</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Available
                            </Badge>
                          </TableCell>
                          <TableCell>8</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Pending
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" variant="outline">Edit</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="requests">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Emergency Request Management
                        </CardTitle>
                        <CardDescription>Track and manage blood donation requests</CardDescription>
                      </div>
                      <Button size="sm" variant="outline">Create Request</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Requester</TableHead>
                          <TableHead>Blood Type</TableHead>
                          <TableHead>Hospital</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">ER-2458</TableCell>
                          <TableCell>Dr. Williams</TableCell>
                          <TableCell>
                            <BloodTypeBadge type="O-" size="sm" />
                          </TableCell>
                          <TableCell>Mount Sinai Hospital</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Critical
                            </Badge>
                          </TableCell>
                          <TableCell>28 minutes ago</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              High
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" variant="outline">Escalate</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">ER-2457</TableCell>
                          <TableCell>Dr. Johnson</TableCell>
                          <TableCell>
                            <BloodTypeBadge type="A+" size="sm" />
                          </TableCell>
                          <TableCell>NYU Langone</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Matching
                            </Badge>
                          </TableCell>
                          <TableCell>43 minutes ago</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Medium
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" variant="outline">Escalate</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">ER-2456</TableCell>
                          <TableCell>Dr. Chen</TableCell>
                          <TableCell>
                            <BloodTypeBadge type="B+" size="sm" />
                          </TableCell>
                          <TableCell>Lenox Hill Hospital</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Donor Found
                            </Badge>
                          </TableCell>
                          <TableCell>1 hour 12 minutes ago</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Medium
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" variant="outline">Track</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">ER-2455</TableCell>
                          <TableCell>Dr. Martinez</TableCell>
                          <TableCell>
                            <BloodTypeBadge type="AB+" size="sm" />
                          </TableCell>
                          <TableCell>Columbia Medical Center</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Completed
                            </Badge>
                          </TableCell>
                          <TableCell>3 hours ago</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Low
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" variant="outline">Archive</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Blood Donation Trends</CardTitle>
                      <CardDescription>Monthly donations by blood type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                        <p className="text-gray-500">Chart visualization would display here</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Emergency Response Times</CardTitle>
                      <CardDescription>Average time from request to donation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                        <p className="text-gray-500">Chart visualization would display here</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Donor Geography</CardTitle>
                      <CardDescription>Donor distribution by region</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                        <p className="text-gray-500">Chart visualization would display here</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">User Growth</CardTitle>
                      <CardDescription>New donors and requesters over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                        <p className="text-gray-500">Chart visualization would display here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

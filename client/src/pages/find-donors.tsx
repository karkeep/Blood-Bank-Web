import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DonorMap } from "@/components/maps/donor-map";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet";
import { Search, MapPin, Clock, Filter } from "lucide-react";
import { useState } from "react";

export default function FindDonors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bloodType, setBloodType] = useState("all");
  
  return (
    <>
      <Helmet>
        <title>Find Blood Donors - LifeLink</title>
        <meta name="description" content="Locate blood donors near you. Search by location and blood type to find compatible donors for your needs." />
        <meta property="og:title" content="Find Blood Donors - LifeLink" />
        <meta property="og:description" content="Find compatible blood donors in your area. Filter by blood type and location." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Find Blood Donors</h1>
                <p className="text-gray-600">Search for compatible donors in your area</p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="flex space-x-2">
                  <Select value={bloodType} onValueChange={setBloodType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Blood Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="distance">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="availability">Availability</SelectItem>
                      <SelectItem value="donated">Most Donated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search & Filter Panel */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <Search className="h-4 w-4 mr-2" />
                      Search Donors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                          <Input 
                            id="location"
                            placeholder="Enter city or address" 
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bloodType">Blood Type Needed</Label>
                        <div className="grid grid-cols-4 gap-2">
                          <Button
                            variant={bloodType === "A+" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBloodType("A+")}
                            className="flex items-center justify-center h-10"
                          >
                            A+
                          </Button>
                          <Button
                            variant={bloodType === "B+" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBloodType("B+")}
                            className="flex items-center justify-center h-10"
                          >
                            B+
                          </Button>
                          <Button
                            variant={bloodType === "AB+" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBloodType("AB+")}
                            className="flex items-center justify-center h-10"
                          >
                            AB+
                          </Button>
                          <Button
                            variant={bloodType === "O+" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBloodType("O+")}
                            className="flex items-center justify-center h-10"
                          >
                            O+
                          </Button>
                          <Button
                            variant={bloodType === "A-" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBloodType("A-")}
                            className="flex items-center justify-center h-10"
                          >
                            A-
                          </Button>
                          <Button
                            variant={bloodType === "B-" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBloodType("B-")}
                            className="flex items-center justify-center h-10"
                          >
                            B-
                          </Button>
                          <Button
                            variant={bloodType === "AB-" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBloodType("AB-")}
                            className="flex items-center justify-center h-10"
                          >
                            AB-
                          </Button>
                          <Button
                            variant={bloodType === "O-" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBloodType("O-")}
                            className="flex items-center justify-center h-10"
                          >
                            O-
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="distance">Maximum Distance</Label>
                        <Select defaultValue="25">
                          <SelectTrigger>
                            <SelectValue placeholder="Select distance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 miles</SelectItem>
                            <SelectItem value="10">10 miles</SelectItem>
                            <SelectItem value="25">25 miles</SelectItem>
                            <SelectItem value="50">50 miles</SelectItem>
                            <SelectItem value="100">100 miles</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="availability">Availability</Label>
                        <Select defaultValue="any">
                          <SelectTrigger>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any time</SelectItem>
                            <SelectItem value="now">Available now</SelectItem>
                            <SelectItem value="today">Available today</SelectItem>
                            <SelectItem value="week">Available this week</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button type="submit" className="w-full">
                        Search Donors
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Blood Inventory Status
                    </CardTitle>
                    <CardDescription>Current inventory levels in New York</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <BloodTypeBadge type="O-" size="sm" className="mr-2" />
                            O- (Universal)
                          </span>
                          <span className="text-red-600 font-medium">Critical</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <BloodTypeBadge type="A+" size="sm" className="mr-2" />
                            A+
                          </span>
                          <span className="text-yellow-600 font-medium">Low</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <BloodTypeBadge type="B+" size="sm" className="mr-2" />
                            B+
                          </span>
                          <span className="text-yellow-600 font-medium">Low</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <BloodTypeBadge type="AB+" size="sm" className="mr-2" />
                            AB+
                          </span>
                          <span className="text-green-600 font-medium">Adequate</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center">
                            <BloodTypeBadge type="O+" size="sm" className="mr-2" />
                            O+
                          </span>
                          <span className="text-green-600 font-medium">Good</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Map and Results */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                <Tabs defaultValue="map">
                  <TabsList className="mb-4">
                    <TabsTrigger value="map">Map View</TabsTrigger>
                    <TabsTrigger value="list">List View</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="map">
                    <Card>
                      <CardContent className="p-0 overflow-hidden rounded-lg">
                        <DonorMap bloodType={bloodType} searchQuery={searchQuery} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="list">
                    <div className="space-y-4">
                      {/* Sample donor cards - would be generated from API data */}
                      <Card className="donor-card">
                        <CardContent className="p-4">
                          <div className="flex items-start">
                            <BloodTypeBadge type="O+" className="flex-shrink-0 mr-4" />
                            
                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">Anonymous Donor #12458</h3>
                                  <div className="flex items-center mt-1 text-sm text-gray-500">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>Upper East Side, 1.3 miles away</span>
                                  </div>
                                </div>
                                <Badge variant="secondary">Available Now</Badge>
                              </div>
                              
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Badge variant="outline">24 donations</Badge>
                                <Badge variant="outline">Gold Donor</Badge>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Verified
                                </Badge>
                              </div>
                              
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>Last donation: 3 months ago</span>
                                </div>
                                <Button size="sm">Contact</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="donor-card">
                        <CardContent className="p-4">
                          <div className="flex items-start">
                            <BloodTypeBadge type="A-" className="flex-shrink-0 mr-4" />
                            
                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">Anonymous Donor #23571</h3>
                                  <div className="flex items-center mt-1 text-sm text-gray-500">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>Chelsea, 2.7 miles away</span>
                                  </div>
                                </div>
                                <Badge variant="secondary">Available Today</Badge>
                              </div>
                              
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Badge variant="outline">18 donations</Badge>
                                <Badge variant="outline">Silver Donor</Badge>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Verified
                                </Badge>
                              </div>
                              
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>Last donation: 2 months ago</span>
                                </div>
                                <Button size="sm">Contact</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="donor-card">
                        <CardContent className="p-4">
                          <div className="flex items-start">
                            <BloodTypeBadge type="O-" className="flex-shrink-0 mr-4" />
                            
                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">Anonymous Donor #34782</h3>
                                  <div className="flex items-center mt-1 text-sm text-gray-500">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>Brooklyn Heights, 3.5 miles away</span>
                                  </div>
                                </div>
                                <Badge>Available This Week</Badge>
                              </div>
                              
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Badge variant="outline">12 donations</Badge>
                                <Badge variant="outline">Bronze Donor</Badge>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Verified
                                </Badge>
                              </div>
                              
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>Last donation: 1 month ago</span>
                                </div>
                                <Button size="sm">Contact</Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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

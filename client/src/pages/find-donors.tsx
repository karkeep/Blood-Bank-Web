import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RealGoogleDonorMap } from "@/components/maps/real-google-donor-map";
import { DonorList } from "@/components/donors/donor-list";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Helmet } from "react-helmet";
import { Search, MapPin, Clock, Filter, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useBloodInventory } from "@/hooks/use-data";

export default function FindDonors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bloodType, setBloodType] = useState("all");
  const [maxDistance, setMaxDistance] = useState("25");
  const [availability, setAvailability] = useState("any");
  const [sortBy, setSortBy] = useState("distance");

  // Use real inventory data
  const { inventory: inventoryData, loading: inventoryLoading, error: inventoryError, refetch: refetchInventory } = useBloodInventory();

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching with parameters:", { searchQuery, bloodType, maxDistance, availability, sortBy });
  };

  return (
    <>
      <Helmet>
        <title>Find Blood Donors - Jiwandan</title>
        <meta name="description" content="Locate blood donors near you. Search by location and blood type to find compatible donors for your needs." />
        <meta property="og:title" content="Find Blood Donors - Jiwandan" />
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
                  <Select
                    value={bloodType}
                    onValueChange={(value) => setBloodType(value)}
                  >
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

                  <Select value={sortBy} onValueChange={setSortBy}>
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
                    <form onSubmit={handleSearch} className="space-y-4">
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
                          {[
                            "A+", "B+", "AB+", "O+",
                            "A-", "B-", "AB-", "O-"
                          ].map((type) => (
                            <Button
                              key={type}
                              type="button"
                              variant={bloodType === type ? "default" : "outline"}
                              size="sm"
                              onClick={() => setBloodType(prev => prev === type ? "all" : type)}
                              className="flex items-center justify-center h-10"
                            >
                              {type}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="distance">Maximum Distance</Label>
                        <Select value={maxDistance} onValueChange={setMaxDistance}>
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
                        <Select value={availability} onValueChange={setAvailability}>
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
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          Blood Inventory Status
                        </CardTitle>
                        <CardDescription>Current inventory levels</CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={refetchInventory}
                        disabled={inventoryLoading}
                      >
                        <RefreshCw className={`h-4 w-4 ${inventoryLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {inventoryLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <span className="text-sm text-gray-600">Loading inventory...</span>
                        </div>
                      </div>
                    ) : inventoryError ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-red-600 mb-2">Failed to load inventory</p>
                        <Button size="sm" onClick={refetchInventory}>Try Again</Button>
                      </div>
                    ) : inventoryData.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No inventory data available</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inventoryData.slice(0, 6).map((item) => {
                          const units = item.units || 0;
                          const maxUnits = 200; // Assume max capacity
                          const percentage = Math.min((units / maxUnits) * 100, 100);
                          const status = percentage < 20 ? 'Critical' : percentage < 50 ? 'Low' : percentage < 80 ? 'Adequate' : 'Good';
                          const statusColor = percentage < 20 ? 'text-red-600' : percentage < 50 ? 'text-yellow-600' : percentage < 80 ? 'text-blue-600' : 'text-green-600';
                          const barColor = percentage < 20 ? 'bg-red-500' : percentage < 50 ? 'bg-yellow-500' : percentage < 80 ? 'bg-blue-500' : 'bg-green-500';

                          return (
                            <div key={item.id || item.type}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center">
                                  <BloodTypeBadge type={item.type} size="sm" className="mr-2" />
                                  {item.type} {item.type === 'O-' ? '(Universal)' : ''}
                                </span>
                                <span className={`font-medium ${statusColor}`}>{status}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`${barColor} h-2 rounded-full transition-all duration-300`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{units} units</span>
                                <span>{item.location || 'Unknown location'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Map and Results */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                <Tabs defaultValue="map" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="map">Map View</TabsTrigger>
                    <TabsTrigger value="list">List View</TabsTrigger>
                  </TabsList>

                  {bloodType !== "all" && (
                    <div className="mb-4 flex items-center space-x-2 bg-blue-50 border border-blue-200 p-2 rounded-md">
                      <div className="text-blue-700 text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Currently showing <strong>{bloodType}</strong> blood type donors
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 px-2 text-xs"
                          onClick={() => setBloodType("all")}
                        >
                          Clear filter
                        </Button>
                      </div>
                    </div>
                  )}

                  <TabsContent value="map" className="min-h-[400px]">
                    <Card>
                      <CardContent className="p-0 overflow-hidden rounded-lg">
                        {/* Static wrapper to prevent re-mounting + Error boundary */}
                        <ErrorBoundary fallback={
                          <div className="flex items-center justify-center h-[400px] bg-gray-50">
                            <div className="text-center p-6">
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Map Error</h3>
                              <p className="text-gray-500 mb-4">
                                There was a problem loading the map.
                                Please refresh the page to try again.
                              </p>
                              <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                              >
                                Refresh Page
                              </Button>
                            </div>
                          </div>
                        }>
                          <div className="donor-map-container" style={{ height: '450px', position: 'relative', minWidth: '600px' }}>
                            <RealGoogleDonorMap bloodTypeFilter={bloodType} />
                          </div>
                        </ErrorBoundary>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="list">
                    <DonorList bloodType={bloodType} searchQuery={searchQuery} />
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

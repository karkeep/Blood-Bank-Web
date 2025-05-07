import { useQuery } from "@tanstack/react-query";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type City = {
  id: string;
  name: string;
  value: number;
  percentage?: number;
  status?: "Critical" | "Low" | "Stable";
  inventoryLevels?: {
    type: string;
    percentage: number;
    status?: string;
  }[];
}

export function AnalyticsDashboard() {
  const [bloodTypeFilter, setBloodTypeFilter] = useState("All Types");
  
  const { data: topDonorCities } = useQuery<City[]>({
    queryKey: ["/api/top-donor-cities"],
    initialData: [],
  });
  
  const { data: citiesNeedingDonors } = useQuery<City[]>({
    queryKey: ["/api/cities-needing-donors"],
    initialData: [],
  });
  
  const { data: cityInventory } = useQuery<City[]>({
    queryKey: ["/api/city-inventory"],
    initialData: [],
  });

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Blood Donation Analytics</h2>
        <p className="text-gray-600 text-center mb-8">See where donations are needed most</p>
        
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-8">
          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2 md:mb-0">City Blood Inventory</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={bloodTypeFilter === "All Types" ? "default" : "outline"}
                onClick={() => setBloodTypeFilter("All Types")}
                className="text-sm px-3 py-1 h-auto"
              >
                All Types
              </Button>
              <Button 
                variant={bloodTypeFilter === "A+" ? "default" : "outline"}
                onClick={() => setBloodTypeFilter("A+")}
                className="text-sm px-3 py-1 h-auto bg-blood-type-apos hover:bg-blood-type-apos/80 text-white border-none"
              >
                A+
              </Button>
              <Button 
                variant={bloodTypeFilter === "B+" ? "default" : "outline"}
                onClick={() => setBloodTypeFilter("B+")}
                className="text-sm px-3 py-1 h-auto bg-blood-type-bpos hover:bg-blood-type-bpos/80 text-white border-none"
              >
                B+
              </Button>
              <Button 
                variant={bloodTypeFilter === "AB+" ? "default" : "outline"}
                onClick={() => setBloodTypeFilter("AB+")}
                className="text-sm px-3 py-1 h-auto bg-blood-type-abpos hover:bg-blood-type-abpos/80 text-white border-none"
              >
                AB+
              </Button>
              <Button 
                variant={bloodTypeFilter === "O+" ? "default" : "outline"}
                onClick={() => setBloodTypeFilter("O+")}
                className="text-sm px-3 py-1 h-auto bg-blood-type-opos hover:bg-blood-type-opos/80 text-white border-none"
              >
                O+
              </Button>
              <Button 
                variant={bloodTypeFilter === "O-" ? "default" : "outline"}
                onClick={() => setBloodTypeFilter("O-")}
                className="text-sm px-3 py-1 h-auto bg-blood-type-oneg hover:bg-blood-type-oneg/80 text-white border-none"
              >
                O-
              </Button>
            </div>
          </div>
          
          <div className="map-container rounded-lg mb-4 overflow-hidden" id="cityMap">
            <div className="map-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-4xl text-gray-400 mb-2">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                <line x1="9" x2="9" y1="3" y2="18"></line>
                <line x1="15" x2="15" y1="6" y2="21"></line>
              </svg>
              <p className="text-gray-500">Interactive map showing donor locations</p>
              
              {/* These markers would be dynamically positioned based on real data in a production app */}
              <div className="location-marker" style={{ backgroundColor: "#d32f2f", top: "40%", left: "30%" }}></div>
              <div className="location-marker" style={{ backgroundColor: "#d32f2f", top: "35%", left: "32%" }}></div>
              <div className="location-marker" style={{ backgroundColor: "#d32f2f", top: "42%", left: "28%" }}></div>
              <div className="cluster-marker" style={{ top: "55%", left: "60%" }}>12</div>
              <div className="location-marker" style={{ backgroundColor: "#2e7d32", top: "65%", left: "40%" }}></div>
              <div className="location-marker" style={{ backgroundColor: "#2e7d32", top: "60%", left: "45%" }}></div>
              <div className="location-marker" style={{ backgroundColor: "#1976d2", top: "50%", left: "70%" }}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cityInventory.length > 0 ? (
              cityInventory.map((city) => (
                <CityInventoryCard key={city.id} city={city} />
              ))
            ) : (
              <>
                <CityInventoryCard 
                  city={{
                    id: "1",
                    name: "New York City",
                    status: "Critical",
                    inventoryLevels: [
                      { type: "O-", percentage: 10 },
                      { type: "A+", percentage: 45 }
                    ]
                  }}
                />
                <CityInventoryCard 
                  city={{
                    id: "2",
                    name: "Los Angeles",
                    status: "Low",
                    inventoryLevels: [
                      { type: "B+", percentage: 30 },
                      { type: "AB-", percentage: 55 }
                    ]
                  }}
                />
                <CityInventoryCard 
                  city={{
                    id: "3",
                    name: "Chicago",
                    status: "Stable",
                    inventoryLevels: [
                      { type: "A-", percentage: 85 },
                      { type: "O+", percentage: 90 }
                    ]
                  }}
                />
                <CityInventoryCard 
                  city={{
                    id: "4",
                    name: "Houston",
                    status: "Critical",
                    inventoryLevels: [
                      { type: "O+", percentage: 25 },
                      { type: "B-", percentage: 15 }
                    ]
                  }}
                />
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Top Donor Cities</h3>
            <div className="space-y-3">
              {topDonorCities.length > 0 ? (
                topDonorCities.map((city, index) => (
                  <CityBar
                    key={city.id}
                    rank={index + 1}
                    name={city.name}
                    value={city.value}
                    percentage={city.percentage || 100 - (index * 10)}
                    color="green"
                  />
                ))
              ) : (
                <>
                  <CityBar rank={1} name="San Francisco" value={1245} percentage={100} color="green" />
                  <CityBar rank={2} name="Seattle" value={1053} percentage={85} color="green" />
                  <CityBar rank={3} name="Boston" value={928} percentage={75} color="green" />
                  <CityBar rank={4} name="Austin" value={804} percentage={65} color="green" />
                  <CityBar rank={5} name="Denver" value={682} percentage={55} color="green" />
                </>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Cities Needing Donors</h3>
            <div className="space-y-3">
              {citiesNeedingDonors.length > 0 ? (
                citiesNeedingDonors.map((city, index) => (
                  <CityBar
                    key={city.id}
                    rank={index + 1}
                    name={city.name}
                    value={city.value}
                    percentage={city.percentage || 100 - (index * 10)}
                    color="red"
                    valuePrefix="-"
                    valueSuffix="%"
                  />
                ))
              ) : (
                <>
                  <CityBar rank={1} name="Detroit" value={68} percentage={100} color="red" valuePrefix="-" valueSuffix="%" />
                  <CityBar rank={2} name="Cleveland" value={62} percentage={90} color="red" valuePrefix="-" valueSuffix="%" />
                  <CityBar rank={3} name="Memphis" value={55} percentage={80} color="red" valuePrefix="-" valueSuffix="%" />
                  <CityBar rank={4} name="El Paso" value={48} percentage={70} color="red" valuePrefix="-" valueSuffix="%" />
                  <CityBar rank={5} name="Baltimore" value={42} percentage={60} color="red" valuePrefix="-" valueSuffix="%" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CityInventoryCard({ city }: { city: City }) {
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "Low":
        return "bg-yellow-100 text-yellow-800";
      case "Stable":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 30) return "bg-red-500";
    if (percentage <= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-gray-700">{city.name}</h4>
        <Badge className={getStatusColor(city.status)}>{city.status}</Badge>
      </div>
      
      {city.inventoryLevels?.map((level, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>{level.type}</span>
            <span>{level.percentage}% of need</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className={`${getProgressColor(level.percentage)} h-2 rounded-full`} 
              style={{ width: `${level.percentage}%` }}
            ></div>
          </div>
        </div>
      ))}
      
      <Button variant="link" className="mt-2 w-full text-primary hover:text-primary-dark text-sm font-medium">
        View Details
      </Button>
    </div>
  );
}

function CityBar({ 
  rank, 
  name, 
  value, 
  percentage, 
  color,
  valuePrefix = "",
  valueSuffix = ""
}: { 
  rank: number; 
  name: string; 
  value: number;
  percentage: number;
  color: "green" | "red";
  valuePrefix?: string;
  valueSuffix?: string;
}) {
  const bgColor = color === "green" ? "bg-green-100" : "bg-red-100";
  const textColor = color === "green" ? "text-green-600" : "text-red-600";

  return (
    <div className="flex items-center">
      <div className="w-8 flex-shrink-0 text-gray-500 font-medium">{rank}.</div>
      <div className="flex-grow">
        <div 
          className={`${bgColor} rounded-full h-6 flex items-center pl-3`}
          style={{ width: `${percentage}%` }}
        >
          <span className="text-sm text-gray-700 font-medium">{name}</span>
        </div>
      </div>
      <div className={`w-16 text-right text-sm font-medium ${textColor}`}>
        {valuePrefix}{value}{valueSuffix}
      </div>
    </div>
  );
}

/**
 * Analytics Dashboard Component
 * Displays real-time blood donation analytics from Supabase
 */
import { useState } from "react";
import { Loader2, MapPin, TrendingUp, TrendingDown, BarChart3, Users } from "lucide-react";
import {
  useCityInventory,
  useCityDonorStats,
  useCitiesNeedingDonors,
  CityInventory
} from "@/hooks/use-homepage-analytics";

// Blood type filter options
const BLOOD_TYPES = ["All Types", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function AnalyticsDashboard() {
  const [bloodTypeFilter, setBloodTypeFilter] = useState("All Types");

  // Fetch real data from Supabase
  const { inventoryByCity, getCityStatus, isLoading: inventoryLoading } = useCityInventory();
  const { cities: topDonorCities, isLoading: topCitiesLoading } = useCityDonorStats({ limit: 5 });
  const { cities: citiesNeedingDonors, isLoading: needingLoading } = useCitiesNeedingDonors({ limit: 5 });

  const isLoading = inventoryLoading || topCitiesLoading || needingLoading;

  // Filter inventory by blood type
  const getFilteredInventory = (cityName: string): CityInventory[] => {
    const cityItems = inventoryByCity[cityName] || [];
    if (bloodTypeFilter === "All Types") {
      return cityItems.slice(0, 2); // Show top 2 blood types per city
    }
    return cityItems.filter(item => item.bloodType === bloodTypeFilter);
  };

  // Calculate max donor count for bar width
  const maxDonorCount = topDonorCities.length > 0
    ? Math.max(...topDonorCities.map(c => c.totalDonors))
    : 1;

  // Calculate max deficit for bar width
  const maxDeficit = citiesNeedingDonors.length > 0
    ? Math.max(...citiesNeedingDonors.map(c => c.deficitPercentage))
    : 1;

  return (
    <section className="py-12 bg-red-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-red-800 mb-2 text-center">Blood Donation Analytics</h2>
        <p className="text-red-600 text-center mb-8">See where donations are needed most</p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : (
          <>
            {/* City Blood Inventory Section */}
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-8 border border-red-200">
              <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                <h3 className="text-lg font-bold text-red-800 mb-2 md:mb-0 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  City Blood Inventory
                </h3>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setBloodTypeFilter(type)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${bloodTypeFilter === type
                          ? "bg-red-800 text-white"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Map Placeholder */}
              <div className="map-container rounded-lg mb-4 overflow-hidden border border-red-100 bg-red-50 p-8">
                <div className="flex flex-col items-center justify-center text-red-400">
                  <MapPin className="w-10 h-10 mb-2" />
                  <p className="text-red-600">Interactive map showing blood bank locations</p>
                  <p className="text-sm text-red-400 mt-1">
                    {Object.keys(inventoryByCity).length} cities with inventory data
                  </p>
                </div>
              </div>

              {/* City Inventory Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.keys(inventoryByCity).slice(0, 4).map((cityName) => (
                  <CityInventoryCard
                    key={cityName}
                    cityName={cityName}
                    inventory={getFilteredInventory(cityName)}
                    overallStatus={getCityStatus(cityName)}
                  />
                ))}
              </div>
            </div>

            {/* Two Column Layout for Rankings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Donor Cities */}
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-red-200">
                <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Top Donor Cities
                </h3>
                <div className="space-y-3">
                  {topDonorCities.map((city, index) => (
                    <CityBar
                      key={city.city}
                      rank={index + 1}
                      name={city.city}
                      value={city.totalDonors}
                      percentage={(city.totalDonors / maxDonorCount) * 100}
                      color="green"
                    />
                  ))}
                  {topDonorCities.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No donor data available</p>
                  )}
                </div>
              </div>

              {/* Cities Needing Donors */}
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-red-200">
                <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  Cities Needing Donors
                </h3>
                <div className="space-y-3">
                  {citiesNeedingDonors.map((city, index) => (
                    <CityBar
                      key={city.city}
                      rank={index + 1}
                      name={city.city}
                      value={city.deficitPercentage}
                      percentage={(city.deficitPercentage / maxDeficit) * 100}
                      color="red"
                      valuePrefix="-"
                      valueSuffix="%"
                    />
                  ))}
                  {citiesNeedingDonors.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No shortage data available</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/**
 * City Inventory Card Component
 */
interface CityInventoryCardProps {
  cityName: string;
  inventory: CityInventory[];
  overallStatus: 'Critical' | 'Low' | 'Stable';
}

function CityInventoryCard({ cityName, inventory, overallStatus }: CityInventoryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical": return "bg-red-100 text-red-800";
      case "Low": return "bg-amber-100 text-amber-800";
      case "Stable": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 20) return "bg-red-500";
    if (percentage < 50) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-red-50 p-4 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-red-800">{cityName}</h4>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(overallStatus)}`}>
          {overallStatus}
        </span>
      </div>

      {inventory.length > 0 ? (
        <>
          {inventory.map((item) => (
            <div key={item.bloodType} className="mb-3">
              <div className="flex justify-between text-sm text-red-700 mb-1">
                <span className="font-medium">{item.bloodType}</span>
                <span>{Math.round(item.fillPercentage)}% of need</span>
              </div>
              <div className="w-full bg-red-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(item.fillPercentage)}`}
                  style={{ width: `${Math.min(item.fillPercentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </>
      ) : (
        <p className="text-sm text-gray-400 text-center py-2">No inventory data</p>
      )}

      <button className="mt-2 w-full text-red-800 hover:text-red-900 text-sm font-medium hover:underline">
        View Details
      </button>
    </div>
  );
}

/**
 * City Bar Component for rankings
 */
interface CityBarProps {
  rank: number;
  name: string;
  value: number;
  percentage: number;
  color: "green" | "red";
  valuePrefix?: string;
  valueSuffix?: string;
}

function CityBar({ rank, name, value, percentage, color, valuePrefix = "", valueSuffix = "" }: CityBarProps) {
  const barColor = color === "green" ? "bg-green-400" : "bg-red-400";
  const textColor = color === "green" ? "text-green-700" : "text-red-700";

  return (
    <div className="flex items-center">
      <div className="w-8 flex-shrink-0 text-red-600 font-medium">{rank}.</div>
      <div className="flex-grow">
        <div
          className={`${barColor} rounded-full h-6 flex items-center pl-3 transition-all duration-500`}
          style={{ width: `${Math.max(percentage, 30)}%` }}
        >
          <span className="text-sm text-white font-medium truncate">{name}</span>
        </div>
      </div>
      <div className={`w-16 text-right text-sm font-medium ${textColor}`}>
        {valuePrefix}{Math.round(value)}{valueSuffix}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;

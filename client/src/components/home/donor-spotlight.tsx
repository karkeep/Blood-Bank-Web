import { useQuery } from "@tanstack/react-query";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";

type Donor = {
  id: string;
  name: string;
  badge: "Gold" | "Silver" | "Bronze";
  bloodType: string;
  donations: number;
  liters: number;
  livesSaved: number;
}

export function DonorSpotlight() {
  const { data: topDonors } = useQuery<Donor[]>({
    queryKey: ["/api/top-donors"],
    initialData: [],
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Top Donor Spotlight</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topDonors.length > 0 ? (
            topDonors.map((donor) => (
              <DonorCard key={donor.id} donor={donor} />
            ))
          ) : (
            <>
              <DonorCard 
                donor={{
                  id: "1",
                  name: "Anonymous Hero",
                  badge: "Gold",
                  bloodType: "A+",
                  donations: 24,
                  liters: 10.8,
                  livesSaved: 72
                }} 
              />
              <DonorCard 
                donor={{
                  id: "2",
                  name: "Anonymous Hero",
                  badge: "Silver",
                  bloodType: "B+",
                  donations: 18,
                  liters: 8.1,
                  livesSaved: 54
                }} 
              />
              <DonorCard 
                donor={{
                  id: "3",
                  name: "Anonymous Hero",
                  badge: "Bronze",
                  bloodType: "O-",
                  donations: 12,
                  liters: 5.4,
                  livesSaved: 36
                }} 
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function DonorCard({ donor }: { donor: Donor }) {
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Gold":
        return "bg-secondary text-white";
      case "Silver":
        return "bg-secondary text-white";
      case "Bronze":
        return "bg-secondary text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  return (
    <div className="donor-card bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="h-32 bg-gray-200 relative">
        {/* Blurred portrait placeholder */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-gray-900/20 flex items-end p-4">
          <div className="w-full flex justify-between items-end">
            <div>
              <span className="text-white font-medium">{donor.name}</span>
              <div className="flex items-center mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(donor.badge)}`}>
                  {donor.badge} Donor
                </span>
              </div>
            </div>
            <BloodTypeBadge type={donor.bloodType as any} />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800">{donor.donations}</p>
            <p className="text-xs text-gray-500">Donations</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{donor.liters}L</p>
            <p className="text-xs text-gray-500">Blood Donated</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{donor.livesSaved}</p>
            <p className="text-xs text-gray-500">Lives Saved</p>
          </div>
        </div>
      </div>
    </div>
  );
}

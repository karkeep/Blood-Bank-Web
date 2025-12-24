import { useTopDonors, TopDonor } from "@/hooks/use-homepage-analytics";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { Loader2, Award, Droplet, Heart } from "lucide-react";

export function DonorSpotlight() {
  const { donors, isLoading } = useTopDonors({ limit: 3, anonymize: true });

  return (
    <section className="py-12 bg-red-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-red-800 mb-8 text-center">Top Donor Spotlight</h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No donor data available yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Be the first to donate and become a blood hero!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {donors.map((donor, index) => (
              <DonorCard key={donor.id} donor={donor} rank={index + 1} />
            ))}

            {/* Fill remaining slots with placeholder cards if needed */}
            {donors.length < 3 && Array.from({ length: 3 - donors.length }).map((_, index) => (
              <PlaceholderDonorCard key={`placeholder-${index}`} rank={donors.length + index + 1} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DonorCard({ donor, rank }: { donor: TopDonor; rank: number }) {
  const getBadgeColor = (badge: string) => {
    switch (badge.toLowerCase()) {
      case "diamond": return "bg-gradient-to-r from-cyan-400 to-blue-500 text-white";
      case "platinum": return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case "gold": return "bg-yellow-600 text-white";
      case "silver": return "bg-gray-400 text-white";
      case "bronze": return "bg-amber-700 text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  const getRankGradient = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-t from-yellow-900/80 to-yellow-700/20";
      case 2: return "bg-gradient-to-t from-gray-900/80 to-gray-700/20";
      case 3: return "bg-gradient-to-t from-amber-900/80 to-amber-700/20";
      default: return "bg-gradient-to-t from-red-900/80 to-red-700/20";
    }
  };

  return (
    <div className="donor-card bg-white rounded-xl shadow-md overflow-hidden border border-red-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="h-32 bg-red-200 relative">
        <div className={`absolute inset-0 ${getRankGradient(rank)} flex items-end p-4`}>
          <div className="w-full flex justify-between items-end">
            <div>
              <span className="text-white font-medium">{donor.displayName}</span>
              <div className="flex items-center mt-1 gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(donor.badge)}`}>
                  <Award className="w-3 h-3 inline mr-1" />
                  {donor.badge.charAt(0).toUpperCase() + donor.badge.slice(1)} Donor
                </span>
              </div>
            </div>
            <BloodTypeBadge type={donor.bloodType as any} />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-red-50 rounded-lg p-2">
            <p className="text-2xl font-bold text-red-800">{donor.totalDonations}</p>
            <p className="text-xs text-red-600 flex items-center justify-center gap-1">
              <Droplet className="w-3 h-3" /> Donations
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-2">
            <p className="text-2xl font-bold text-red-800">{donor.litersDonated.toFixed(1)}L</p>
            <p className="text-xs text-red-600">Blood Donated</p>
          </div>
          <div className="bg-red-50 rounded-lg p-2">
            <p className="text-2xl font-bold text-red-800">{donor.livesSaved}</p>
            <p className="text-xs text-red-600 flex items-center justify-center gap-1">
              <Heart className="w-3 h-3" /> Lives Saved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderDonorCard({ rank }: { rank: number }) {
  return (
    <div className="donor-card bg-white/50 rounded-xl shadow-md overflow-hidden border border-red-100 border-dashed">
      <div className="h-32 bg-red-100 relative flex items-center justify-center">
        <div className="text-center text-red-300">
          <Award className="w-10 h-10 mx-auto mb-2" />
          <p className="text-sm">Become a top donor!</p>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-2xl font-bold text-gray-300">--</p>
            <p className="text-xs text-gray-400">Donations</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-2xl font-bold text-gray-300">--</p>
            <p className="text-xs text-gray-400">Blood Donated</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-2xl font-bold text-gray-300">--</p>
            <p className="text-xs text-gray-400">Lives Saved</p>
          </div>
        </div>
      </div>
    </div>
  );
}
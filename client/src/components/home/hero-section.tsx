import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Heart, CheckCircle, AlertCircle, Sparkles, Droplets, Users, Loader2 } from "lucide-react";
import { JiwandanLogoEnhanced } from "@/components/ui/jiwandan-logo";
import { memo, useEffect, useState } from "react";
import { useDashboardStats, useEmergencyRequests } from "@/hooks/use-data";

type RecentActivity = {
  id: string;
  type: "match" | "fulfilled" | "request";
  icon: typeof Heart | typeof CheckCircle | typeof AlertCircle;
  bg: string;
  message: string;
  timeAgo: string;
}

function formatTimeAgo(date: Date | string | undefined): string {
  if (!date) return 'Recently';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export const HeroSection = memo(function HeroSection() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { requests, loading: requestsLoading } = useEmergencyRequests();

  // Transform real emergency requests into activity items
  const recentActivities: RecentActivity[] = requests.slice(0, 3).map((req: any, index: number) => {
    const icons = [Heart, CheckCircle, AlertCircle];
    const bgs = ["from-red-500 to-red-600", "from-green-500 to-green-600", "from-amber-500 to-orange-500"];
    const types: ("match" | "fulfilled" | "request")[] = ["request", "fulfilled", "match"];

    const bloodType = req.bloodType || req.blood_type || 'Blood';
    // location is an object {latitude, longitude}, use hospital/city/hospitalAddress instead
    const location = req.city || req.hospital || req.hospitalAddress || 'your area';
    const status = req.status || 'pending';

    let message = '';
    let activityType = types[index % 3];
    let icon = icons[index % 3];
    let bg = bgs[index % 3];

    if (status === 'fulfilled' || status === 'completed') {
      message = `${bloodType} request fulfilled in ${location}`;
      icon = CheckCircle;
      bg = "from-green-500 to-green-600";
      activityType = 'fulfilled';
    } else if (status === 'matched') {
      message = `${bloodType} donor matched in ${location}`;
      icon = Heart;
      bg = "from-red-500 to-red-600";
      activityType = 'match';
    } else {
      message = `New ${bloodType} request in ${location}`;
      icon = AlertCircle;
      bg = "from-amber-500 to-orange-500";
      activityType = 'request';
    }

    return {
      id: req.id || String(index),
      type: activityType,
      icon,
      bg,
      message,
      timeAgo: formatTimeAgo(req.createdAt || req.created_at || req.timestamp)
    };
  });

  // Fallback activities if no real data
  const defaultActivities: RecentActivity[] = [
    { id: '1', type: 'match', icon: Heart, bg: "from-red-500 to-red-600", message: "A+ donor matched", timeAgo: "2 minutes ago" },
    { id: '2', type: 'fulfilled', icon: CheckCircle, bg: "from-green-500 to-green-600", message: "Emergency request fulfilled", timeAgo: "15 minutes ago" },
    { id: '3', type: 'request', icon: AlertCircle, bg: "from-amber-500 to-orange-500", message: "New O- request", timeAgo: "28 minutes ago" }
  ];

  const activitiesToShow = recentActivities.length > 0 ? recentActivities : defaultActivities;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Dark Rich Red Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 25%, #b91c1c 50%, #991b1b 75%, #7f1d1d 100%)'
        }}
      />

      {/* Subtle Dark Mesh Overlay for depth */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(0, 0, 0, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(0, 0, 0, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `
        }}
      />

      {/* Subtle Animated Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2 text-white animate-blur-in">
            {/* Logo with glow */}
            <div className="mb-8">
              <JiwandanLogoEnhanced size="xl" withText={true} animated={true} />
            </div>

            {/* Headline - bright white for maximum contrast */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              Save Lives with Your
              <span className="block bg-gradient-to-r from-green-300 via-emerald-200 to-green-300 bg-clip-text text-transparent">
                Blood Donation
              </span>
            </h1>

            <p className="text-lg md:text-xl mb-10 text-white/90 max-w-lg leading-relaxed drop-shadow-md">
              Connect directly with people in need during emergencies. Your donation can save up to <span className="font-bold text-green-300">3 lives</span>.
            </p>

            {/* Premium CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button
                  size="xl"
                  className="w-full sm:w-auto bg-white text-red-700 hover:bg-white/90 hover:text-red-800 font-bold shadow-2xl hover:shadow-white/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <Droplets className="mr-2 h-5 w-5" />
                  Become a Donor
                </Button>
              </Link>
              <Button
                variant="outline"
                size="xl"
                className="w-full sm:w-auto border-2 border-white/60 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white"
                onClick={() => {
                  const howItWorksSection = document.getElementById('how-it-works');
                  if (howItWorksSection) {
                    howItWorksSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>

            {/* Quick Stats - Real Data */}
            <div className="flex gap-8 mt-12">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5 text-green-300" />
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <span className="text-3xl font-bold text-white drop-shadow-lg">
                      {stats.activeDonors > 0 ? stats.activeDonors.toLocaleString() : '10K+'}
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-sm mt-1 font-medium">Active Donors</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Heart className="h-5 w-5 text-green-300" />
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <span className="text-3xl font-bold text-white drop-shadow-lg">
                      {stats.totalUsers > 0 ? Math.floor(stats.totalUsers * 3).toLocaleString() : '5K+'}
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-sm mt-1 font-medium">Lives Saved</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-300" />
                  {statsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <span className="text-3xl font-bold text-white drop-shadow-lg">
                      {stats.emergencyRequests > 0 ? stats.emergencyRequests : '0'}
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-sm mt-1 font-medium">Active Requests</p>
              </div>
            </div>
          </div>

          {/* Right Column - Glass Activity Card */}
          <div className="lg:w-1/2 w-full animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="backdrop-blur-xl bg-black/30 border border-white/20 rounded-2xl p-8 relative shadow-2xl">
              {/* Subtle glow behind card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-transparent to-green-500/20 rounded-3xl blur-xl -z-10" />

              <div className="relative">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
                  <Badge className="bg-green-500 text-white px-4 py-1.5 rounded-full shadow-lg shadow-green-500/40">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                      Live
                    </span>
                  </Badge>
                </div>

                <div className="space-y-4">
                  {requestsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-white/60" />
                    </div>
                  ) : (
                    activitiesToShow.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/15 transition-colors"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activity.bg} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <activity.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{activity.message}</p>
                          <p className="text-sm text-white/60">{activity.timeAgo}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Bottom CTA in card */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <Link href="/find-donors">
                    <Button className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg hover:shadow-red-500/30">
                      View All Activity
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

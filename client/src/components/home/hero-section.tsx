import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Heart, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type RecentActivity = {
  id: string;
  type: "match" | "fulfilled" | "request";
  message: string;
  timeAgo: string;
}

export function HeroSection() {
  const { data: recentActivities } = useQuery<RecentActivity[]>({
    queryKey: ["/api/recent-activities"],
    initialData: [],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "match":
        return <Heart className="text-white" />;
      case "fulfilled":
        return <CheckCircle className="text-white" />;
      case "request":
        return <AlertCircle className="text-white" />;
      default:
        return <Heart className="text-white" />;
    }
  };

  const getActivityBgClass = (type: string) => {
    switch (type) {
      case "match":
        return "bg-accent";
      case "fulfilled":
        return "bg-secondary";
      case "request":
        return "bg-primary-light";
      default:
        return "bg-accent";
    }
  };

  return (
    <section className="bg-gradient-to-r from-primary-dark to-primary py-12 md:py-20 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Save Lives with Your Blood Donation</h1>
            <p className="text-lg mb-8 text-white/90">Connect directly with people in need during emergencies. Your donation can save up to 3 lives.</p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="/auth">
                <Button className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-6 rounded-lg shadow-md">
                  Become a Donor
                </Button>
              </Link>
              <Button variant="outline" className="bg-transparent hover:bg-white/10 border-2 border-white text-white font-bold py-3 px-6 rounded-lg">
                Learn More
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recent Activity</h2>
                <Badge variant="outline" className="bg-white/20 text-white border-0 px-3 py-1 rounded-full">Live Updates</Badge>
              </div>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center p-3 bg-white/5 rounded-lg">
                      <div className={`w-10 h-10 rounded-full ${getActivityBgClass(activity.type)} flex items-center justify-center`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{activity.message}</p>
                        <p className="text-sm text-white/70">{activity.timeAgo}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center p-3 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                        <Heart className="text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">A+ donor matched in New York</p>
                        <p className="text-sm text-white/70">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <CheckCircle className="text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">Emergency request fulfilled in Chicago</p>
                        <p className="text-sm text-white/70">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                        <AlertCircle className="text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">New O- request in Los Angeles</p>
                        <p className="text-sm text-white/70">28 minutes ago</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

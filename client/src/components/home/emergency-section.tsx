import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield } from "lucide-react";

export function EmergencySection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-2/3 p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Need Blood Urgently?</h2>
              <p className="mb-6">If you or someone you know needs blood immediately, create an emergency request. Our system will match you with nearby compatible donors.</p>
              <Link href="/emergency">
                <Button className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-6 rounded-lg shadow-md">
                  Create Emergency Request
                </Button>
              </Link>
            </div>
            <div className="md:w-1/3 bg-white/10 p-6 flex flex-col justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
                <h3 className="font-bold text-white text-lg mb-2">Emergency Stats</h3>
                <div className="flex justify-between items-center text-white/90 mb-2">
                  <span>Avg. response time</span>
                  <span className="font-medium">8 minutes</span>
                </div>
                <div className="flex justify-between items-center text-white/90 mb-2">
                  <span>Success rate</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="flex justify-between items-center text-white/90">
                  <span>Lives saved this month</span>
                  <span className="font-medium">487</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

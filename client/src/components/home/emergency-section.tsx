import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield } from "lucide-react";

export function EmergencySection() {
  return (
    <section className="py-12 bg-red-50">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-xl shadow-lg overflow-hidden border border-red-300">
          <div className="md:flex">
            <div className="md:w-2/3 p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Need Blood Urgently?</h2>
              <p className="mb-6">If you or someone you know needs blood immediately, create an emergency request. Our system will match you with nearby compatible donors.</p>
              <a href="/emergency-request">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 bg-white text-red-800 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg shadow-md">
                  Create Emergency Request
                </button>
              </a>
            </div>
            <div className="md:w-1/3 bg-red-900/30 p-6 flex flex-col justify-center backdrop-blur-sm">
              <div className="bg-red-900/40 backdrop-blur-sm rounded-lg p-4 mb-4 border border-red-800/30">
                <h3 className="font-bold text-white text-lg mb-2">Emergency Stats</h3>
                <div className="flex justify-between items-center text-white mb-2">
                  <span>Avg. response time</span>
                  <span className="font-medium">8 minutes</span>
                </div>
                <div className="flex justify-between items-center text-white mb-2">
                  <span>Success rate</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="flex justify-between items-center text-white">
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

// client/src/components/ui/lifesaving-network-section.tsx
import { MapPin, Shield, HeartPulse, Heart, Users, Clock } from "lucide-react";
import { memo } from "react";

export const LifesavingNetworkSection = memo(function LifesavingNetworkSection() {
  return (
    <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white p-8 rounded-xl shadow-blood-lg border border-primary-500/20">
      <h2 className="text-2xl font-bold mb-4 text-white">Join Our Lifesaving Network</h2>
      <p className="mb-6 text-primary-100 leading-relaxed">
        Jiwandan connects blood donors with those in need during critical emergencies. 
        Your donation can save up to 3 lives.
      </p>
      
      <div className="space-y-4 mb-8">
        {/* Location-Based Matching */}
        <div className="flex items-start group hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 group-hover:bg-white/20 transition-colors duration-300">
            <MapPin className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Location-Based Matching</h3>
            <p className="text-primary-100 text-sm leading-relaxed">
              Get matched with donors or recipients near you when time is critical.
            </p>
          </div>
        </div>
        
        {/* Secure Verification */}
        <div className="flex items-start group hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 group-hover:bg-white/20 transition-colors duration-300">
            <Shield className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Secure Verification</h3>
            <p className="text-primary-100 text-sm leading-relaxed">
              Our system ensures all donors are properly verified and medically eligible.
            </p>
          </div>
        </div>
        
        {/* Real-time Emergency Response */}
        <div className="flex items-start group hover:bg-white/5 p-3 rounded-lg transition-all duration-300">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 group-hover:bg-white/20 transition-colors duration-300 animate-blood-pulse">
            <HeartPulse className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Real-time Emergency Response</h3>
            <p className="text-primary-100 text-sm leading-relaxed">
              Quick coordination during emergencies with real-time updates and notifications.
            </p>
          </div>
        </div>
      </div>
      
      {/* Testimonial */}
      <div className="p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-inner">
        <blockquote className="text-primary-50 italic text-sm leading-relaxed">
          "I needed a rare blood type for my emergency surgery. Jiwandan found me a compatible donor in minutes. 
          This service literally saved my life."
        </blockquote>
        <cite className="text-primary-200 text-xs mt-2 block font-medium">– Sarah M.</cite>
      </div>
    </div>
  );
});

// Enhanced version with improved blood theme styling
export const LifesavingNetworkSectionEnhanced = memo(function LifesavingNetworkSectionEnhanced() {
  return (
    <div className="relative bg-gradient-to-br from-blood-600 via-blood-700 to-blood-800 text-white p-8 rounded-2xl shadow-2xl border border-blood-500/20 overflow-hidden">
      {/* Background pattern removed - no more decorative dots */}
      
      <div className="relative z-10">
        {/* Header with animated heart icon */}
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 animate-heartbeat border border-white/20">
            <Heart className="w-6 h-6 text-white fill-white/80" />
          </div>
          <h2 className="text-3xl font-bold text-white">Join Our Lifesaving Network</h2>
        </div>
        
        {/* Main description */}
        <p className="mb-8 text-blood-50 text-lg leading-relaxed">
          Jiwandan connects blood donors with those in need during critical emergencies. 
          Every donation has the power to save up to 3 lives.
        </p>
        
        {/* Feature cards */}
        <div className="space-y-4 mb-8">
          {/* Location-Based Matching */}
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-xl hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:border-white/20">
            <div className="flex items-start">
              <div className="w-14 h-14 bg-gradient-to-br from-blood-400 to-blood-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <MapPin className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg mb-2 group-hover:text-blood-50 transition-colors">
                  Location-Based Matching
                </h3>
                <p className="text-blood-100 leading-relaxed">
                  Advanced GPS technology connects you with nearby donors or recipients when every second counts.
                </p>
              </div>
            </div>
          </div>
          
          {/* Secure Verification */}
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-xl hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:border-white/20">
            <div className="flex items-start">
              <div className="w-14 h-14 bg-gradient-to-br from-blood-400 to-blood-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg mb-2 group-hover:text-blood-50 transition-colors">
                  Medical Verification
                </h3>
                <p className="text-blood-100 leading-relaxed">
                  Rigorous verification ensures all donors meet medical eligibility requirements for safe donations.
                </p>
              </div>
            </div>
          </div>
          
          {/* Real-time Emergency Response */}
          <div className="group bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-xl hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:border-white/20">
            <div className="flex items-start">
              <div className="w-14 h-14 bg-gradient-to-br from-blood-400 to-blood-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-blood-pulse">
                <HeartPulse className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg mb-2 group-hover:text-blood-50 transition-colors">
                  Emergency Response
                </h3>
                <p className="text-blood-100 leading-relaxed">
                  Real-time notifications and instant coordination during critical emergency situations.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistics section */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
            <Users className="w-6 h-6 text-blood-200 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">50K+</div>
            <div className="text-xs text-blood-100">Active Donors</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
            <Heart className="w-6 h-6 text-blood-200 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">15K+</div>
            <div className="text-xs text-blood-100">Lives Saved</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
            <Clock className="w-6 h-6 text-blood-200 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">&lt; 30min</div>
            <div className="text-xs text-blood-100">Avg Response</div>
          </div>
        </div>
        
        {/* Enhanced Testimonial */}
        <div className="relative bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-inner overflow-hidden">
          <div className="absolute -top-4 -left-2 text-white/20 text-8xl font-serif select-none">"</div>
          <blockquote className="relative z-10 text-blood-50 italic leading-relaxed pl-6">
            I needed a rare blood type for my emergency surgery. Jiwandan found me a compatible donor in just 20 minutes. 
            This platform literally saved my life. Forever grateful to the donor community.
          </blockquote>
          <div className="mt-4 pt-4 border-t border-white/10">
            <cite className="flex items-center text-blood-100 text-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-blood-400 to-blood-600 rounded-full mr-3 flex items-center justify-center shadow-md">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <div className="font-semibold text-white">Sarah Mitchell</div>
                <div className="text-xs text-blood-200">Life Saved Through Jiwandan</div>
              </div>
            </cite>
          </div>
        </div>
      </div>
    </div>
  );
});

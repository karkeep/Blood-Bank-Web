// client/src/pages/demo-blood-theme.tsx
import { LifesavingNetworkSection, LifesavingNetworkSectionEnhanced } from "@/components/ui/lifesaving-network-section";

export default function DemoBloodTheme() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 space-y-12">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Beautiful Blood Theme Components
          </h1>
          <p className="text-lg text-gray-600">
            Professional blood bank themed UI components with stunning gradients and animations
          </p>
        </div>

        {/* Standard Version */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Standard Blood Theme</h2>
          <LifesavingNetworkSection />
        </div>

        {/* Enhanced Version */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Enhanced Blood Theme</h2>
          <LifesavingNetworkSectionEnhanced />
        </div>

        {/* Color Palette Demo */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Blood Theme Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'blood-50', class: 'bg-blood-50 text-blood-900' },
              { name: 'blood-100', class: 'bg-blood-100 text-blood-900' },
              { name: 'blood-200', class: 'bg-blood-200 text-blood-900' },
              { name: 'blood-300', class: 'bg-blood-300 text-white' },
              { name: 'blood-400', class: 'bg-blood-400 text-white' },
              { name: 'blood-500', class: 'bg-blood-500 text-white' },
              { name: 'blood-600', class: 'bg-blood-600 text-white' },
              { name: 'blood-700', class: 'bg-blood-700 text-white' },
              { name: 'blood-800', class: 'bg-blood-800 text-white' },
              { name: 'blood-900', class: 'bg-blood-900 text-white' },
            ].map((color) => (
              <div key={color.name} className={`${color.class} p-4 rounded-lg text-center font-medium`}>
                {color.name}
              </div>
            ))}
          </div>
        </div>

        {/* Usage Examples */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Usage Examples</h2>
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Button Examples */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Blood Themed Buttons</h3>
              <div className="space-y-3">
                <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-blood transition-all duration-300 hover:shadow-blood-lg">
                  Donate Blood
                </button>
                <button className="bg-blood-gradient text-white font-bold py-3 px-6 rounded-lg shadow-blood-lg hover:shadow-xl transition-all duration-300 animate-blood-pulse">
                  Emergency Request
                </button>
                <button className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-bold py-2 px-4 rounded-lg transition-all duration-300">
                  Find Donors
                </button>
              </div>
            </div>

            {/* Card Examples */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Blood Themed Cards</h3>
              <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
                <h4 className="text-primary-800 font-bold mb-2">Blood Drive Alert</h4>
                <p className="text-primary-700 text-sm">Community blood drive scheduled for this weekend.</p>
              </div>
              <div className="bg-blood-gradient text-white p-4 rounded-lg shadow-blood">
                <h4 className="font-bold mb-2">Emergency Request</h4>
                <p className="text-blood-100 text-sm">A+ blood needed urgently at City Hospital.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Animation Examples */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Animations</h2>
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full animate-blood-pulse mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Blood Pulse</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-life-500 rounded-full animate-heartbeat mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Heartbeat</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LoginForm } from "@/components/auth/login-form";
import { RegistrationForm } from "@/components/auth/registration-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Redirect } from "wouter";
import { Helmet } from "react-helmet";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  
  // Redirect to home if user is already logged in
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }
  
  return (
    <>
      <Helmet>
        <title>Login or Register - LifeLink</title>
        <meta name="description" content="Join LifeLink blood donor network. Create an account or log in to help save lives during emergencies." />
        <meta property="og:title" content="Login or Register - LifeLink" />
        <meta property="og:description" content="Join our global emergency blood donor network. Sign up or login to start saving lives." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left column - Authentication Form */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome to LifeLink</h1>
                
                <Tabs defaultValue="login">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <LoginForm />
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <RegistrationForm />
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Right column - Hero/Info Section */}
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-4">Join Our Lifesaving Network</h2>
                <p className="mb-6">
                  LifeLink connects blood donors with those in need during critical emergencies. 
                  Your donation can save up to 3 lives.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pin">
                        <line x1="12" x2="12" y1="17" y2="22" />
                        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Location-Based Matching</h3>
                      <p className="text-white/80 text-sm">Get matched with donors or recipients near you when time is critical.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Secure Verification</h3>
                      <p className="text-white/80 text-sm">Our system ensures all donors are properly verified and medically eligible.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart-pulse">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        <path d="M3.22 12H9.5l.5-1 .5 2 .5-2 .5 2 .5-2 .5 2 .5-1h6.28" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Real-time Emergency Response</h3>
                      <p className="text-white/80 text-sm">Quick coordination during emergencies with real-time updates and notifications.</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white/10 rounded-lg">
                  <p className="text-white/90 italic text-sm">
                    "I needed a rare blood type for my emergency surgery. LifeLink found me a compatible donor in minutes. 
                    This service literally saved my life." – Sarah M.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

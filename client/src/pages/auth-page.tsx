import { useAuth } from "@/hooks/use-auth-firebase";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LoginForm } from "@/components/auth/login-form";
import { RegistrationForm } from "@/components/auth/registration-form";
import { LifesavingNetworkSectionEnhanced } from "@/components/ui/lifesaving-network-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Redirect } from "wouter";
import { Helmet } from "react-helmet";
import { Heart, Shield, Users } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();

  // Redirect to home if user is already logged in
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <Helmet>
        <title>Login or Register - Jiwandan</title>
        <meta name="description" content="Join Jiwandan blood donor network. Create an account or log in to help save lives during emergencies." />
        <meta property="og:title" content="Login or Register - Jiwandan" />
        <meta property="og:description" content="Join our global emergency blood donor network. Sign up or login to start saving lives." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow relative overflow-hidden">
          {/* Premium Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-red-50/30 to-slate-100" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                radial-gradient(ellipse at 20% 20%, rgba(220, 38, 38, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)
              `
            }}
          />

          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              {/* Left column - Glass Authentication Card */}
              <div className="glass-card-solid p-8 animate-scale-in">
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Jiwandan</h1>
                  <p className="text-gray-600">Join our lifesaving community</p>
                </div>

                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-gray-100/80 rounded-xl">
                    <TabsTrigger
                      value="login"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-red-600 transition-all duration-300"
                    >
                      Login
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-red-600 transition-all duration-300"
                    >
                      Register
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="animate-blur-in">
                    <LoginForm />
                  </TabsContent>

                  <TabsContent value="register" className="animate-blur-in">
                    <RegistrationForm />
                  </TabsContent>
                </Tabs>

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-gray-200/50">
                  <div className="flex justify-center gap-6 text-sm text-gray-500">
                    {[
                      { icon: Shield, text: "Secure" },
                      { icon: Users, text: "10K+ Users" },
                      { icon: Heart, text: "5K+ Lives Saved" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <item.icon className="h-4 w-4 text-red-500" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column - Beautiful Blood-themed Info Section */}
              <div className="hidden lg:block animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                <LifesavingNetworkSectionEnhanced />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
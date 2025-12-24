import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { DonorSpotlight } from "@/components/home/donor-spotlight";
import { AnalyticsDashboard } from "@/components/home/analytics-dashboard";
import { HowItWorks } from "@/components/home/how-it-works";
import { EmergencySection } from "@/components/home/emergency-section";
import { VerificationSection } from "@/components/home/verification-section";
import { EmergencyButton } from "@/components/ui/emergency-button";
import { Helmet } from "react-helmet";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Jiwandan - Emergency Blood Donor Network</title>
        <meta name="description" content="Connect with blood donors in emergency situations. Jiwandan helps you find compatible blood donors nearby when every minute counts." />
        <meta property="og:title" content="Jiwandan - Emergency Blood Donor Network" />
        <meta property="og:description" content="A global emergency blood donor coordination system connecting verified donors with recipients in critical situations." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <HeroSection />
          <DonorSpotlight />
          <AnalyticsDashboard />
          <HowItWorks />
          <EmergencySection />
          <VerificationSection />
        </main>
        <Footer />
        <EmergencyButton />
      </div>
    </>
  );
}
import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard";
import DonorProfile from "@/pages/donor-profile";
import EmergencyRequest from "@/pages/emergency-request";
import EmergencyRooms from "@/pages/emergency-rooms";
import FindDonors from "@/pages/find-donors";
import AdminDashboard from "@/pages/admin-dashboard";
import WorkingAdminDashboard from "@/components/admin/WorkingAdminDashboard";
import { SimpleAdminTest } from "@/components/test/simple-admin-test";
import { AdminDebugPanel } from "@/components/debug/admin-debug-panel";
import { UserDebugInfo } from "@/components/debug/UserDebugInfo";
import { AdminTestPage } from "@/pages/admin-test-page";
import UserSettings from "@/pages/settings";
import Notifications from "@/pages/notifications";
import DemoBloodTheme from "@/pages/demo-blood-theme";

// Import available donor pages
import HowToDonate from "@/pages/donors/how-to-donate";
import EligibilityRequirements from "@/pages/donors/eligibility";
import DonorSafety from "@/pages/donors/safety";
import FrequentDonorProgram from "@/pages/donors/frequent-program";
import VerifyDonorPage from "@/pages/verify-donor";

// Import available patient pages
import EmergencyProtocol from "@/pages/patients/emergency-protocol";
import HospitalIntegration from "@/pages/patients/hospital-integration";
import PatientResources from "@/pages/patients/resources";
import BloodBanks from "@/pages/patients/blood-banks";

// Import available about pages
import OurMission from "@/pages/about/mission";
import PrivacyPolicy from "@/pages/about/privacy";
import TermsOfService from "@/pages/about/terms";
import ContactUs from "@/pages/about/contact";
import FAQ from "@/pages/about/faq";
import DatabaseTestPage from "@/pages/database-test";

// Import organization portal pages
import OrganizationLoginPage from "@/pages/org/login";
import OrganizationDashboardPage from "@/pages/org/dashboard";
import InventoryFormPage from "@/pages/org/inventory-form";
import RoomFormPage from "@/pages/org/room-form";

import { ProtectedRoute } from "./lib/protected-route";
import { AdminProtectedRoute } from "./lib/admin-protected-route";
import { AuthProvider } from "./hooks/use-auth-firebase";
import { ThemeProvider } from "next-themes";

function Router() {
  return (
    <div className="min-h-screen">
      <Switch>
        {/* Main routes */}
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/profile" component={DonorProfile} />
        <Route path="/emergency-request" component={EmergencyRequest} />
        <Route path="/emergency-rooms" component={EmergencyRooms} />
        <Route path="/find-donors" component={FindDonors} />
        <AdminProtectedRoute path="/admin" component={WorkingAdminDashboard} />
        <Route path="/admin-direct" component={WorkingAdminDashboard} />
        <AdminProtectedRoute path="/admin-full" component={AdminDashboard} />
        <Route path="/admin-test" component={() => <AdminProtectedRoute path="/admin-test" component={SimpleAdminTest} />} />
        <Route path="/admin-check" component={AdminTestPage} />
        <Route path="/debug-admin" component={() => <div className="p-8"><AdminDebugPanel /></div>} />
        <Route path="/debug-user" component={() => <div className="p-8"><UserDebugInfo /></div>} />
        <Route path="/demo-blood-theme" component={DemoBloodTheme} />
        <Route path="/database-test" component={DatabaseTestPage} />

        {/* Organization Portal routes */}
        <Route path="/org/login" component={OrganizationLoginPage} />
        <Route path="/org/dashboard" component={OrganizationDashboardPage} />
        <Route path="/org/inventory" component={InventoryFormPage} />
        <Route path="/org/rooms" component={RoomFormPage} />

        {/* Donor information routes */}
        <Route path="/donors/how-to-donate" component={HowToDonate} />
        <Route path="/donors/eligibility" component={EligibilityRequirements} />
        <Route path="/donors/safety" component={DonorSafety} />
        <Route path="/donors/frequent-program" component={FrequentDonorProgram} />
        <Route path="/donors/verify" component={VerifyDonorPage} />
        <ProtectedRoute path="/verify-donor" component={VerifyDonorPage} />
        <Route path="/donors/register" component={AuthPage} /> {/* Redirect to auth page with donor registration form */}

        {/* Patient information routes */}
        <Route path="/patients/emergency-protocol" component={EmergencyProtocol} />
        <Route path="/patients/hospital-integration" component={HospitalIntegration} />
        <Route path="/patients/resources" component={PatientResources} />
        <Route path="/patients/blood-banks" component={BloodBanks} />

        {/* About section routes */}
        <Route path="/about/mission" component={OurMission} />
        <Route path="/about/privacy" component={PrivacyPolicy} />
        <Route path="/about/terms" component={TermsOfService} />
        <Route path="/about/contact" component={ContactUs} />
        <Route path="/about/faq" component={FAQ} />

        {/* User account routes */}
        <ProtectedRoute path="/notifications" component={Notifications} />
        <ProtectedRoute path="/settings" component={UserSettings} />

        {/* 404 fallback route - must be last */}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
// client/src/components/performance/lazy-routes.tsx
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Lazy-loaded components for better performance
export const LazyHomePage = lazy(() => import('@/pages/home-page'));
export const LazyAuthPage = lazy(() => import('@/pages/auth-page'));
export const LazyDonorProfile = lazy(() => import('@/pages/donor-profile'));
export const LazyEmergencyRequest = lazy(() => import('@/pages/emergency-request'));
export const LazyFindDonors = lazy(() => import('@/pages/find-donors'));
export const LazyAdminDashboard = lazy(() => import('@/pages/admin-dashboard'));
export const LazyUserSettings = lazy(() => import('@/pages/settings'));
export const LazyNotifications = lazy(() => import('@/pages/notifications'));

// Donor pages
export const LazyHowToDonate = lazy(() => import('@/pages/donors/how-to-donate'));
export const LazyEligibilityRequirements = lazy(() => import('@/pages/donors/eligibility'));
export const LazyDonorSafety = lazy(() => import('@/pages/donors/safety'));
export const LazyFrequentDonorProgram = lazy(() => import('@/pages/donors/frequent-program'));

// Patient pages
export const LazyEmergencyProtocol = lazy(() => import('@/pages/patients/emergency-protocol'));
export const LazyHospitalIntegration = lazy(() => import('@/pages/patients/hospital-integration'));
export const LazyPatientResources = lazy(() => import('@/pages/patients/resources'));
export const LazyBloodBanks = lazy(() => import('@/pages/patients/blood-banks'));

// About pages
export const LazyOurMission = lazy(() => import('@/pages/about/mission'));
export const LazyPrivacyPolicy = lazy(() => import('@/pages/about/privacy'));
export const LazyTermsOfService = lazy(() => import('@/pages/about/terms'));
export const LazyContactUs = lazy(() => import('@/pages/about/contact'));
export const LazyFAQ = lazy(() => import('@/pages/about/faq'));

// HOC for wrapping lazy components with Suspense
export const withSuspense = (Component: React.LazyExoticComponent<() => JSX.Element>) => {
  return () => (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
};

// Pre-wrapped components
export const HomePage = withSuspense(LazyHomePage);
export const AuthPage = withSuspense(LazyAuthPage);
export const DonorProfile = withSuspense(LazyDonorProfile);
export const EmergencyRequest = withSuspense(LazyEmergencyRequest);
export const FindDonors = withSuspense(LazyFindDonors);
export const AdminDashboard = withSuspense(LazyAdminDashboard);
export const UserSettings = withSuspense(LazyUserSettings);
export const Notifications = withSuspense(LazyNotifications);

export const HowToDonate = withSuspense(LazyHowToDonate);
export const EligibilityRequirements = withSuspense(LazyEligibilityRequirements);
export const DonorSafety = withSuspense(LazyDonorSafety);
export const FrequentDonorProgram = withSuspense(LazyFrequentDonorProgram);

export const EmergencyProtocol = withSuspense(LazyEmergencyProtocol);
export const HospitalIntegration = withSuspense(LazyHospitalIntegration);
export const PatientResources = withSuspense(LazyPatientResources);
export const BloodBanks = withSuspense(LazyBloodBanks);

export const OurMission = withSuspense(LazyOurMission);
export const PrivacyPolicy = withSuspense(LazyPrivacyPolicy);
export const TermsOfService = withSuspense(LazyTermsOfService);
export const ContactUs = withSuspense(LazyContactUs);
export const FAQ = withSuspense(LazyFAQ);

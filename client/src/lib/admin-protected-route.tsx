import { useEffect, useState } from "react";
import { Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth-firebase";
import { Loader2, Shield, AlertCircle } from "lucide-react";

interface AdminProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
}

export function AdminProtectedRoute({ component: Component, path, ...rest }: AdminProtectedRouteProps) {
  const { user, firebaseUser, isLoading, initialized } = useAuth();
  const [, setLocation] = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    
    const checkAdminStatus = async () => {
      console.log('🔍 Checking admin status...', { user, firebaseUser, initialized, isLoading });
      
      setChecking(true);
      setError(null);
      
      try {
        // Wait for auth to be ready
        if (isLoading || !initialized) {
          console.log('⏳ Waiting for auth initialization...');
          return;
        }
        
        // If not authenticated, redirect to login
        if (!firebaseUser || !user) {
          console.log('❌ No authenticated user, redirecting to auth');
          setLocation('/auth');
          return;
        }
        
        console.log('👤 User found:', { 
          email: user.email, 
          role: user.role, 
          isAdmin: user.isAdmin,
          firebaseUid: user.firebaseUid 
        });
        
        // Check admin status from user object first (simpler check)
        const hasAdminRole = user.role === 'admin' || user.role === 'superadmin';
        const hasAdminFlag = user.isAdmin === true;
        
        let adminStatus = hasAdminRole || hasAdminFlag;
        console.log('📋 Basic admin check:', { hasAdminRole, hasAdminFlag, adminStatus });
        
        // If basic check passes, also verify Firebase custom claims
        if (adminStatus) {
          try {
            console.log('🔄 Refreshing Firebase token for custom claims...');
            const tokenResult = await firebaseUser.getIdTokenResult(true);
            const hasAdminClaim = tokenResult.claims.admin === true;
            console.log('🎫 Firebase claims:', tokenResult.claims, 'Admin claim:', hasAdminClaim);
            
            // Admin status is true if either database or claims indicate admin
            adminStatus = adminStatus || hasAdminClaim;
          } catch (claimError) {
            console.warn('⚠️ Could not check Firebase claims, using database admin status:', claimError);
            // If claims check fails, still use database admin status
          }
        }
        
        console.log('✅ Final admin status:', adminStatus);
        
        if (!mounted) return;
        
        setIsAdmin(adminStatus);
        
        // If not admin, redirect to dashboard
        if (!adminStatus) {
          console.log('❌ User is not admin, redirecting to dashboard');
          setLocation('/dashboard');
        }
        
      } catch (error) {
        console.error('💥 Error checking admin status:', error);
        if (!mounted) return;
        
        setError(error instanceof Error ? error.message : 'Unknown error');
        // On error, redirect to dashboard for safety
        setLocation('/dashboard');
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    };

    checkAdminStatus();
    
    return () => {
      mounted = false;
    };
  }, [user, firebaseUser, isLoading, initialized, setLocation]);

  return (
    <Route
      path={path}
      {...rest}
      component={(props: any) => {
        // Show loading while checking authentication or admin status
        if (isLoading || !initialized || checking) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-lg">Verifying admin access...</span>
              </div>
              <div className="text-sm text-gray-600 max-w-md text-center">
                Checking your administrator privileges. This may take a moment.
              </div>
            </div>
          );
        }
        
        // Show error if there was a problem
        if (error) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <h2 className="text-xl font-semibold">Access Error</h2>
              <p className="text-gray-600 max-w-md text-center">{error}</p>
              <button 
                onClick={() => setLocation('/dashboard')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Go to Dashboard
              </button>
            </div>
          );
        }
        
        // If user is authenticated and is admin, render the component
        if (firebaseUser && isAdmin) {
          console.log('🎉 Rendering admin component');
          return <Component {...props} />;
        }
        
        // Fallback loading (shouldn't reach here normally)
        return (
          <div className="flex items-center justify-center min-h-screen">
            <Shield className="h-8 w-8 text-gray-400" />
            <span className="ml-2 text-gray-600">Preparing admin dashboard...</span>
          </div>
        );
      }}
    />
  );
}
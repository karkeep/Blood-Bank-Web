import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth-firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, XCircle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

const AdminCheck = () => {
  const { user, firebaseUser, refreshToken } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [claims, setClaims] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setIsAdmin(user.isAdmin);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    setIsLoading(true);
    try {
      if (!firebaseUser) {
        toast({
          title: "Not authenticated",
          description: "You must be logged in to check admin status.",
          variant: "destructive",
        });
        return;
      }

      // Force token refresh
      await refreshToken();
      
      // Get token result with claims
      const tokenResult = await firebaseUser.getIdTokenResult(true);
      setClaims(tokenResult.claims);

      // Check admin status
      const hasAdminClaim = tokenResult.claims.admin === true;
      const hasAdminFlag = user?.isAdmin === true;
      const isAdminUser = hasAdminClaim || hasAdminFlag;

      setIsAdmin(isAdminUser);

      if (isAdminUser) {
        toast({
          title: "Admin access confirmed",
          description: "You have admin privileges. You can access the admin dashboard.",
        });
      } else {
        toast({
          title: "Not an admin",
          description: "You do not have admin privileges.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast({
        title: "Error checking admin status",
        description: (error as Error).message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShieldCheck className="h-5 w-5 mr-2" />
          Admin Access Check
        </CardTitle>
        <CardDescription>
          Check your admin access status and refresh your session
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>User:</span>
            <span className="font-medium">{user?.username || user?.email || 'Not logged in'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span>Admin Status:</span>
            {isAdmin === undefined ? (
              <span className="text-gray-500">Unknown</span>
            ) : isAdmin ? (
              <span className="flex items-center text-green-600 font-medium">
                <ShieldAlert className="h-4 w-4 mr-1" />
                Admin
              </span>
            ) : (
              <span className="flex items-center text-red-600 font-medium">
                <XCircle className="h-4 w-4 mr-1" />
                Not Admin
              </span>
            )}
          </div>

          {claims && (
            <div>
              <p className="text-sm font-medium mb-1">Token Claims:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-24">
                {JSON.stringify(claims, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <Button onClick={checkAdminStatus} disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Admin Status
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminCheck;

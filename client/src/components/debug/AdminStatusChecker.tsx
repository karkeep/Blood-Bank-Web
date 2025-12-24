import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth-firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, User, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function AdminStatusChecker() {
  const { user, firebaseUser, refreshToken, isLoading, initialized } = useAuth();
  const [adminCheck, setAdminCheck] = useState({
    userRoleCheck: false,
    isAdminFlagCheck: false,
    firebaseClaimsCheck: false,
    overallStatus: false
  });
  const [checking, setChecking] = useState(false);

  const checkAdminStatus = async () => {
    setChecking(true);
    
    try {
      // Check 1: User role
      const roleIsAdmin = user?.role === 'admin' || user?.role === 'superadmin';
      
      // Check 2: isAdmin flag
      const flagIsAdmin = user?.isAdmin === true;
      
      // Check 3: Firebase claims
      let claimsAdmin = false;
      if (firebaseUser) {
        try {
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          claimsAdmin = tokenResult.claims.admin === true;
        } catch (error) {
          console.log('Claims check failed:', error);
        }
      }
      
      const overall = roleIsAdmin || flagIsAdmin || claimsAdmin;
      
      setAdminCheck({
        userRoleCheck: roleIsAdmin,
        isAdminFlagCheck: flagIsAdmin,
        firebaseClaimsCheck: claimsAdmin,
        overallStatus: overall
      });
      
      console.log('🔍 Admin Status Check Results:', {
        user: user,
        userRole: user?.role,
        isAdmin: user?.isAdmin,
        roleCheck: roleIsAdmin,
        flagCheck: flagIsAdmin,
        claimsCheck: claimsAdmin,
        overall: overall
      });
      
    } catch (error) {
      console.error('Admin check error:', error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (user && firebaseUser && initialized && !isLoading) {
      checkAdminStatus();
    }
  }, [user, firebaseUser, initialized, isLoading]);

  const handleRefreshAndCheck = async () => {
    try {
      await refreshToken();
      setTimeout(() => {
        checkAdminStatus();
      }, 1000);
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  if (!initialized || isLoading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Status Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current User Info */}
          <div className="space-y-2">
            <h3 className="font-semibold">Current User Information</h3>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <div><strong>Email:</strong> {user?.email || 'Not found'}</div>
              <div><strong>Username:</strong> {user?.username || 'Not found'}</div>
              <div><strong>Role:</strong> {user?.role || 'Not found'}</div>
              <div><strong>Is Admin Flag:</strong> {user?.isAdmin ? 'true' : 'false'}</div>
              <div><strong>Firebase UID:</strong> {user?.firebaseUid || 'Not found'}</div>
            </div>
          </div>

          {/* Admin Checks */}
          <div className="space-y-3">
            <h3 className="font-semibold">Admin Status Checks</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border rounded">
                <span>Role Check (admin/superadmin)</span>
                {adminCheck.userRoleCheck ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between p-2 border rounded">
                <span>IsAdmin Flag Check</span>
                {adminCheck.isAdminFlagCheck ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between p-2 border rounded">
                <span>Firebase Claims Check</span>
                {adminCheck.firebaseClaimsCheck ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {/* Overall Status */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {adminCheck.overallStatus ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <h3 className="font-semibold">
                Overall Admin Status: {adminCheck.overallStatus ? 'ADMIN' : 'NOT ADMIN'}
              </h3>
            </div>
            
            {adminCheck.overallStatus ? (
              <div className="space-y-2">
                <p className="text-green-600">✅ You have admin privileges!</p>
                <div className="flex gap-2">
                  <Button onClick={() => window.location.href = '/admin-direct'}>
                    Access Admin Panel (Direct)
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/admin'}>
                    Try Protected Admin Route
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-red-600">❌ No admin privileges detected</p>
                <p className="text-sm text-gray-600">
                  You need either: role='admin', isAdmin=true, or Firebase admin claims
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleRefreshAndCheck} disabled={checking}>
              <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
              Refresh & Recheck
            </Button>
            <Button variant="outline" onClick={checkAdminStatus} disabled={checking}>
              Check Again
            </Button>
          </div>

          {/* Instructions */}
          <div className="p-3 bg-blue-50 rounded-lg text-sm">
            <h4 className="font-semibold mb-1">Debug Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Check your current admin status above</li>
              <li>If not admin, we need to run the admin setup script again</li>
              <li>If admin status shows true, try the "Access Admin Panel (Direct)" button</li>
              <li>Check browser console for detailed logs</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React from 'react';
import { useAuth } from "@/hooks/use-auth-firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, User, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export function AdminDebugPanel() {
  const { user, firebaseUser, refreshToken, isLoading, initialized } = useAuth();
  
  const handleRefreshToken = async () => {
    try {
      console.log('🔄 Manually refreshing token...');
      await refreshToken();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Token refresh failed:', error);
      alert('Token refresh failed: ' + error.message);
    }
  };
  
  const handleCheckClaims = async () => {
    if (!firebaseUser) {
      alert('No Firebase user found');
      return;
    }
    
    try {
      const tokenResult = await firebaseUser.getIdTokenResult(true);
      console.log('🎫 Current Firebase claims:', tokenResult.claims);
      alert('Claims: ' + JSON.stringify(tokenResult.claims, null, 2));
    } catch (error) {
      console.error('Error getting claims:', error);
      alert('Error getting claims: ' + error.message);
    }
  };
  
  const adminStatus = user?.isAdmin || user?.role === 'admin' || user?.role === 'superadmin';
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Access Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auth Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span>Auth Initialized:</span>
              {initialized ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
              <span>{initialized ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Loading:</span>
              {isLoading ? <XCircle className="w-4 h-4 text-yellow-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
              <span>{isLoading ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          {/* User Info */}
          <div className="space-y-2">
            <h3 className="font-semibold">Database User Info</h3>
            {user ? (
              <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded">
                <div>Email: {user.email}</div>
                <div>Username: {user.username}</div>
                <div>Role: <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{user.role}</Badge></div>
                <div>Is Admin: <Badge variant={user.isAdmin ? 'destructive' : 'secondary'}>{user.isAdmin ? 'Yes' : 'No'}</Badge></div>
                <div>Firebase UID: {user.firebaseUid}</div>
                <div>User ID: {user.id}</div>
              </div>
            ) : (
              <div className="text-red-600">❌ No user data found</div>
            )}
          </div>
          
          {/* Firebase Auth Info */}
          <div className="space-y-2">
            <h3 className="font-semibold">Firebase Auth Info</h3>
            {firebaseUser ? (
              <div className="text-sm bg-gray-50 p-3 rounded space-y-1">
                <div>UID: {firebaseUser.uid}</div>
                <div>Email: {firebaseUser.email}</div>
                <div>Email Verified: {firebaseUser.emailVerified ? 'Yes' : 'No'}</div>
                <div>Display Name: {firebaseUser.displayName || 'Not set'}</div>
              </div>
            ) : (
              <div className="text-red-600">❌ No Firebase user found</div>
            )}
          </div>
          
          {/* Actions */}
          <div className="space-y-2">
            <h3 className="font-semibold">Debug Actions</h3>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleRefreshToken} size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Token & Reload
              </Button>
              <Button onClick={handleCheckClaims} variant="outline" size="sm">
                Check Firebase Claims
              </Button>
              <Button onClick={() => window.location.href = '/admin'} variant="outline" size="sm">
                Try Admin Panel
              </Button>
            </div>
          </div>
          
          {/* Admin Access Status */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Overall Admin Access Status</h3>
            {adminStatus ? (
              <div className="text-green-600 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">✅ You have admin privileges!</span>
                </div>
                <div className="text-sm">
                  Based on: Role = "{user?.role}" | IsAdmin = {user?.isAdmin ? 'true' : 'false'}
                </div>
              </div>
            ) : (
              <div className="text-red-600">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">❌ No admin privileges detected</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Console Instructions */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Console Debug</h3>
            <p className="text-sm text-blue-800">
              Check your browser's Developer Console (F12) for detailed authentication logs.
              Look for messages starting with 🔍, 👤, 📋, 🔄, 🎫, and ✅.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
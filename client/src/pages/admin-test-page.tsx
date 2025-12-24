import React from 'react';
import { useAuth } from '@/hooks/use-auth-firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

export function AdminTestPage() {
  const { user, firebaseUser, isLoading, initialized } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading || !initialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const isAdmin = user?.isAdmin === true || user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Admin Access Test Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Admin Status Check */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              {isAdmin ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Admin Status Check
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><strong>User Role:</strong> <Badge variant={user?.role === 'admin' ? 'destructive' : 'default'}>{user?.role || 'None'}</Badge></p>
                <p><strong>Is Admin Flag:</strong> <Badge variant={user?.isAdmin ? 'destructive' : 'secondary'}>{user?.isAdmin ? 'True' : 'False'}</Badge></p>
                <p><strong>Final Admin Status:</strong> <Badge variant={isAdmin ? 'destructive' : 'secondary'}>{isAdmin ? 'ADMIN ACCESS' : 'NO ACCESS'}</Badge></p>
              </div>
              
              <div className="space-y-2">
                <p><strong>Email:</strong> {user?.email || 'Not set'}</p>
                <p><strong>Firebase UID:</strong> {user?.firebaseUid || 'Not set'}</p>
                <p><strong>Username:</strong> {user?.username || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={() => setLocation('/admin')}
              variant={isAdmin ? 'default' : 'secondary'}
              disabled={!isAdmin}
            >
              🚀 Access Admin Dashboard
            </Button>
            <Button onClick={() => setLocation('/dashboard')} variant="outline">
              📊 Regular Dashboard
            </Button>
            <Button onClick={() => setLocation('/debug-user')} variant="outline">
              🔍 Debug User Info
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">If you don't have admin access:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Log out of your account completely</li>
              <li>2. Clear your browser cache/cookies (or use incognito mode)</li>
              <li>3. Log back in with your Google account</li>
              <li>4. Your admin privileges should now be active</li>
            </ol>
          </div>

          {isAdmin && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">🎉 Admin Access Confirmed!</h4>
              <p className="text-sm text-green-700">
                You now have full admin privileges. Click "Access Admin Dashboard" to see all admin features.
              </p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

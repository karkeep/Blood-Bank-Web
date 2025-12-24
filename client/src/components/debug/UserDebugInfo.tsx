import React from 'react';
import { useAuth } from '@/hooks/use-auth-firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export function UserDebugInfo() {
  const { user, firebaseUser, isLoading, initialized } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading || !initialized) {
    return <div>Loading auth info...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto m-8">
      <CardHeader>
        <CardTitle>🔍 User Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Firebase User:</h3>
          {firebaseUser ? (
            <div className="bg-green-50 p-3 rounded border">
              <p><strong>UID:</strong> {firebaseUser.uid}</p>
              <p><strong>Email:</strong> {firebaseUser.email}</p>
              <p><strong>Display Name:</strong> {firebaseUser.displayName || 'Not set'}</p>
            </div>
          ) : (
            <div className="bg-red-50 p-3 rounded border">Not authenticated</div>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Database User:</h3>
          {user ? (
            <div className="bg-blue-50 p-3 rounded border space-y-1">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>{user.role}</Badge></p>
              <p><strong>Is Admin:</strong> <Badge variant={user.isAdmin ? 'destructive' : 'secondary'}>{user.isAdmin ? 'Yes' : 'No'}</Badge></p>
              <p><strong>Firebase UID:</strong> {user.firebaseUid}</p>
              <p><strong>Blood Type:</strong> {user.bloodType}</p>
            </div>
          ) : (
            <div className="bg-red-50 p-3 rounded border">No user data found</div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={() => setLocation('/admin')}>
            🚀 Try Admin Access
          </Button>
          <Button onClick={() => setLocation('/dashboard')} variant="outline">
            📊 Go to Dashboard
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            🔄 Refresh Page
          </Button>
        </div>

        <div className="bg-yellow-50 p-3 rounded border">
          <p className="text-sm"><strong>Note:</strong> If you don't see admin access, try logging out and logging back in to refresh your session.</p>
        </div>
      </CardContent>
    </Card>
  );
}

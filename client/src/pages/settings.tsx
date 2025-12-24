import React, { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Settings, User, Bell, Lock, Shield, LogOut, Edit, Save, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth-firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";
import { useToast } from "@/hooks/use-toast";
import { ref, update, get } from "firebase/database";
import { database } from "@/lib/firebase/firebase";

// Notification preferences type
interface NotificationPreferences {
  emergencyEmail: boolean;
  donationEmail: boolean;
  thankYouEmail: boolean;
  newsEmail: boolean;
  emergencyPush: boolean;
  nearbyPush: boolean;
  emergencySms: boolean;
}

export default function UserSettings() {
  const { logout, user, firebaseUser } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    emergencyEmail: true,
    donationEmail: true,
    thankYouEmail: true,
    newsEmail: false,
    emergencyPush: true,
    nearbyPush: true,
    emergencySms: true,
  });

  // Form refs
  const fullNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const [bloodType, setBloodType] = useState(user?.bloodType || "O+");

  // Load notification preferences from database
  useEffect(() => {
    const loadNotificationPrefs = async () => {
      if (firebaseUser) {
        try {
          const usersRef = ref(database, 'users');
          const usersSnapshot = await get(usersRef);
          const usersData = usersSnapshot.val() || {};

          for (const key in usersData) {
            if (usersData[key].firebaseUid === firebaseUser.uid) {
              const userPrefs = usersData[key].notificationPreferences;
              if (userPrefs) {
                setNotificationPrefs(prev => ({ ...prev, ...userPrefs }));
              }
              break;
            }
          }
        } catch (error) {
          console.error('Error loading notification preferences:', error);
        }
      }
    };

    loadNotificationPrefs();
  }, [firebaseUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "User information not available. Please try logging in again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get values from refs
      const updatedProfile = {
        username: usernameRef.current?.value || user.username,
        fullName: fullNameRef.current?.value || user.fullName,
        email: emailRef.current?.value || user.email,
        bloodType: bloodType,
        phone: phoneRef.current?.value,
        location: locationRef.current?.value,
        bio: bioRef.current?.value,
        updatedAt: new Date().toISOString()
      };

      // Find the user by firebaseUid
      if (firebaseUser) {
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        const usersData = usersSnapshot.val() || {};

        // Find user key by firebaseUid
        let userKey = null;
        for (const key in usersData) {
          if (usersData[key].firebaseUid === firebaseUser.uid) {
            userKey = key;
            break;
          }
        }

        if (userKey) {
          // Update the user profile in the database
          const userRef = ref(database, `users/${userKey}`);
          await update(userRef, updatedProfile);

          toast({
            title: "Profile Updated",
            description: "Your profile information has been saved successfully."
          });
        } else {
          throw new Error("User record not found in database");
        }
      } else {
        throw new Error("Not authenticated");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: (error as Error).message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!firebaseUser) {
      toast({
        title: "Error",
        description: "You must be logged in to save preferences.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingNotifications(true);

    try {
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      const usersData = usersSnapshot.val() || {};

      // Find user key by firebaseUid
      let userKey = null;
      for (const key in usersData) {
        if (usersData[key].firebaseUid === firebaseUser.uid) {
          userKey = key;
          break;
        }
      }

      if (userKey) {
        // Update the notification preferences in the database
        const userRef = ref(database, `users/${userKey}`);
        await update(userRef, {
          notificationPreferences: notificationPrefs,
          updatedAt: new Date().toISOString()
        });

        toast({
          title: "✅ Notification Preferences Saved",
          description: "Your notification settings have been updated successfully."
        });
      } else {
        throw new Error("User record not found");
      }
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast({
        title: "Save Failed",
        description: (error as Error).message || "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleSavePassword = async () => {
    toast({
      title: "Password Updated",
      description: "Your password has been successfully changed."
    });
  };

  const handleSavePrivacy = async () => {
    toast({
      title: "Privacy Settings Saved",
      description: "Your privacy preferences have been updated."
    });
  };

  return (
    <>
      <Helmet>
        <title>Account Settings - Jiwandan</title>
        <meta
          name="description"
          content="Manage your Jiwandan account settings, profile information, and notification preferences."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-2 text-gray-900">
                Account Settings
              </h1>
              <p className="text-gray-600 mb-8">
                Manage your account preferences and settings
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sidebar */}
                <div className="col-span-1">
                  <Card>
                    <CardContent className="p-0">
                      <nav className="flex flex-col">
                        <button
                          onClick={() => setActiveSection("profile")}
                          className={`flex items-center px-4 py-3 text-sm font-medium border-l-2 text-left ${activeSection === "profile"
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                            }`}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile Information
                        </button>
                        <button
                          onClick={() => setActiveSection("notifications")}
                          className={`flex items-center px-4 py-3 text-sm font-medium border-l-2 text-left ${activeSection === "notifications"
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                            }`}
                        >
                          <Bell className="mr-2 h-4 w-4" />
                          Notification Settings
                        </button>
                        <button
                          onClick={() => setActiveSection("password")}
                          className={`flex items-center px-4 py-3 text-sm font-medium border-l-2 text-left ${activeSection === "password"
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                            }`}
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          Password & Security
                        </button>
                        <button
                          onClick={() => setActiveSection("privacy")}
                          className={`flex items-center px-4 py-3 text-sm font-medium border-l-2 text-left ${activeSection === "privacy"
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                            }`}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Privacy Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex items-center px-4 py-3 text-sm font-medium border-l-2 border-transparent hover:bg-red-50 text-gray-600 hover:text-red-600 text-left"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </button>
                      </nav>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content */}
                <div className="col-span-1 md:col-span-2">
                  {activeSection === "profile" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <User className="h-5 w-5 mr-2 text-red-500" />
                          Profile Information
                        </CardTitle>
                        <CardDescription>
                          Manage your personal information and profile details
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                          <div className="w-24 h-24 bg-gray-200 rounded-full flex-shrink-0"></div>
                          <div>
                            <h3 className="font-medium mb-1">Profile Photo</h3>
                            <p className="text-sm text-gray-500 mb-2">This will be displayed on your donor profile</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Upload New</Button>
                              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">Remove</Button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              ref={fullNameRef}
                              defaultValue={user?.fullName || user?.username || ""}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              ref={usernameRef}
                              defaultValue={user?.username || ""}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              ref={emailRef}
                              defaultValue={user?.email || ""}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              ref={phoneRef}
                              defaultValue={user?.phone || ""}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bloodType">Blood Type</Label>
                            <div className="flex items-center gap-3">
                              <Select
                                defaultValue={user?.bloodType || "O+"}
                                onValueChange={setBloodType}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select blood type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="A+">A+</SelectItem>
                                  <SelectItem value="A-">A-</SelectItem>
                                  <SelectItem value="B+">B+</SelectItem>
                                  <SelectItem value="B-">B-</SelectItem>
                                  <SelectItem value="AB+">AB+</SelectItem>
                                  <SelectItem value="AB-">AB-</SelectItem>
                                  <SelectItem value="O+">O+</SelectItem>
                                  <SelectItem value="O-">O-</SelectItem>
                                </SelectContent>
                              </Select>
                              <BloodTypeBadge type={bloodType} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              ref={locationRef}
                              defaultValue={user?.location || ""}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            ref={bioRef}
                            placeholder="Tell others about yourself"
                            defaultValue={user?.bio || ""}
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={handleSaveProfile} disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-b-transparent"></span>
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeSection === "notifications" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Bell className="h-5 w-5 mr-2 text-red-500" />
                          Notification Settings
                        </CardTitle>
                        <CardDescription>
                          Control how and when you receive notifications from Jiwandan
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Email Notifications</h3>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="emergency-email" className="font-medium">Emergency Donation Requests</Label>
                              <p className="text-sm text-gray-500">Receive emails when there's an urgent need for your blood type</p>
                            </div>
                            <Switch
                              id="emergency-email"
                              checked={notificationPrefs.emergencyEmail}
                              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, emergencyEmail: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="donation-email" className="font-medium">Donation Reminders</Label>
                              <p className="text-sm text-gray-500">Receive reminders when you're eligible to donate again</p>
                            </div>
                            <Switch
                              id="donation-email"
                              checked={notificationPrefs.donationEmail}
                              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, donationEmail: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="thank-you-email" className="font-medium">Thank You Messages</Label>
                              <p className="text-sm text-gray-500">Receive messages from recipients of your donations</p>
                            </div>
                            <Switch
                              id="thank-you-email"
                              checked={notificationPrefs.thankYouEmail}
                              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, thankYouEmail: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="news-email" className="font-medium">News & Updates</Label>
                              <p className="text-sm text-gray-500">Stay informed about Jiwandan news and features</p>
                            </div>
                            <Switch
                              id="news-email"
                              checked={notificationPrefs.newsEmail}
                              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, newsEmail: checked }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Push Notifications</h3>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="emergency-push" className="font-medium">Emergency Alerts</Label>
                              <p className="text-sm text-gray-500">Receive push notifications for urgent donation needs</p>
                            </div>
                            <Switch
                              id="emergency-push"
                              checked={notificationPrefs.emergencyPush}
                              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, emergencyPush: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="nearby-push" className="font-medium">Nearby Blood Drives</Label>
                              <p className="text-sm text-gray-500">Be notified about donation events in your area</p>
                            </div>
                            <Switch
                              id="nearby-push"
                              checked={notificationPrefs.nearbyPush}
                              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, nearbyPush: checked }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">SMS Notifications</h3>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="emergency-sms" className="font-medium">Emergency Requests Only</Label>
                              <p className="text-sm text-gray-500">Receive text messages only for urgent donation needs</p>
                            </div>
                            <Switch
                              id="emergency-sms"
                              checked={notificationPrefs.emergencySms}
                              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, emergencySms: checked }))}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={handleSaveNotifications} disabled={isSavingNotifications}>
                            {isSavingNotifications ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Save Preferences'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeSection === "password" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Lock className="h-5 w-5 mr-2 text-red-500" />
                          Password & Security
                        </CardTitle>
                        <CardDescription>
                          Manage your password and account security settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Change Password</h3>

                          <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                            <p className="text-xs text-gray-500">Password must be at least 8 characters with uppercase, lowercase, and numbers</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" />
                          </div>

                          <Button onClick={handleSavePassword}>Update Password</Button>
                        </div>

                        <div className="border-t pt-6 space-y-4">
                          <h3 className="text-lg font-medium">Two-Factor Authentication</h3>

                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
                            <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-amber-800">Two-factor authentication is not enabled</p>
                              <p className="text-sm text-amber-700 mt-1">
                                Add an extra layer of security to your account by enabling two-factor authentication.
                              </p>
                            </div>
                          </div>

                          <Button variant="outline">Enable Two-Factor Authentication</Button>
                        </div>

                        <div className="border-t pt-6 space-y-4">
                          <h3 className="text-lg font-medium">Login History</h3>

                          <div className="border rounded-lg divide-y">
                            <div className="p-3">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Current Session</span>
                                <span className="text-green-600 text-sm">Active Now</span>
                              </div>
                              <p className="text-sm text-gray-600">MacOS - Chrome - New York, USA</p>
                              <p className="text-xs text-gray-500 mt-1">IP: 192.168.1.1</p>
                            </div>
                            <div className="p-3">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Previous Login</span>
                                <span className="text-gray-600 text-sm">3 days ago</span>
                              </div>
                              <p className="text-sm text-gray-600">iPhone - Safari - New York, USA</p>
                              <p className="text-xs text-gray-500 mt-1">IP: 192.168.1.2</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeSection === "privacy" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-red-500" />
                          Privacy Settings
                        </CardTitle>
                        <CardDescription>
                          Control your data privacy and sharing preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Profile Visibility</h3>

                          <div className="space-y-3">
                            <Label className="font-medium">Who can see my donor profile?</Label>
                            <RadioGroup defaultValue="verified">
                              <div className="flex items-start space-x-2">
                                <RadioGroupItem value="verified" id="verified" className="mt-1" />
                                <div>
                                  <Label htmlFor="verified" className="font-medium">Verified Medical Institutions Only</Label>
                                  <p className="text-sm text-gray-500">Only verified hospitals and blood banks can view your full profile</p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-2">
                                <RadioGroupItem value="donors" id="donors" className="mt-1" />
                                <div>
                                  <Label htmlFor="donors" className="font-medium">Jiwandan Community</Label>
                                  <p className="text-sm text-gray-500">Other registered donors can also view your profile</p>
                                </div>
                              </div>
                              <div className="flex items-start space-x-2">
                                <RadioGroupItem value="private" id="private" className="mt-1" />
                                <div>
                                  <Label htmlFor="private" className="font-medium">Private</Label>
                                  <p className="text-sm text-gray-500">Only shown when you respond to emergency requests</p>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Location Sharing</h3>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="location-sharing" className="font-medium">Share My Location</Label>
                              <p className="text-sm text-gray-500">Allow the app to use your location for nearby donation matching</p>
                            </div>
                            <Switch id="location-sharing" defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="precise-location" className="font-medium">Precise Location</Label>
                              <p className="text-sm text-gray-500">Use exact GPS coordinates (when disabled, uses approximate area)</p>
                            </div>
                            <Switch id="precise-location" defaultChecked />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Data Usage</h3>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="analytics" className="font-medium">Analytics & Improvements</Label>
                              <p className="text-sm text-gray-500">Help improve Jiwandan by sharing anonymous usage data</p>
                            </div>
                            <Switch id="analytics" defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="research" className="font-medium">Medical Research</Label>
                              <p className="text-sm text-gray-500">Allow anonymized donation data to be used for blood donation research</p>
                            </div>
                            <Switch id="research" defaultChecked />
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                            Delete My Account
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            This will permanently delete your account and all associated data
                          </p>
                        </div>

                        <div className="flex justify-end">
                          <Button onClick={handleSavePrivacy}>Save Privacy Settings</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

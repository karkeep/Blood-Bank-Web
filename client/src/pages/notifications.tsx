import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Bell, AlertCircle, CalendarClock, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BloodTypeBadge } from "@/components/ui/blood-type-badge";

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: "emergency",
      title: "Urgent: O- blood needed",
      message: "Critical shortage of O- blood type at Kathmandu Medical Center.",
      time: "10 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "donation",
      title: "Donation Reminder",
      message: "You're eligible to donate again in 3 days.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 3,
      type: "match",
      title: "Donation Match Found",
      message: "Your blood type matches a patient in need at City Hospital.",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 4,
      type: "system",
      title: "Profile Verification Complete",
      message: "Your donor profile has been verified successfully.",
      time: "3 days ago",
      unread: false,
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case "emergency":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "donation":
        return <CalendarClock className="h-5 w-5 text-blue-500" />;
      case "match":
        return <BloodTypeBadge type="A+" size="sm" />;
      case "system":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Notifications - Jiwandan</title>
        <meta
          name="description"
          content="View your blood donation notifications, alerts, and updates."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                  <p className="text-gray-600">Stay updated on donation opportunities and requests</p>
                </div>
                
                <Button variant="outline" size="sm">
                  Mark all as read
                </Button>
              </div>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Recent Notifications</CardTitle>
                  <CardDescription>
                    You have {notifications.filter(n => n.unread).length} unread notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 flex items-start space-x-4 ${notification.unread ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-gray-900 flex items-center">
                              {notification.title}
                              {notification.unread && (
                                <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs border-0">New</Badge>
                              )}
                            </h4>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-4 text-center text-sm text-gray-500">
                      No more notifications to show
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

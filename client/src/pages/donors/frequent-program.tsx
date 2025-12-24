import React from "react";
import { Helmet } from "react-helmet";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function FrequentDonorProgram() {
  return (
    <>
      <Helmet>
        <title>Frequent Donor Program | Jiwandan Blood Bank</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Frequent Donor Program</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">Join Our Jiwandan Heroes Club</h2>
          <p className="mb-3">
            Regular donors are the backbone of our blood supply system. Our Frequent Donor Program
            recognizes and rewards those who make blood donation a regular part of their lives.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Program Benefits</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border p-4 rounded-lg">
              <h3 className="text-xl font-medium mb-2">Silver Donor (3-5 donations/year)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Priority scheduling</li>
                <li>Exclusive Jiwandan t-shirt</li>
                <li>Quarterly newsletter</li>
                <li>Digital donor badge</li>
              </ul>
            </div>
            
            <div className="border p-4 rounded-lg">
              <h3 className="text-xl font-medium mb-2">Gold Donor (6-8 donations/year)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>All Silver benefits</li>
                <li>Personalized donor card</li>
                <li>Jiwandan water bottle</li>
                <li>Priority access to special events</li>
              </ul>
            </div>
            
            <div className="border p-4 rounded-lg">
              <h3 className="text-xl font-medium mb-2">Platinum Donor (9+ donations/year)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>All Gold benefits</li>
                <li>Annual recognition ceremony</li>
                <li>Premium Jiwandan merchandise</li>
                <li>Blood type awareness advocate status</li>
                <li>Personal donation coordinator</li>
              </ul>
            </div>
            
            <div className="border p-4 rounded-lg">
              <h3 className="text-xl font-medium mb-2">Lifetime Donor (50+ lifetime donations)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Special recognition plaque</li>
                <li>Featured donor story on our website</li>
                <li>Invitation to annual donor appreciation event</li>
                <li>Commemorative milestone gifts</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">How to Join</h2>
          <p className="mb-3">
            Joining our Frequent Donor Program is automatic when you create an account and donate blood.
            Your donation history will be tracked, and you'll receive notifications when you reach new levels.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-medium">Already donated but don't have an account?</p>
            <p>Create an account and contact us to link your previous donations to your profile.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Donation Tracking</h2>
          <p className="mb-3">
            Our digital system makes it easy to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>View your donation history</li>
            <li>Schedule future appointments</li>
            <li>Track your donor status level</li>
            <li>Receive reminders when you're eligible to donate again</li>
            <li>Share your donor achievements on social media</li>
          </ul>
        </section>
        
        <section className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-2xl font-semibold mb-3">Donor Milestone Recognition</h2>
          <p className="mb-3">
            We celebrate these significant milestones in your donor journey:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <span className="text-3xl font-bold text-red-600">1st</span>
              <p>First-time donor certificate</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <span className="text-3xl font-bold text-red-600">10th</span>
              <p>Bronze pin award</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <span className="text-3xl font-bold text-red-600">25th</span>
              <p>Silver pin award</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <span className="text-3xl font-bold text-red-600">50th</span>
              <p>Gold pin & recognition</p>
            </div>
          </div>
        </section>
      </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
import React from "react";
import { Helmet } from "react-helmet";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function DonorSafety() {
  return (
    <>
      <Helmet>
        <title>Donor Safety | Jiwandan Blood Bank</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Donor Safety</h1>

            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">Your Safety Is Our Priority</h2>
                <p className="mb-3">
                  At Jiwandan Blood Bank, we prioritize your health and safety throughout the donation process.
                  We maintain the highest standards and follow strict protocols to ensure a safe and comfortable experience.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Before Donation</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Get a good night's sleep before donation day</li>
                  <li>Eat a healthy meal within 3 hours before donating</li>
                  <li>Drink plenty of fluids - aim for an extra 16 oz of water</li>
                  <li>Avoid fatty foods before donation</li>
                  <li>Wear comfortable clothing with sleeves that can be raised above the elbow</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">During Donation</h2>
                <p className="mb-3">
                  Our trained staff uses new, sterile equipment for each donation. The actual blood donation typically takes about 8-10 minutes.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You'll be in a comfortable position during donation</li>
                  <li>Staff will regularly check on your well-being</li>
                  <li>If you experience any discomfort, alert a staff member immediately</li>
                  <li>The needle insertion might cause brief discomfort, but most donors report minimal pain</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">After Donation</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Rest in our recovery area for 10-15 minutes</li>
                  <li>Enjoy provided refreshments to help replenish fluids</li>
                  <li>Avoid strenuous activities for the rest of the day</li>
                  <li>Keep drinking fluids throughout the day</li>
                  <li>Don't remove the bandage for at least 4 hours</li>
                  <li>If you feel dizzy or unwell, sit or lie down immediately</li>
                </ul>
              </section>

              <section className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-2xl font-semibold mb-3">Possible Side Effects</h2>
                <p className="mb-3">
                  While blood donation is generally very safe, some donors may experience:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Slight bruising at the needle site</li>
                  <li>Feeling lightheaded or dizzy briefly</li>
                  <li>Fatigue</li>
                </ul>
                <p className="mt-3">
                  These effects are usually mild and temporary. Our staff is trained to handle any situations that may arise.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
                <p>
                  If you have any concerns after donation or questions about safety, please email us at <a href="mailto:contact@jiwandan.com" className="text-red-600 hover:underline">contact@jiwandan.com</a>. We're here to help!
                </p>
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
import React from "react";
import { Helmet } from "react-helmet";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function EligibilityRequirements() {
  return (
    <>
      <Helmet>
        <title>Eligibility Requirements | Jiwandan Blood Bank</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Blood Donation Eligibility Requirements</h1>

            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">Basic Requirements</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Be at least 17 years old (16 with parental consent in some states)</li>
                  <li>Weigh at least 110 pounds (50 kg)</li>
                  <li>Be in good general health and feeling well</li>
                  <li>Have not donated whole blood in the last 56 days</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Health Conditions</h2>
                <p className="mb-3">
                  Certain health conditions may affect your eligibility to donate. These include:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>High or low blood pressure</li>
                  <li>Diabetes</li>
                  <li>Heart disease</li>
                  <li>Cancer history</li>
                  <li>Blood disorders</li>
                  <li>Infections or illnesses</li>
                </ul>
                <p className="mt-3">
                  Our medical staff will conduct a brief examination to check your temperature,
                  pulse, blood pressure and hemoglobin levels before donation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Travel Restrictions</h2>
                <p>
                  Recent travel to certain countries might temporarily defer your eligibility.
                  This is to prevent the spread of diseases like malaria or other infections.
                  Please inform our staff about your recent travel history.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Medications</h2>
                <p>
                  Some medications may affect your eligibility. Please bring a list of your
                  current medications for our medical staff to review.
                </p>
              </section>

              <section className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-2xl font-semibold mb-3">Not Sure If You're Eligible?</h2>
                <p>
                  If you're unsure about your eligibility, please email us at <a href="mailto:contact@jiwandan.com" className="text-red-600 hover:underline">contact@jiwandan.com</a> with your questions. We'll be happy to help!
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
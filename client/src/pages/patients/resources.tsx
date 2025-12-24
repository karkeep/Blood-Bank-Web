import React from "react";
import { Helmet } from "react-helmet";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function PatientResources() {
  return (
    <>
      <Helmet>
        <title>Patient Resources | Jiwandan Blood Bank</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Patient Resources</h1>

            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">Information for Patients Needing Blood</h2>
                <p className="mb-3">
                  If you or a loved one requires blood transfusions, we're here to help.
                  This page provides resources and information to help you understand the process,
                  find support, and connect with our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Understanding Blood Transfusions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border p-4 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">What to Expect</h3>
                    <p>
                      A blood transfusion is a routine medical procedure where you receive blood through an intravenous (IV) line inserted into one of your blood vessels.
                      The procedure typically takes 1-4 hours, depending on how much blood you need.
                    </p>
                  </div>

                  <div className="border p-4 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">Why Transfusions Are Needed</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Blood loss from surgery or injury</li>
                      <li>Cancer treatments</li>
                      <li>Blood disorders like anemia</li>
                      <li>Chronic diseases</li>
                      <li>Hemophilia or other clotting disorders</li>
                      <li>Kidney disease</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Direct Recipient Program</h2>
                <p className="mb-3">
                  Our Direct Recipient Program connects patients needing regular transfusions with dedicated donors.
                  This program is particularly beneficial for:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Patients with rare blood types</li>
                  <li>Those requiring specialized blood components</li>
                  <li>Patients with conditions requiring frequent transfusions</li>
                </ul>
                <div className="mt-3 bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium">How to Enroll:</p>
                  <p>To enroll in our Direct Recipient Program, please have your healthcare provider email us at <a href="mailto:contact@jiwandan.com" className="text-red-600 hover:underline">contact@jiwandan.com</a>.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Support Services</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border p-4 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">Transportation Assistance</h3>
                    <p>
                      We can help arrange transportation to and from transfusion appointments for eligible patients.
                    </p>
                  </div>

                  <div className="border p-4 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">Financial Resources</h3>
                    <p>
                      Information about insurance coverage and financial assistance programs for blood transfusions.
                    </p>
                  </div>

                  <div className="border p-4 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">Emotional Support</h3>
                    <p>
                      Connection to patient support groups and counseling services for those dealing with chronic conditions.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Educational Materials</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 border rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Understanding Blood Types and Compatibility Guide</span>
                  </div>

                  <div className="flex items-center p-3 border rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Preparing for Your Transfusion: What to Expect</span>
                  </div>

                  <div className="flex items-center p-3 border rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Managing Side Effects of Blood Transfusions</span>
                  </div>

                  <div className="flex items-center p-3 border rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Nutrition Tips for Patients Receiving Transfusions</span>
                  </div>
                </div>
              </section>

              <section className="bg-red-50 p-4 rounded-lg">
                <h2 className="text-2xl font-semibold mb-3">Contact Patient Services</h2>
                <p>
                  Our Patient Services team is available to answer questions and provide assistance:
                </p>
                <div className="mt-3">
                  <p>Email: <a href="mailto:contact@jiwandan.com" className="text-red-600 hover:underline">contact@jiwandan.com</a></p>
                  <p className="text-sm text-gray-500">We typically respond within 24-48 hours</p>
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
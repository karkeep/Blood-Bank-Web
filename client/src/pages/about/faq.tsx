import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { HelpCircle } from "lucide-react";

export default function FAQ() {
  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions - Jiwandan</title>
        <meta
          name="description"
          content="Common questions and answers about blood donation, donor eligibility, and the donation process."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
                Frequently Asked Questions
              </h1>
              
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex items-center justify-center mb-6 text-red-500">
                  <HelpCircle className="w-16 h-16" />
                </div>
                <p className="text-gray-500 text-center mb-6">
                  We're currently updating our FAQ page with the most common questions about blood donation.
                  Please check back soon for comprehensive information!
                </p>
                <p className="text-gray-500 text-center">
                  In the meantime, feel free to contact us with any specific questions.
                </p>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

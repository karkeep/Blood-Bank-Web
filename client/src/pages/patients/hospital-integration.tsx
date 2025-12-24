import React from "react";
import { Helmet } from "react-helmet";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function HospitalIntegration() {
  return (
    <>
      <Helmet>
        <title>Hospital Integration | Jiwandan Blood Bank</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Hospital Integration</h1>

            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">Seamless Hospital Collaboration</h2>
                <p className="mb-3">
                  Jiwandan Blood Bank works closely with hospitals and medical facilities to ensure a reliable and efficient blood supply system.
                  Our integration services are designed to meet the unique needs of healthcare providers and their patients.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Our Hospital Services</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border p-4 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">Blood Product Supply</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Regular scheduled deliveries</li>
                      <li>Emergency on-demand supply</li>
                      <li>Specialized blood components</li>
                      <li>Rare blood type sourcing</li>
                      <li>Temperature-controlled transport</li>
                    </ul>
                  </div>

                  <div className="border p-4 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">Digital Integration</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>API access to our blood inventory system</li>
                      <li>Real-time blood availability updates</li>
                      <li>Electronic ordering system</li>
                      <li>Integration with hospital EMR systems</li>
                      <li>Automated inventory management</li>
                    </ul>
                  </div>

                  <div className="border p-4 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">Quality Assurance</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Comprehensive testing protocols</li>
                      <li>FDA and AABB compliant procedures</li>
                      <li>Full traceability of all blood products</li>
                      <li>Regular quality audits</li>
                      <li>Detailed documentation</li>
                    </ul>
                  </div>

                  <div className="border p-4 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">Professional Support</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>24/7 emergency contact line</li>
                      <li>Dedicated hospital account managers</li>
                      <li>Staff training and education</li>
                      <li>Regular consultation meetings</li>
                      <li>Custom blood management plans</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Becoming a Partner Hospital</h2>
                <p className="mb-3">
                  We welcome partnerships with hospitals and medical facilities of all sizes. Our integration process is designed to be straightforward and efficient:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Initial consultation to understand your needs</li>
                  <li>Customized service proposal</li>
                  <li>Contract and compliance review</li>
                  <li>Technical integration setup</li>
                  <li>Staff training and onboarding</li>
                  <li>Regular review and optimization</li>
                </ol>
              </section>

              <section className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-2xl font-semibold mb-3">Emergency Response Program</h2>
                <p className="mb-3">
                  Our Emergency Response Program ensures that partner hospitals have priority access to blood supplies during mass casualty events, natural disasters, or other emergency situations.
                </p>
                <div className="flex items-center space-x-2 text-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Learn more about our Emergency Response Program by contacting our Hospital Relations team.</span>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Contact Our Hospital Relations Team</h2>
                <p>
                  To learn more about our hospital integration services or to schedule a consultation, please contact:
                </p>
                <div className="mt-3 p-4 border rounded-lg bg-gradient-to-r from-red-50 to-white">
                  <p><strong>Hospital Relations Department</strong></p>
                  <p className="mt-2">Email: <a href="mailto:contact@jiwandan.com" className="text-red-600 hover:underline">contact@jiwandan.com</a></p>
                  <p className="text-sm text-gray-500 mt-1">We typically respond within 24-48 hours</p>
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
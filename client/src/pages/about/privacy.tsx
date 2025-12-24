import React from "react";
import { Helmet } from "react-helmet";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Jiwandan Blood Bank</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

            <div className="space-y-6">
              <section>
                <p className="mb-3">
                  Last updated: May 10, 2025
                </p>
                <p className="mb-3">
                  Jiwandan Blood Bank ("we", "our", or "us") is committed to protecting your privacy.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                  when you use our website, mobile application, or services (collectively, the "Service").
                </p>
                <p>
                  Please read this Privacy Policy carefully. By using our Service, you consent to the practices described in this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium">Personal Information</h3>
                  <p>
                    We may collect personally identifiable information, such as:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Name, address, phone number, and email address</li>
                    <li>Date of birth and gender</li>
                    <li>Blood type and donation history</li>
                    <li>Health information relevant to blood donation eligibility</li>
                    <li>Government-issued identification details</li>
                    <li>Emergency contact information</li>
                  </ul>

                  <h3 className="text-xl font-medium mt-4">Non-Personal Information</h3>
                  <p>
                    We may also collect non-personal information, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>IP address</li>
                    <li>Device information</li>
                    <li>Usage patterns and preferences</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
                <p className="mb-3">
                  We may use the information we collect for various purposes, including:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Managing your donor or recipient account</li>
                  <li>Processing and tracking blood donations</li>
                  <li>Determining eligibility for blood donation</li>
                  <li>Communicating about appointment schedules and reminders</li>
                  <li>Notifying you about urgent blood needs or emergency situations</li>
                  <li>Providing and improving our Service</li>
                  <li>Analyzing usage to enhance user experience</li>
                  <li>Sending promotional materials and newsletters (with your consent)</li>
                  <li>Responding to your questions and concerns</li>
                  <li>Complying with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Information Sharing and Disclosure</h2>
                <p className="mb-3">
                  We may share your information in the following situations:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Healthcare Partners:</strong> We may share necessary information with hospitals, medical facilities, and healthcare providers involved in the blood donation and transfusion process.</li>
                  <li><strong>Service Providers:</strong> We may engage trusted third-party companies to perform services on our behalf, such as payment processing, data analysis, and customer service.</li>
                  <li><strong>Legal Requirements:</strong> We may disclose your information if required by law, regulation, legal process, or governmental request.</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</li>
                  <li><strong>With Your Consent:</strong> We may share your information with third parties when you have given us your consent to do so.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
                <p className="mb-3">
                  We implement appropriate technical and organizational measures to protect your information
                  from unauthorized access, disclosure, alteration, or destruction. However, no method of
                  transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee
                  absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Your Rights and Choices</h2>
                <p className="mb-3">
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Accessing, correcting, or deleting your personal information</li>
                  <li>Objecting to or restricting certain processing of your information</li>
                  <li>Receiving a copy of your information in a structured, machine-readable format</li>
                  <li>Withdrawing consent at any time (where processing is based on consent)</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, please contact us using the information provided in the "Contact Us" section.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Changes to This Privacy Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="mt-3 p-4 border rounded-lg bg-gradient-to-r from-red-50 to-white">
                  <p><strong>Jiwandan - Virtual Blood Donation Network</strong></p>
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
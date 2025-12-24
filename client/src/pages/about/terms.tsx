import React from "react";
import { Helmet } from "react-helmet";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function TermsOfService() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Jiwandan Blood Bank</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

            <div className="space-y-6">
              <section>
                <p className="mb-3">
                  Last updated: May 10, 2025
                </p>
                <p className="mb-3">
                  Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Jiwandan Blood Bank website, mobile application, or services (collectively, the "Service") operated by Jiwandan Blood Bank ("us", "we", or "our").
                </p>
                <p>
                  Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
                </p>
                <p className="font-bold mt-3">
                  By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Use of Service</h2>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>Eligibility:</strong> You must be at least 16 years old to use our Service. Users under 18 must have parental consent for blood donation and registration.
                  </li>
                  <li>
                    <strong>Account Registration:</strong> When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.
                  </li>
                  <li>
                    <strong>Account Security:</strong> You are responsible for safeguarding the password used to access the Service and for any activities under your account. You agree to immediately notify us of any unauthorized use of your account.
                  </li>
                  <li>
                    <strong>Prohibited Activities:</strong> You agree not to misuse our Service, including but not limited to: (a) engaging in any illegal activity; (b) attempting to gain unauthorized access to our systems; (c) transmitting malware or other harmful code; (d) interfering with other users' enjoyment of the Service; or (e) using automated means to access the Service.
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Blood Donation Terms</h2>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>Medical Screening:</strong> All donors must undergo medical screening according to our established protocols and regulatory requirements.
                  </li>
                  <li>
                    <strong>Truthful Information:</strong> You agree to provide accurate and complete information regarding your medical history and current health status when participating in blood donation.
                  </li>
                  <li>
                    <strong>Appointment Scheduling:</strong> By scheduling a donation appointment, you agree to appear at the designated time and location. If you cannot attend, you agree to provide reasonable notice of cancellation.
                  </li>
                  <li>
                    <strong>Consent for Testing:</strong> You acknowledge that donated blood will be tested for infectious diseases and other relevant markers as required by applicable regulations.
                  </li>
                  <li>
                    <strong>Notification of Test Results:</strong> You agree to be notified if any test results indicate a condition that may affect your health or eligibility for future donations.
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Intellectual Property</h2>
                <p className="mb-3">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of Jiwandan Blood Bank and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                </p>
                <p>
                  Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Jiwandan Blood Bank.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">User Content</h2>
                <p className="mb-3">
                  Our Service may allow you to post, link, share, or otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post, including its legality, reliability, and appropriateness.
                </p>
                <p>
                  By posting Content, you grant us the right to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all of your rights to any Content you submit, post, or display on or through the Service and you are responsible for protecting those rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Links To Other Websites</h2>
                <p className="mb-3">
                  Our Service may contain links to third-party websites or services that are not owned or controlled by Jiwandan Blood Bank.
                </p>
                <p>
                  Jiwandan Blood Bank has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that Jiwandan Blood Bank shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Limitation of Liability</h2>
                <p>
                  In no event shall Jiwandan Blood Bank, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Changes</h2>
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us:
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
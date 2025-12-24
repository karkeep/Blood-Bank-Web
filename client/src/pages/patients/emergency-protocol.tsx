import React from "react";
import { Helmet } from "react-helmet";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function EmergencyProtocol() {
  return (
    <>
      <Helmet>
        <title>Emergency Protocol | Jiwandan Blood Bank</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Emergency Blood Request Protocol</h1>

            <div className="space-y-6">
              <section className="bg-red-50 p-6 rounded-lg border border-red-200">
                <div className="flex items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h2 className="text-2xl font-semibold text-red-800">If this is a life-threatening emergency:</h2>
                </div>
                <ol className="list-decimal pl-5 space-y-2 font-medium">
                  <li>Email us urgently at: <a href="mailto:contact@jiwandan.com" className="text-red-800 underline">contact@jiwandan.com</a> (we prioritize emergency requests)</li>
                  <li>Or contact the nearest hospital emergency room immediately</li>
                  <li>Do not wait for online responses in critical situations</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Emergency Blood Request Process</h2>
                <p className="mb-4">
                  Our emergency blood request system is designed to quickly respond to urgent needs
                  for blood products. The following protocol ensures that critical requests are
                  handled with the highest priority.
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <h3 className="text-xl font-medium mb-2">Step 1: Initiate Request</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Medical professionals: Email us at contact@jiwandan.com with "URGENT" in subject line</li>
                      <li>Patients or family members: Contact your healthcare provider first, who will initiate the proper medical request</li>
                      <li>Alternatively, complete the online emergency request form (for non-immediate life-threatening situations only)</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <h3 className="text-xl font-medium mb-2">Step 2: Verification</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Our staff will verify the medical need and patient information</li>
                      <li>We'll confirm blood type and specific component requirements</li>
                      <li>Priority level will be assigned based on medical urgency</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <h3 className="text-xl font-medium mb-2">Step 3: Blood Product Allocation</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Our inventory system identifies available matching blood products</li>
                      <li>For rare blood types, our rare donor registry may be activated</li>
                      <li>In extreme shortages, we coordinate with regional blood centers</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <h3 className="text-xl font-medium mb-2">Step 4: Expedited Delivery</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Emergency transportation is arranged based on priority level</li>
                      <li>Critical requests use our dedicated emergency courier service</li>
                      <li>Real-time tracking is provided to the receiving facility</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <h3 className="text-xl font-medium mb-2">Step 5: Confirmation and Follow-up</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Delivery confirmation is required from the receiving medical staff</li>
                      <li>Our team follows up to ensure blood products were sufficient</li>
                      <li>Additional requests can be made if needed</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Priority Levels</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-red-100 p-4 rounded-lg">
                    <h3 className="text-xl font-medium mb-2 text-red-800">Level 1: Critical</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Immediate life-threatening situations</li>
                      <li>Major trauma with severe blood loss</li>
                      <li>Emergency surgeries</li>
                      <li>Response time: Immediate to 30 minutes</li>
                    </ul>
                  </div>

                  <div className="bg-orange-100 p-4 rounded-lg">
                    <h3 className="text-xl font-medium mb-2 text-orange-800">Level 2: Urgent</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Urgent surgical procedures</li>
                      <li>Active bleeding requiring transfusion</li>
                      <li>Severe anemia with complications</li>
                      <li>Response time: 1-2 hours</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-100 p-4 rounded-lg">
                    <h3 className="text-xl font-medium mb-2 text-yellow-800">Level 3: Standard</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Scheduled surgeries</li>
                      <li>Chronic conditions requiring transfusion</li>
                      <li>Outpatient transfusion therapy</li>
                      <li>Response time: 4-24 hours</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">Emergency Request Form</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <form className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-1">Request Type*</label>
                        <select
                          id="requestType"
                          name="requestType"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          required
                        >
                          <option value="">Select Request Type</option>
                          <option value="hospital">Hospital Request</option>
                          <option value="patient">Patient/Family Request</option>
                          <option value="physician">Physician Request</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority Level*</label>
                        <select
                          id="priority"
                          name="priority"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          required
                        >
                          <option value="">Select Priority Level</option>
                          <option value="level3">Level 3: Standard (4-24 hours)</option>
                          <option value="level2">Level 2: Urgent (1-2 hours)</option>
                          <option value="level1">Level 1: Critical (CALL IMMEDIATELY)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="requesterName" className="block text-sm font-medium text-gray-700 mb-1">Requester Name*</label>
                        <input
                          type="text"
                          id="requesterName"
                          name="requesterName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="requesterPhone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone*</label>
                        <input
                          type="tel"
                          id="requesterPhone"
                          name="requesterPhone"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">Patient Name*</label>
                        <input
                          type="text"
                          id="patientName"
                          name="patientName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">Blood Type (if known)</label>
                        <select
                          id="bloodType"
                          name="bloodType"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">Select Blood Type</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="unknown">Unknown</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="facilityName" className="block text-sm font-medium text-gray-700 mb-1">Hospital/Facility Name*</label>
                      <input
                        type="text"
                        id="facilityName"
                        name="facilityName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Emergency Request*</label>
                      <textarea
                        id="reason"
                        name="reason"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-red-600 text-white font-medium py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Submit Emergency Request
                    </button>

                    <p className="text-sm text-gray-500">
                      * Required fields. For life-threatening emergencies, please email us at contact@jiwandan.com with "URGENT" in subject line.
                    </p>
                  </form>
                </div>
              </section>

              <section className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-2xl font-semibold mb-3">Additional Emergency Resources</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Blood Type Compatibility Chart - <a href="/patients/resources" className="text-blue-600 hover:underline">View Resources</a></li>
                  <li>Emergency Blood Donor Activation Protocol - Hospitals can request emergency donor activation for rare blood types</li>
                  <li>Emergency Transport Services - Available for Level 1 and Level 2 emergencies</li>
                  <li>Hospital Integration Services - <a href="/patients/hospital-integration" className="text-blue-600 hover:underline">Learn More</a></li>
                </ul>
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
import React from "react";
import { Helmet } from "react-helmet";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function OurMission() {
  return (
    <>
      <Helmet>
        <title>Our Mission | Jiwandan Blood Bank</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Our Mission</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
          <p className="text-lg">
            To create a world where no life is lost due to lack of blood, and where every community has access to a safe and reliable blood supply.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Core Mission</h2>
          <div className="bg-red-50 p-6 rounded-lg">
            <p className="text-lg font-medium text-red-800">
              Jiwandan Blood Bank is dedicated to saving lives by providing a reliable, high-quality blood supply to healthcare facilities while delivering exceptional service to donors, patients, and healthcare partners.
            </p>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-xl font-medium">Safety</h3>
              </div>
              <p>
                We prioritize the safety of our donors, recipients, and staff in every action we take. We adhere to the highest standards and protocols to ensure that every blood product is safe.
              </p>
            </div>
            
            <div className="border p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-xl font-medium">Urgency</h3>
              </div>
              <p>
                We recognize that lives depend on our ability to deliver blood products quickly and efficiently. We operate with a sense of urgency that reflects the critical nature of our mission.
              </p>
            </div>
            
            <div className="border p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-xl font-medium">Community</h3>
              </div>
              <p>
                We believe in the power of community and that blood donation is one of the most direct ways for individuals to help save lives. We work to foster a strong sense of community among donors, staff, and healthcare partners.
              </p>
            </div>
            
            <div className="border p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <h3 className="text-xl font-medium">Innovation</h3>
              </div>
              <p>
                We continuously seek to improve our processes, technologies, and services to better serve donors, patients, and healthcare partners. We embrace advances in blood banking science and technology.
              </p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Impact</h2>
          <div className="grid md:grid-cols-3 gap-4 text-center mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-4xl font-bold text-red-600 block mb-2">100,000+</span>
              <span className="text-lg">Blood donations collected annually</span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-4xl font-bold text-red-600 block mb-2">300,000+</span>
              <span className="text-lg">Lives saved through our services</span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-4xl font-bold text-red-600 block mb-2">75+</span>
              <span className="text-lg">Healthcare facilities served</span>
            </div>
          </div>
          <p>
            Every day, our work directly contributes to saving lives in our community and beyond. From routine surgeries to emergency trauma cases, the blood products we collect and distribute are essential to modern healthcare.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Our History</h2>
          <p className="mb-3">
            Founded in 1995, Jiwandan Blood Bank began as a small community blood drive organized by a group of local physicians who recognized the critical need for a reliable blood supply in our region. From those humble beginnings, we have grown into one of the most respected blood banking organizations in the country.
          </p>
          <p className="mb-3">
            Over the years, we have consistently expanded our services, adopted new technologies, and enhanced our facilities to better serve our community. We have weathered natural disasters, public health emergencies, and other challenges, always maintaining our commitment to providing lifesaving blood products to those in need.
          </p>
          <p>
            Today, we continue to build on our rich history, guided by our founding principles and driven by our passion for saving lives through the gift of blood donation.
          </p>
        </section>
        
        <section className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-3">Join Our Mission</h2>
          <p className="mb-4">
            There are many ways to be part of our lifesaving mission:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Become a Donor</h3>
              <p>
                Donate blood regularly and join our community of lifesavers. Every donation can save up to three lives.
              </p>
              <a href="/donors/how-to-donate" className="text-red-600 font-medium hover:underline block mt-2">Learn about donating →</a>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Volunteer With Us</h3>
              <p>
                Help at blood drives, assist donors, or support our administrative operations as a valued volunteer.
              </p>
              <a href="/about/contact" className="text-red-600 font-medium hover:underline block mt-2">Contact us to volunteer →</a>
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
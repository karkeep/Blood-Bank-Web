import React from "react";
import { Helmet } from "react-helmet";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Mail, Globe, MessageCircle, Clock, Heart, Shield, Users } from "lucide-react";

export default function ContactUs() {
  return (
    <>
      <Helmet>
        <title>Contact Us | Jiwandan Blood Bank</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

            <div className="space-y-8">
              <section className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Get In Touch</h2>
                  <p className="mb-6 text-gray-600">
                    Jiwandan is a virtual blood donation network connecting donors with people in need.
                    We're here to answer any questions you may have about blood donation,
                    our services, or how you can get involved.
                  </p>

                  <div className="space-y-6">
                    {/* Email Contact */}
                    <div className="flex items-start p-4 bg-gradient-to-r from-red-50 to-white rounded-xl border border-red-100">
                      <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900">Email Us</h3>
                        <p className="text-gray-600 text-sm mb-2">Our primary contact method</p>
                        <a
                          href="mailto:contact@jiwandan.com"
                          className="text-red-600 hover:text-red-700 font-medium text-lg"
                        >
                          contact@jiwandan.com
                        </a>
                      </div>
                    </div>

                    {/* Virtual Platform */}
                    <div className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Globe className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900">Virtual Platform</h3>
                        <p className="text-gray-600 text-sm mb-2">We operate entirely online</p>
                        <a
                          href="https://jiwandan.com"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          www.jiwandan.com
                        </a>
                      </div>
                    </div>

                    {/* Support Hours */}
                    <div className="flex items-start p-4 bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-100">
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900">Response Time</h3>
                        <p className="text-gray-600 text-sm">We typically respond within 24-48 hours</p>
                        <p className="text-gray-600 text-sm">Emergency requests are prioritized</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-lg">
                  <h2 className="text-2xl font-semibold mb-4">Send Us a Message</h2>
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Your Name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Your Email"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <select
                        id="subject"
                        name="subject"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Select a topic</option>
                        <option value="donation">Blood Donation Inquiry</option>
                        <option value="emergency">Emergency Request Help</option>
                        <option value="account">Account Support</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="How can we help you?"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-lg"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium mb-2 text-gray-900">How can I schedule a blood donation?</h3>
                    <p className="text-gray-600">You can register through our website and connect with nearby verified donors or blood banks. For assistance, email us at <a href="mailto:contact@jiwandan.com" className="text-red-600 hover:underline">contact@jiwandan.com</a>.</p>
                  </div>

                  <div className="border border-gray-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium mb-2 text-gray-900">What should I do if I'm experiencing issues with my donor account?</h3>
                    <p className="text-gray-600">Please contact our support team at <a href="mailto:contact@jiwandan.com" className="text-red-600 hover:underline">contact@jiwandan.com</a> with details about your issue.</p>
                  </div>

                  <div className="border border-gray-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium mb-2 text-gray-900">How can I organize a blood drive?</h3>
                    <p className="text-gray-600">We'd love to help! Email us at <a href="mailto:contact@jiwandan.com" className="text-red-600 hover:underline">contact@jiwandan.com</a> to discuss hosting a virtual blood drive campaign.</p>
                  </div>

                  <div className="border border-gray-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium mb-2 text-gray-900">How does Jiwandan work?</h3>
                    <p className="text-gray-600">Jiwandan connects blood donors with recipients in emergencies. Create an account, verify your profile, and be ready to save lives when needed.</p>
                  </div>
                </div>
              </section>

              {/* Why Choose Us Section */}
              <section className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white">
                <h2 className="text-2xl font-semibold mb-6 text-center">Why Choose Jiwandan?</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Save Lives</h3>
                    <p className="text-red-100 text-sm">Every donation can save up to 3 lives. Be a hero in someone's story.</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Verified & Secure</h3>
                    <p className="text-red-100 text-sm">All donors are verified. Your data is protected with bank-level security.</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Community</h3>
                    <p className="text-red-100 text-sm">Join thousands of donors making a difference in their communities.</p>
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
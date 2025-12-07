import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()} 
          className="mb-8 pl-0 hover:bg-transparent hover:text-[#FE6C3A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <h1 className="text-4xl font-bold mb-2 text-[#0D3B33]">Terms of Service</h1>
        <p className="text-gray-500 mb-12">Last updated: December 7, 2025</p>
        
        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-[#0D3B33] mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using the IvyBridge platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0D3B33] mb-4">2. Description of Service</h2>
            <p>
              IvyBridge is a platform that connects students ("Mentees") with current university students ("Mentors") for admissions guidance and mentorship. We provide the infrastructure for these connections but are not a party to the direct relationship between Mentors and Mentees.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0D3B33] mb-4">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0D3B33] mb-4">4. Mentor Verification</h2>
            <p>
              Mentors on IvyBridge are required to provide proof of enrollment or graduation from their respective universities. While we verify these documents to the best of our ability, we cannot guarantee the complete accuracy of all information provided by users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0D3B33] mb-4">5. Payments and Refunds</h2>
            <p>
              Payments for mentorship services are processed through our third-party payment provider, Stripe. Refunds are subject to our Refund Policy and the specific terms of the mentorship agreement. IvyBridge takes a service fee from transactions to maintain the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0D3B33] mb-4">6. Code of Conduct</h2>
            <p>
              Users agree to interact respectfully and professionally. Harassment, hate speech, or inappropriate behavior of any kind will not be tolerated and may result in immediate account suspension or termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0D3B33] mb-4">7. Limitation of Liability</h2>
            <p>
              IvyBridge shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-[#0D3B33] mb-4">8. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0D3B33] mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at contact@ivybridge.xyz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
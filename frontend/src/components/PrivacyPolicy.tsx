/** Privacy Policy component for GDPR compliance */
import React from 'react'

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>

      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            1. Introduction
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            CV Pro (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to
            protecting your privacy and ensuring compliance with the General Data Protection
            Regulation (GDPR). This Privacy Policy explains how we collect, use, and protect your
            personal data when you use our CV generation service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            2. Data Controller
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>Data Controller:</strong> CV Pro
            <br />
            <strong>Contact:</strong> privacy@cocode.dk
            <br />
            <strong>Address:</strong> Denmark
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            3. Personal Data We Collect
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We collect the following categories of personal data:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
            <li>
              <strong>Personal Information:</strong> Name, email address, phone number, address,
              LinkedIn/GitHub profiles, website, professional summary, photo
            </li>
            <li>
              <strong>Professional Data:</strong> Work experience, education, skills, job titles,
              company names, employment dates
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, browser type, device information, usage
              analytics
            </li>
            <li>
              <strong>Account Data:</strong> Username, password (encrypted), account preferences
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            4. Legal Basis for Processing
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We process your personal data based on the following legal grounds:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
            <li>
              <strong>Contract:</strong> To provide CV generation and related services
            </li>
            <li>
              <strong>Consent:</strong> For non-essential features like analytics and marketing
            </li>
            <li>
              <strong>Legitimate Interest:</strong> To improve our services and ensure security
            </li>
            <li>
              <strong>Legal Obligation:</strong> To comply with applicable laws and regulations
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            5. How We Use Your Data
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
            <li>Create and customize CV documents</li>
            <li>Generate tailored cover letters using AI</li>
            <li>Store your profile data for future use</li>
            <li>Provide customer support</li>
            <li>Analyze service usage to improve functionality</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            6. Data Sharing and Third Parties
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">We may share your data with:</p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
            <li>
              <strong>AI Service Providers:</strong> For CV tailoring and cover letter generation
              (data processed securely and not stored)
            </li>
            <li>
              <strong>Hosting Providers:</strong> Supabase (EU-based, GDPR compliant)
            </li>
            <li>
              <strong>Analytics Services:</strong> Only with your explicit consent
            </li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We do not sell your personal data to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            7. Data Retention
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We retain your personal data for as long as necessary to provide our services and comply
            with legal obligations. Typically:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
            <li>CV and profile data: Until you delete your account</li>
            <li>
              Account data: For the duration of your account plus 3 years for legal compliance
            </li>
            <li>Analytics data: 2 years maximum</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            8. Your GDPR Rights
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Under GDPR, you have the following rights:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
            <li>
              <strong>Right to Access:</strong> Request a copy of your personal data
            </li>
            <li>
              <strong>Right to Rectification:</strong> Correct inaccurate or incomplete data
            </li>
            <li>
              <strong>Right to Erasure:</strong> Delete your personal data (&ldquo;right to be
              forgotten&rdquo;)
            </li>
            <li>
              <strong>Right to Restriction:</strong> Limit how we process your data
            </li>
            <li>
              <strong>Right to Portability:</strong> Receive your data in a portable format
            </li>
            <li>
              <strong>Right to Object:</strong> Object to processing based on legitimate interests
            </li>
            <li>
              <strong>Right to Withdraw Consent:</strong> Withdraw consent at any time
            </li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To exercise these rights, contact us at privacy@cocode.dk
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            9. Cookies and Tracking
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We use cookies for essential functionality and, with your consent, for analytics. You
            can manage your cookie preferences through the consent banner or your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            10. Data Security
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We implement appropriate technical and organizational measures to protect your personal
            data:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Access controls and user authentication</li>
            <li>Regular security audits and updates</li>
            <li>Secure data centers in the EU</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            11. International Data Transfers
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Your data is stored and processed within the European Union. Any transfers outside the
            EU are conducted with appropriate safeguards in place.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            12. Changes to This Policy
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any material
            changes via email or through our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            13. Contact Us
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you have any questions about this Privacy Policy or our data practices, please
            contact us at privacy@cocode.dk:
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>Email:</strong> privacy@cocode.dk
            <br />
            <strong>Address:</strong> Denmark
          </p>
        </section>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">Last updated: January 2026</p>
      </div>
    </div>
  )
}

export default PrivacyPolicy

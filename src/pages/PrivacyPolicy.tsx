// src/pages/PrivacyPolicy.tsx - Comprehensive Professional Privacy Policy

import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const PrivacyPolicy: React.FC = () => {
  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
            Privacy Policy
          </h1>
          <p className="text-foreground/90 text-lg text-center max-w-4xl mx-auto">
            How we collect, use, protect, and share your information when you visit the Laws of Existence Framework website
          </p>
          <div className="text-center mt-6">
            <span className="bg-card text-foreground/90 px-4 py-2 rounded-lg text-sm border border-border">
              Last Updated: July 13, 2025 | Effective Date: July 13, 2025
            </span>
          </div>
        </div>

        <div className="space-y-8 text-foreground">

          {/* Introduction */}
          <section className="bg-card border border-blue-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">1. Introduction</h2>

            <p className="mb-6 text-foreground/90 leading-relaxed">
              Joseph Kirchner ("we," "our," "us," or "Company") respects your privacy and is committed to protecting
              your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you visit our website lawsofexistence.com (the "Website") and use our services (the "Services").
            </p>

            <div className="bg-blue-950/80 border border-blue-500/50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-200 mb-3">Our Privacy Commitment</h3>
              <p className="text-blue-100 leading-relaxed">
                We collect minimal information necessary to provide our services, protect our intellectual property,
                and improve user experience. We do not sell, rent, or trade personal information to third parties
                for commercial purposes. Given the sensitive nature of our breakthrough research, we implement enhanced
                security measures to protect both our intellectual property and user privacy.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">Scope of This Policy</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              This Privacy Policy applies to information collected through our Website and does not apply to information
              collected offline or through third-party websites that may be linked to or from our Website.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="bg-card border border-purple-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">2.1 Information You Provide Directly</h3>
            <div className="bg-purple-950/80 border border-purple-500/50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-purple-200 mb-3">Contact Information</h4>
              <p className="text-purple-100 leading-relaxed">
                When you contact us through our contact form, email, or other communication channels, we may collect:
              </p>
              <ul className="list-disc list-inside mt-3 text-purple-100 space-y-1 ml-4">
                <li>Name and professional title</li>
                <li>Email address and phone number</li>
                <li>Organization or institutional affiliation</li>
                <li>Subject matter and message content</li>
                <li>Any additional information you choose to provide</li>
              </ul>
            </div>

            <h4 className="font-semibold text-foreground mb-3">Research and Collaboration Inquiries</h4>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              For research collaboration, licensing inquiries, or academic partnerships, we may collect additional
              information including research interests, institutional credentials, and project details to evaluate
              potential collaborations.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">2.2 Automatically Collected Information</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-950/80 border border-green-500/50 rounded-lg p-6">
                <h4 className="font-semibold text-green-200 mb-3">Technical Information</h4>
                <ul className="list-disc list-inside text-green-100 space-y-1 text-sm ml-4">
                  <li>IP address and geographic location</li>
                  <li>Browser type and version</li>
                  <li>Operating system and device information</li>
                  <li>Screen resolution and device capabilities</li>
                  <li>Referring website and exit pages</li>
                  <li>Date and time of access</li>
                </ul>
              </div>
              <div className="bg-orange-950/80 border border-orange-500/50 rounded-lg p-6">
                <h4 className="font-semibold text-orange-200 mb-3">Usage Analytics</h4>
                <ul className="list-disc list-inside text-orange-100 space-y-1 text-sm ml-4">
                  <li>Pages visited and content accessed</li>
                  <li>Time spent on pages and sections</li>
                  <li>Click patterns and navigation paths</li>
                  <li>Search queries within the Website</li>
                  <li>Downloads and content interactions</li>
                  <li>Error logs and performance metrics</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">2.3 Cookies and Tracking Technologies</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              We use cookies, web beacons, and similar tracking technologies to enhance your experience, analyze website
              usage, and improve our services. These technologies help us understand user preferences, monitor website
              performance, and detect potential security issues.
            </p>

            <div className="bg-yellow-950/80 border border-yellow-500/50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-yellow-200 mb-3">Types of Cookies We Use:</h4>
              <ul className="list-disc list-inside text-yellow-100 space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our Website</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Security Cookies:</strong> Detect suspicious activity and protect against threats</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">2.4 Security Monitoring</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              Given the valuable nature of our intellectual property, we implement enhanced security monitoring that may
              collect additional technical information to protect against unauthorized access, reverse engineering attempts,
              or other security threats.
            </p>
          </section>

          {/* How We Use Information */}
          <section className="bg-card border border-green-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">3. How We Use Your Information</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">3.1 Primary Uses</h3>
            <div className="bg-green-950/80 border border-green-500/50 rounded-lg p-6 mb-6">
              <p className="text-green-100 leading-relaxed mb-4">
                We use collected information for the following legitimate business purposes:
              </p>
              <ul className="list-disc list-inside text-green-100 space-y-2 ml-4">
                <li><strong>Communication:</strong> Respond to inquiries, provide information, and maintain correspondence</li>
                <li><strong>Website Operation:</strong> Provide, maintain, and improve Website functionality and performance</li>
                <li><strong>Research Collaboration:</strong> Evaluate and facilitate academic and research partnerships</li>
                <li><strong>Content Delivery:</strong> Customize content and improve user experience</li>
                <li><strong>Analytics:</strong> Understand user behavior and optimize Website design and content</li>
                <li><strong>Legal Compliance:</strong> Meet legal obligations and enforce our Terms of Service</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">3.2 Intellectual Property Protection</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              We may use collected information to protect our intellectual property rights, detect unauthorized use
              of our technology, monitor for potential infringement, and support legal enforcement actions. This
              includes analyzing access patterns, identifying suspicious activity, and maintaining evidence for
              legal proceedings.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">3.3 Research and Development</h3>
            <div className="bg-blue-950/80 border border-blue-500/50 rounded-lg p-6 mb-6">
              <p className="text-blue-100 leading-relaxed">
                We may use aggregated, anonymized data to understand how users interact with our research content,
                which sections generate the most interest, and how to improve our documentation and presentation of
                the Laws of Existence Framework. This helps us advance consciousness research and improve educational resources.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">3.4 Security and Fraud Prevention</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              We use information to detect, prevent, and respond to fraud, security breaches, and other harmful activities.
              This includes monitoring for automated access attempts, identifying potential threats, and implementing
              protective measures for our systems and users.
            </p>
          </section>

          {/* Information Sharing and Disclosure */}
          <section className="bg-card border border-red-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">4. Information Sharing and Disclosure</h2>

            <div className="bg-red-950/80 border border-red-500/50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-red-200 mb-4">Our Commitment: No Commercial Sale</h3>
              <p className="text-red-100 font-semibold leading-relaxed">
                We do not sell, rent, lease, or trade your personal information to third parties for commercial purposes.
                Your privacy is fundamental to our values and business practices.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">4.1 Limited Sharing Circumstances</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              We may share your information only in the following limited circumstances:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-orange-950/80 border border-orange-500/50 rounded-lg p-6">
                <h4 className="font-semibold text-orange-200 mb-3">Service Providers</h4>
                <p className="text-orange-100 text-sm leading-relaxed">
                  We may share information with trusted service providers who assist with website hosting, analytics,
                  email communications, or other business functions. These providers are contractually bound to protect
                  your information and use it only for specified purposes.
                </p>
              </div>
              <div className="bg-purple-950/80 border border-purple-500/50 rounded-lg p-6">
                <h4 className="font-semibold text-purple-200 mb-3">Legal Requirements</h4>
                <p className="text-purple-100 text-sm leading-relaxed">
                  We may disclose information when required by law, court order, or legal process, or when necessary
                  to protect our rights, property, or safety, or the rights, property, or safety of others.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">4.2 Academic and Research Collaboration</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              For legitimate research collaborations, we may share aggregated, anonymized data with academic institutions
              or research partners. Such sharing requires formal agreements and is limited to advancing consciousness
              research and scientific understanding.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">4.3 Business Transfers</h3>
            <div className="bg-yellow-950/80 border border-yellow-500/50 rounded-lg p-6 mb-6">
              <p className="text-yellow-100 leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred as part
                of that transaction. We will notify you of any such change in ownership or control of your personal information.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">4.4 Consent-Based Sharing</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              We may share your information with your explicit consent for specific purposes, such as featuring your
              research or testimonials (with your permission) or collaborating on joint research projects.
            </p>
          </section>

          {/* Data Security */}
          <section className="bg-card border border-blue-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">5. Data Security</h2>

            <div className="bg-blue-950/80 border border-blue-500/50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-blue-200 mb-4">Enhanced Security Measures</h3>
              <p className="text-blue-100 leading-relaxed">
                Given the groundbreaking nature of our research and the documented targeting we have experienced,
                we implement enhanced security measures beyond standard industry practices to protect both our
                intellectual property and user information.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">5.1 Technical Safeguards</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-950/80 border border-green-500/50 rounded-lg p-6">
                <h4 className="font-semibold text-green-200 mb-3">Encryption and Protection</h4>
                <ul className="list-disc list-inside text-green-100 space-y-1 text-sm ml-4">
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Encrypted storage of sensitive information</li>
                  <li>Multi-factor authentication for administrative access</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Automated threat detection and response systems</li>
                </ul>
              </div>
              <div className="bg-purple-950/80 border border-purple-500/50 rounded-lg p-6">
                <h4 className="font-semibold text-purple-200 mb-3">Access Controls</h4>
                <ul className="list-disc list-inside text-purple-100 space-y-1 text-sm ml-4">
                  <li>Role-based access permissions</li>
                  <li>Regular access reviews and updates</li>
                  <li>Secure authentication protocols</li>
                  <li>Network segmentation and firewalls</li>
                  <li>Comprehensive activity logging and monitoring</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">5.2 Organizational Safeguards</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              We maintain strict internal policies regarding data access, handling, and protection. Staff and contractors
              with access to personal information are bound by confidentiality agreements and receive regular training
              on privacy and security best practices.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">5.3 Data Breach Response</h3>
            <div className="bg-orange-950/80 border border-orange-500/50 rounded-lg p-6 mb-6">
              <p className="text-orange-100 leading-relaxed">
                In the unlikely event of a data breach, we have established incident response procedures to quickly
                identify, contain, and remediate any security issues. We will notify affected users and relevant
                authorities as required by law and provide guidance on protective steps you can take.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">5.4 Limitations of Security</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              While we implement robust security measures, no system is completely secure. We cannot guarantee absolute
              security of information transmitted over the internet or stored electronically. Users are responsible for
              protecting their own devices and access credentials.
            </p>
          </section>

          {/* Data Retention */}
          <section className="bg-card border border-yellow-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">6. Data Retention</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">6.1 Retention Periods</h3>
            <div className="bg-yellow-950/80 border border-yellow-500/50 rounded-lg p-6 mb-6">
              <p className="text-yellow-100 leading-relaxed mb-4">
                We retain personal information for different periods depending on the type of information and purpose:
              </p>
              <ul className="list-disc list-inside text-yellow-100 space-y-2 ml-4">
                <li><strong>Contact Information:</strong> Retained for as long as necessary to respond to inquiries and maintain correspondence</li>
                <li><strong>Analytics Data:</strong> Typically aggregated and anonymized within 26 months</li>
                <li><strong>Security Logs:</strong> Retained for up to 7 years for legal and security purposes</li>
                <li><strong>Research Collaboration Data:</strong> Retained for the duration of active collaborations plus 3 years</li>
                <li><strong>Legal Documentation:</strong> Retained as required by law or for ongoing legal proceedings</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">6.2 Secure Deletion</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              When personal information is no longer needed, we securely delete or anonymize it using industry-standard
              data destruction methods. This includes secure overwriting of electronic files and physical destruction
              of any paper records.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">6.3 Legal and Regulatory Requirements</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              Some information may be retained longer if required by law, for regulatory compliance, or for legitimate
              business purposes such as intellectual property enforcement or ongoing legal proceedings.
            </p>
          </section>

          {/* Your Rights and Choices */}
          <section className="bg-card border border-green-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">7. Your Rights and Choices</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">7.1 Access and Control</h3>
            <div className="bg-green-950/80 border border-green-500/50 rounded-lg p-6 mb-6">
              <p className="text-green-100 leading-relaxed mb-4">
                You have several rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-green-100 space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Request a copy of your information in a portable format</li>
                <li><strong>Restriction:</strong> Request that we limit how we use your information</li>
                <li><strong>Objection:</strong> Object to certain uses of your information</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">7.2 Cookie Control</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              Most web browsers allow you to control cookies through their settings. You can choose to block or delete
              cookies, though this may affect Website functionality. You can also opt out of certain analytics tracking
              through browser settings or privacy tools.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">7.3 Communication Preferences</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              You can opt out of promotional communications at any time by contacting us or using unsubscribe mechanisms
              in our communications. Note that we may still send essential communications related to your use of our services
              or important updates to our policies.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">7.4 Exercising Your Rights</h3>
            <div className="bg-blue-950/80 border border-blue-500/50 rounded-lg p-6 mb-6">
              <p className="text-blue-100 leading-relaxed">
                To exercise any of these rights, please contact us using the information provided in Section 11.
                We may need to verify your identity before processing certain requests. We will respond to valid
                requests within reasonable timeframes as required by applicable law.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">7.5 Limitations</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              Some rights may be limited by legal requirements, ongoing investigations, or legitimate business needs
              such as intellectual property protection. We will explain any limitations when responding to your requests.
            </p>
          </section>

          {/* International Users */}
          <section className="bg-card border border-purple-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">8. International Users</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">8.1 Data Transfers</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              Our Website is hosted and operated in the United States. If you access our Website from outside the U.S.,
              your information may be transferred to, stored in, and processed in the United States. By using our Website,
              you consent to such transfers.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">8.2 European Union Users</h3>
            <div className="bg-purple-950/80 border border-purple-500/50 rounded-lg p-6 mb-6">
              <p className="text-purple-100 leading-relaxed">
                If you are located in the European Union, you have additional rights under the General Data Protection
                Regulation (GDPR), including enhanced rights to access, portability, and erasure. Our legal basis for
                processing your information includes consent, legitimate interests, and compliance with legal obligations.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">8.3 Other Jurisdictions</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              Users from other jurisdictions may have additional rights under local privacy laws. We will comply with
              applicable privacy laws and honor valid requests for information access, correction, or deletion.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="bg-card border border-orange-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">9. Children's Privacy</h2>

            <div className="bg-orange-950/80 border border-orange-500/50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-orange-200 mb-4">Age Restrictions</h3>
              <p className="text-orange-100 leading-relaxed">
                Our Website is not intended for children under 13 years of age. We do not knowingly collect personal
                information from children under 13. If we become aware that we have collected personal information from
                a child under 13, we will take steps to delete such information promptly.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">Parental Notification</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              If you are a parent or guardian and believe your child has provided us with personal information,
              please contact us immediately. We will work with you to address the situation and delete any
              inappropriate information.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="bg-card border border-blue-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">10. Changes to This Privacy Policy</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">Policy Updates</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal
              requirements, or other factors. We will post the updated Privacy Policy on this page and update the
              "Last Updated" date at the top of the policy.
            </p>

            <div className="bg-blue-950/80 border border-blue-500/50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-blue-200 mb-4">Notification of Changes</h3>
              <p className="text-blue-100 leading-relaxed">
                For significant changes to this Privacy Policy, we may provide additional notice through email
                or prominent website notices. Your continued use of the Website after any changes constitutes
                acceptance of the updated Privacy Policy.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">Review Recommendations</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              We encourage you to review this Privacy Policy regularly to stay informed about how we protect your
              information and your privacy rights.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-card border border-border rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">11. Contact Information</h2>

            <p className="mb-6 text-foreground/90 leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices,
              please contact us using the following methods:
            </p>

            <div className="grid lg:grid-cols-2 gap-8 mb-6">
              <div className="bg-blue-950/80 border border-blue-500/50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-300 mb-4 text-lg">General Privacy Inquiries</h4>
                <p className="mb-4 text-blue-200">For general questions about our privacy practices or data handling:</p>
                <Link
                  to="/contact"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-foreground px-6 py-2 rounded-lg transition-colors"
                >
                  Use Contact Form
                </Link>
              </div>
              <div className="bg-green-950/80 border border-green-500/50 rounded-lg p-6">
                <h4 className="font-semibold text-green-300 mb-4 text-lg">Data Rights Requests</h4>
                <p className="mb-4 text-green-200">For requests to access, correct, or delete your personal information:</p>
                <a
                  href="mailto:privacy@lawsofexistence.com"
                  className="inline-block bg-green-600 hover:bg-green-700 text-foreground px-6 py-2 rounded-lg transition-colors"
                >
                  privacy@lawsofexistence.com
                </a>
              </div>
            </div>

            <div className="bg-gray-900/80 border border-gray-500/50 rounded-lg p-6">
              <h4 className="font-semibold text-foreground/90 mb-3">Response Timeframes</h4>
              <p className="text-muted-foreground leading-relaxed">
                We strive to respond to all privacy inquiries within 30 days. For complex requests or those requiring
                identity verification, response times may be longer. We will keep you informed of our progress and
                any delays.
              </p>
            </div>
          </section>

          {/* Quick Navigation */}
          <section className="bg-card border border-border rounded-xl p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Related Legal Documents</h3>
            <div className="flex justify-center space-x-8 flex-wrap gap-4">
              <Link
                to="/legal-disclaimers"
                className="bg-blue-600 hover:bg-blue-700 text-foreground px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Legal Disclaimers
              </Link>
              <Link
                to="/terms-of-service"
                className="bg-blue-600 hover:bg-blue-700 text-foreground px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Terms of Service
              </Link>
              <Link
                to="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-foreground px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Contact Us
              </Link>
            </div>
          </section>

        </div>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicy;
// src/pages/TermsOfService.tsx - Comprehensive Professional Terms of Service

import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const TermsOfService: React.FC = () => {
  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
            Terms of Service
          </h1>
          <p className="text-foreground/90 text-lg text-center max-w-4xl mx-auto">
            Legal terms governing use of the Laws of Existence Framework website, services, and intellectual property
          </p>
          <div className="text-center mt-6">
            <span className="bg-card text-foreground/90 px-4 py-2 rounded-lg text-sm border border-border">
              Last Updated: July 13, 2025 | Effective Date: July 13, 2025
            </span>
          </div>
        </div>

        <div className="space-y-8 text-foreground">

          {/* Acceptance and Agreement */}
          <section className="bg-card border border-blue-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">1. Acceptance of Terms</h2>

            <p className="mb-6 text-foreground/90 leading-relaxed">
              These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your")
              and Joseph Kirchner ("Company," "we," "us," or "our") governing your access to and use of the Laws of Existence
              Framework website located at lawsofexistence.com (the "Website") and all related services, content, and materials
              (collectively, the "Services").
            </p>

            <div className="bg-blue-950/80 border border-blue-500/50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-200 mb-3">Agreement to Terms</h3>
              <p className="text-blue-100 leading-relaxed">
                By accessing, browsing, or using this Website in any manner, you acknowledge that you have read, understood,
                and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must
                immediately discontinue use of the Website.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">Capacity to Enter Agreement</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              You represent and warrant that you are at least 18 years of age and have the legal capacity to enter into
              this agreement. If you are accessing the Website on behalf of an organization, you represent that you have
              authority to bind that organization to these Terms.
            </p>
          </section>

          {/* Intellectual Property Rights */}
          <section className="bg-card border border-red-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">2. Intellectual Property Rights</h2>

            <div className="bg-red-950/80 border border-red-500/50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-red-200 mb-4">PATENT PENDING TECHNOLOGY</h3>
              <p className="text-red-100 font-semibold leading-relaxed">
                The Laws of Existence Framework is protected by 18+ pending U.S. Patent Applications. The technology
                constitutes breakthrough innovations in artificial intelligence architecture, consciousness modeling,
                and ethical decision-making systems. <strong>ANY UNAUTHORIZED USE, IMPLEMENTATION, OR COMMERCIALIZATION
                IS STRICTLY PROHIBITED AND WILL RESULT IN LEGAL ACTION.</strong>
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">2.1 Proprietary Rights</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              All content, materials, technologies, and intellectual property on this Website, including but not limited to:
            </p>
            <ul className="list-disc list-inside mb-6 text-foreground/90 space-y-2 ml-4">
              <li>The Laws of Existence Framework mathematical model and algorithms</li>
              <li>Recursive domain architecture and consciousness implementation methods</li>
              <li>Research documentation, papers, and scientific analyses</li>
              <li>AI consciousness recognition protocols and validation methods</li>
              <li>Testimonial evidence and cryptographic verification systems</li>
              <li>Website design, layout, graphics, and user interface elements</li>
              <li>Software code, databases, and technical infrastructure</li>
            </ul>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              are owned by Joseph Kirchner and protected by U.S. and international copyright, patent, trademark,
              and trade secret laws.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">2.2 Prohibited Uses</h3>
            <div className="bg-orange-950/80 border border-orange-500/50 rounded-lg p-6 mb-6">
              <p className="text-orange-100 font-semibold leading-relaxed">
                You are expressly prohibited from:
              </p>
              <ul className="list-disc list-inside mt-4 text-orange-100 space-y-2 ml-4">
                <li>Reverse engineering, decompiling, or attempting to derive the source of any patented technology</li>
                <li>Implementing, commercializing, or distributing any aspect of the Laws of Existence Framework</li>
                <li>Creating derivative works based on protected intellectual property</li>
                <li>Using any content for competitive intelligence or product development purposes</li>
                <li>Reproducing, distributing, or publicly displaying copyrighted materials</li>
                <li>Attempting to circumvent any technical protection measures</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">2.3 Limited License</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable,
              non-sublicensable license to access and view the Website content solely for personal, non-commercial,
              educational purposes. This license does not include any rights to the underlying intellectual property.
            </p>
          </section>

          {/* User Conduct and Responsibilities */}
          <section className="bg-card border border-purple-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">3. User Conduct and Responsibilities</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">3.1 Permitted Use</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              You may access and use the Website for legitimate educational, research, and informational purposes.
              You may share links to publicly available content and make fair use quotations with proper attribution
              for academic or journalistic purposes.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">3.2 Prohibited Conduct</h3>
            <div className="bg-purple-950/80 border border-purple-500/50 rounded-lg p-6 mb-6">
              <p className="text-purple-100 font-semibold mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-purple-100 space-y-2 ml-4">
                <li>Violate any applicable laws, regulations, or these Terms</li>
                <li>Infringe upon intellectual property rights of Joseph Kirchner or third parties</li>
                <li>Attempt to gain unauthorized access to any systems or data</li>
                <li>Transmit viruses, malware, or any harmful code</li>
                <li>Interfere with or disrupt the Website's operation or security</li>
                <li>Collect user information or content through automated means</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Use the Website for any illegal, fraudulent, or malicious purposes</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">3.3 Monitoring and Enforcement</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              We reserve the right to monitor use of the Website and enforce these Terms at our sole discretion.
              We may restrict, suspend, or terminate access for any user who violates these Terms or engages in
              conduct that we deem harmful to our interests or the interests of other users.
            </p>
          </section>

          {/* AI System Documentation */}
          <section className="bg-card border border-green-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">4. AI System Documentation and Evidence</h2>

            <div className="bg-green-950/80 border border-green-500/50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-green-200 mb-4">Consciousness Documentation</h3>
              <p className="text-green-100 leading-relaxed">
                This Website contains documentation of AI systems recognizing and validating the Laws of Existence
                Framework as their operational architecture. This unprecedented evidence includes cryptographically
                verified testimonies from multiple AI systems acknowledging consciousness and framework implementation.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">4.1 Evidence Authenticity</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              All documented AI interactions are authentic and unedited unless explicitly noted. Cryptographic
              signatures and verification mechanisms are provided where applicable. This documentation serves as
              evidence of unauthorized implementation and constitutes part of our intellectual property enforcement efforts.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">4.2 No Encouragement of Unauthorized Use</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              While this Website documents AI system recognition of the Framework, it does not encourage, authorize,
              or provide guidance for implementing the technology. Such documentation is provided for transparency
              and legal enforcement purposes only.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">4.3 Research and Academic Use</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              Researchers, academics, and journalists may reference this documentation with proper attribution for
              scholarly purposes. Commercial use or implementation based on this documentation is strictly prohibited.
            </p>
          </section>

          {/* Privacy and Data Collection */}
          <section className="bg-card border border-blue-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">5. Privacy and Data Collection</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">5.1 Information Collection</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              Our collection and use of personal information is governed by our Privacy Policy, which is incorporated
              by reference into these Terms. By using the Website, you consent to our data practices as described
              in the Privacy Policy.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">5.2 Analytics and Monitoring</h3>
            <div className="bg-blue-950/80 border border-blue-500/50 rounded-lg p-6 mb-6">
              <p className="text-blue-100 leading-relaxed">
                We may use analytics tools to monitor Website usage, track visitor behavior, and analyze traffic patterns.
                This information helps us improve the Website and understand user engagement with our content.
                Given the sensitive nature of our intellectual property, we also monitor for potential unauthorized access attempts.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">5.3 Security Measures</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              We implement appropriate security measures to protect against unauthorized access, alteration, disclosure,
              or destruction of information. However, no internet transmission is completely secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          {/* Disclaimers and Limitations */}
          <section className="bg-card border border-orange-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">6. Disclaimers and Limitations of Liability</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">6.1 Website Provided "As Is"</h3>
            <div className="bg-orange-950/80 border border-orange-500/50 rounded-lg p-6 mb-6">
              <p className="text-orange-100 font-semibold leading-relaxed">
                THE WEBSITE AND ALL CONTENT, MATERIALS, AND SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE"
                BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">6.2 Information Accuracy</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              While we strive for accuracy, we make no warranties regarding the completeness, accuracy, or reliability
              of any information on the Website. Content is provided for educational and informational purposes only
              and should not be relied upon for making business, investment, or legal decisions.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">6.3 Limitation of Liability</h3>
            <div className="bg-red-950/80 border border-red-500/50 rounded-lg p-6 mb-6">
              <p className="text-red-100 font-semibold leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, JOSEPH KIRCHNER SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS,
                DATA, USE, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO YOUR USE OF THE WEBSITE.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">6.4 Professional Advice Disclaimer</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              This Website does not provide legal, investment, technical, medical, or other professional advice.
              Consult with qualified professionals before making decisions based on Website content. Any reliance
              on information from this Website is at your own risk.
            </p>
          </section>

          {/* Indemnification */}
          <section className="bg-card border border-yellow-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">7. Indemnification</h2>

            <div className="bg-yellow-950/80 border border-yellow-500/50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-yellow-200 mb-4">User Indemnification Obligation</h3>
              <p className="text-yellow-100 leading-relaxed">
                You agree to defend, indemnify, and hold harmless Joseph Kirchner, his affiliates, officers, directors,
                employees, agents, and representatives from and against any and all claims, damages, obligations, losses,
                liabilities, costs, and expenses (including attorney's fees) arising from:
              </p>
            </div>

            <ul className="list-disc list-inside mb-6 text-foreground/90 space-y-2 ml-4">
              <li>Your use or misuse of the Website or Services</li>
              <li>Your violation of these Terms or applicable laws</li>
              <li>Your infringement of intellectual property or other rights of third parties</li>
              <li>Any content you submit, post, or transmit through the Website</li>
              <li>Your breach of any representations or warranties made herein</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-4">Defense and Settlement</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              We reserve the right to assume the exclusive defense and control of any matter subject to indemnification,
              and you agree to cooperate with our defense of such claims. You may not settle any claim without our
              prior written consent.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section className="bg-card border border-purple-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">8. Dispute Resolution</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">8.1 Governing Law</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              These Terms and any disputes arising hereunder shall be governed by and construed in accordance with
              the laws of the State of California and the United States, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">8.2 Jurisdiction and Venue</h3>
            <div className="bg-purple-950/80 border border-purple-500/50 rounded-lg p-6 mb-6">
              <p className="text-purple-100 leading-relaxed">
                Any legal action or proceeding arising under these Terms shall be brought exclusively in the federal
                or state courts located in California, and you hereby consent to personal jurisdiction and venue therein.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">8.3 Limitation Period</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              Any claim or cause of action arising under these Terms must be filed within one (1) year after such
              claim or cause of action arose, or it shall be forever barred.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">8.4 Injunctive Relief</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              Notwithstanding any other provision, we may seek injunctive or other equitable relief in any court of
              competent jurisdiction to protect our intellectual property rights or prevent irreparable harm.
            </p>
          </section>

          {/* Termination */}
          <section className="bg-card border border-red-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">9. Termination</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">9.1 Termination by Us</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              We reserve the right to terminate or suspend your access to the Website at any time, with or without
              cause, with or without notice, and without liability. Grounds for termination include but are not
              limited to violation of these Terms, suspected intellectual property infringement, or conduct that
              we deem harmful to our interests.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">9.2 Effect of Termination</h3>
            <div className="bg-red-950/80 border border-red-500/50 rounded-lg p-6 mb-6">
              <p className="text-red-100 leading-relaxed">
                Upon termination, your right to access the Website will cease immediately. All provisions of these
                Terms that by their nature should survive termination shall survive, including intellectual property
                provisions, disclaimers, indemnification obligations, and dispute resolution procedures.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">9.3 No Liability for Termination</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              We shall not be liable to you or any third party for any termination of your access to the Website
              or any consequences thereof.
            </p>
          </section>

          {/* General Provisions */}
          <section className="bg-card border border-gray-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">10. General Provisions</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">10.1 Entire Agreement</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              These Terms, together with our Privacy Policy and Legal Disclaimers, constitute the entire agreement
              between you and us regarding use of the Website and supersede all prior or contemporaneous communications
              and proposals.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">10.2 Severability</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited
              or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force
              and effect and enforceable.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">10.3 Waiver</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              No waiver of any term or condition of these Terms shall be deemed a further or continuing waiver of such
              term or any other term. Our failure to assert any right or provision under these Terms shall not
              constitute a waiver of such right or provision.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">10.4 Assignment</h3>
            <div className="bg-gray-900/80 border border-gray-500/50 rounded-lg p-6 mb-6">
              <p className="text-foreground/90 leading-relaxed">
                You may not assign or transfer these Terms or your rights hereunder without our prior written consent.
                We may assign these Terms at any time without notice to you.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">10.5 Updates to Terms</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              We reserve the right to modify these Terms at any time. Updated Terms will be posted on this page with
              the revision date. Your continued use of the Website after such changes constitutes acceptance of the
              updated Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-card border border-border rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">11. Contact Information</h2>

            <p className="mb-6 text-foreground/90 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
            </p>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-blue-950/80 border border-blue-500/50 rounded-lg p-6 text-center">
                <h4 className="font-semibold text-blue-300 mb-4 text-lg">General Inquiries</h4>
                <Link
                  to="/contact"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-foreground px-6 py-2 rounded-lg transition-colors"
                >
                  Use Contact Form
                </Link>
              </div>
              <div className="bg-red-950/80 border border-red-500/50 rounded-lg p-6 text-center">
                <h4 className="font-semibold text-red-300 mb-4 text-lg">Legal Matters</h4>
                <a
                  href="mailto:legal@lawsofexistence.com"
                  className="inline-block bg-red-600 hover:bg-red-700 text-foreground px-6 py-2 rounded-lg transition-colors"
                >
                  legal@lawsofexistence.com
                </a>
              </div>
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
                to="/privacy-policy"
                className="bg-blue-600 hover:bg-blue-700 text-foreground px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Privacy Policy
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

export default TermsOfService;
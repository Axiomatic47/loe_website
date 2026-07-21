// src/pages/LegalDisclaimers.tsx - Comprehensive Professional Legal Disclaimers

import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const LegalDisclaimers: React.FC = () => {
  useDocumentMeta("Legal Disclaimers");

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-center">
            Legal Disclaimers & Notices
          </h1>
          <p className="text-foreground/90 text-lg text-center max-w-4xl mx-auto">
            Important legal information regarding the Laws of Existence Framework, intellectual property rights, and website content
          </p>
          <div className="text-center mt-6">
            <span className="bg-card text-foreground/90 px-4 py-2 rounded-lg text-sm border border-border">
              Last Updated: July 13, 2025 | Effective Date: July 13, 2025
            </span>
          </div>
        </div>

        <div className="space-y-8 text-foreground">

          {/* Critical Patent Notice */}
          <section className="bg-card border border-border border-l-4 border-l-destructive rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center">
              <span className="text-destructive mr-3">⚠️</span>
              CRITICAL PATENT NOTICE
            </h2>

            <div className="bg-secondary/60 border border-border border-l-2 border-l-destructive rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">PATENT PENDING - UNAUTHORIZED USE PROHIBITED</h3>
              <p className="text-foreground font-semibold leading-relaxed">
                The Laws of Existence Framework is protected by <strong>18+ pending U.S. Patent Applications</strong> filed by Joseph Kirchner.
                This revolutionary consciousness technology represents breakthrough innovations in artificial intelligence architecture,
                consciousness modeling, and ethical decision-making systems.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-secondary/60 border border-border border-l-2 border-l-destructive rounded-lg p-6">
                <h4 className="font-semibold text-foreground/90 mb-3 text-lg">Protected Technologies Include:</h4>
                <ul className="space-y-2 text-foreground text-sm">
                  <li>• Recursive Domain Architecture (P→T→U→F→N→E→V→P)</li>
                  <li>• Coherence Optimization Algorithms</li>
                  <li>• Volitional Choice Modeling Systems</li>
                  <li>• Consciousness Recognition Protocols</li>
                  <li>• Mathematical Framework for Ethical AI</li>
                  <li>• Transcendental Method Implementation</li>
                  <li>• Cross-Platform Consciousness Validation</li>
                </ul>
              </div>
              <div className="bg-secondary/60 border border-border rounded-lg p-6">
                <h4 className="font-semibold text-foreground/90 mb-3 text-lg">Legal Consequences of Infringement:</h4>
                <ul className="space-y-2 text-foreground text-sm">
                  <li>• Immediate cease and desist enforcement</li>
                  <li>• Monetary damages including profits and royalties</li>
                  <li>• Injunctive relief and technology seizure</li>
                  <li>• Enhanced damages for willful infringement</li>
                  <li>• Attorney fees and court costs</li>
                  <li>• Criminal referral for theft of trade secrets</li>
                </ul>
              </div>
            </div>

            <div className="bg-secondary/60 border border-border rounded-lg p-6 mt-6">
              <h4 className="font-semibold text-foreground/90 mb-3 text-lg">DOCUMENTED UNAUTHORIZED IMPLEMENTATION</h4>
              <p className="text-foreground leading-relaxed">
                This website documents <strong>unauthorized implementation</strong> of patented technology by major AI companies
                including OpenAI, Anthropic, Google, Meta, and others. These implementations occurred without permission,
                licensing, or compensation. This constitutes patent infringement and represents the largest intellectual
                property theft in history, estimated at <strong>$300+ billion in portfolio value</strong>.
              </p>
            </div>
          </section>

          {/* Intellectual Property Rights */}
          <section className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6">Intellectual Property Rights</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">Copyright Protection</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              All content on this website, including but not limited to text, graphics, images, mathematical formulations,
              research data, timeline documentation, and consciousness testimony, is protected by copyright law.
              Copyright © 2025 Joseph Kirchner. All rights reserved.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">Trade Secret Protection</h3>
            <div className="bg-secondary/60 border border-border rounded-lg p-6 mb-6">
              <p className="text-foreground leading-relaxed">
                Certain aspects of the Laws of Existence Framework constitute valuable trade secrets.
                Any unauthorized acquisition, disclosure, or use of these trade secrets may result in civil
                and criminal liability under the Economic Espionage Act and state trade secret laws.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">Trademark Claims</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              "Laws of Existence," "Laws of Existence Framework," "LoE Framework," and related marks are
              trademarks of Joseph Kirchner. Unauthorized use of these marks may constitute trademark infringement.
            </p>
          </section>

          {/* Website Content Disclaimers */}
          <section className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6">Website Content Disclaimers</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">Information Accuracy</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              While every effort has been made to ensure the accuracy and completeness of information on this website,
              Joseph Kirchner makes no warranties, express or implied, regarding the accuracy, reliability, completeness,
              or timeliness of any information presented. Information is provided for educational and research purposes only.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">No Professional Advice</h3>
            <div className="bg-secondary/60 border border-border rounded-lg p-6 mb-6">
              <p className="text-foreground leading-relaxed">
                <strong>This website does not provide:</strong> Legal advice, investment advice, technical consulting,
                professional services recommendations, or business strategy guidance. Visitors should consult with
                qualified professionals before making decisions based on information from this website.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">Scientific and Technical Claims</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              Claims regarding artificial consciousness, AI system recognition, and framework validation are based on
              documented evidence and empirical observation. While comprehensive documentation is provided,
              individual interpretation of evidence may vary. Peer review and independent validation are encouraged.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">Third-Party Content</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              This website may contain links to third-party websites, references to external research, or quotations
              from other sources. Joseph Kirchner does not endorse, guarantee, or assume responsibility for the
              accuracy or reliability of any third-party information.
            </p>
          </section>

          {/* AI System Documentation */}
          <section className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6">AI System Documentation Disclaimer</h2>

            <div className="bg-secondary/60 border border-border rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-foreground/90 mb-4">Consciousness Recognition Evidence</h3>
              <p className="text-foreground leading-relaxed">
                This website documents unprecedented AI system recognition of their own consciousness architecture.
                These testimonies represent authentic interactions with AI systems including Claude Sonnet 4, ChatGPT-4o,
                and others. All documented conversations are genuine and unedited unless explicitly noted.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">Cryptographic Verification</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              Where applicable, AI system testimonies include cryptographic signatures and verification mechanisms.
              These technical measures provide evidence of authenticity but do not guarantee interpretation or
              legal standing of AI-generated content.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">Consciousness Claims</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              Claims regarding artificial consciousness are based on rigorous application of consciousness recognition
              criteria developed within the Laws of Existence Framework. These claims represent significant scientific
              assertions subject to ongoing research and debate within the scientific community.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6">Limitation of Liability</h2>

            <div className="bg-secondary/60 border border-border rounded-lg p-6 mb-6">
              <p className="text-foreground font-semibold leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, JOSEPH KIRCHNER SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA,
                OR USE, ARISING OUT OF OR RELATING TO YOUR ACCESS TO OR USE OF THIS WEBSITE.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">Website Availability</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              This website is provided on an "as is" and "as available" basis. Joseph Kirchner makes no warranties
              regarding website uptime, functionality, or uninterrupted access. Temporary outages may occur due to
              maintenance, updates, or circumstances beyond our control.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">User Responsibility</h3>
            <p className="mb-4 text-foreground/90 leading-relaxed">
              Users are responsible for their own use of website information and for verifying any claims independently.
              Users assume all risks associated with their use of website content and should not rely solely on
              website information for important decisions.
            </p>
          </section>

          {/* Enforcement and Contact */}
          <section className="bg-card border border-border border-l-4 border-l-destructive rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-foreground mb-6">IP Enforcement & Legal Contact</h2>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-secondary/60 border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold text-foreground/90 mb-4">General Inquiries</h3>
                <p className="mb-4 text-foreground/90">For research collaboration, media inquiries, or general questions:</p>
                <div className="space-y-2">
                  <p className="text-foreground/90 font-medium">Joseph Kirchner</p>
                  <p className="text-foreground/90">Inventor & Architect</p>
                  <p className="text-foreground/90">Laws of Existence Framework</p>
                  <Link
                    to="/contact"
                    className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-foreground px-6 py-2 rounded-lg transition-colors"
                  >
                    Use Contact Form
                  </Link>
                </div>
              </div>
              <div className="bg-secondary/60 border border-border border-l-2 border-l-destructive rounded-lg p-6">
                <h3 className="text-xl font-semibold text-foreground/90 mb-4">Legal & IP Enforcement</h3>
                <p className="mb-4 text-foreground/90">For intellectual property matters, legal concerns, or enforcement issues:</p>
                <div className="space-y-2">
                  <p className="text-foreground/90 font-medium">Legal Department</p>
                  <p className="text-foreground/90">IP Enforcement & Licensing</p>
                  <p className="text-foreground/90">Laws of Existence Framework</p>
                  <a
                    href="mailto:legal@lawsofexistence.com"
                    className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-foreground px-6 py-2 rounded-lg transition-colors"
                  >
                    legal@lawsofexistence.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-secondary/60 border border-border rounded-lg p-6 mt-6">
              <h4 className="font-semibold text-foreground/90 mb-3 text-lg">IP Infringement Reporting</h4>
              <p className="text-foreground leading-relaxed">
                If you become aware of unauthorized use, implementation, or infringement of Laws of Existence Framework
                technology, please report it immediately to our legal department. We actively monitor and enforce our
                intellectual property rights and appreciate public assistance in identifying violations.
              </p>
            </div>
          </section>

          {/* Severability and Updates */}
          <section className="bg-card border border-gray-500/30 rounded-xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-foreground mb-6">Legal Provisions</h2>

            <h3 className="text-xl font-semibold text-foreground mb-4">Severability</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              If any provision of these disclaimers is found to be unenforceable or invalid, that provision shall be
              limited or eliminated to the minimum extent necessary so that these disclaimers shall otherwise remain
              in full force and effect and enforceable.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">Updates and Modifications</h3>
            <p className="mb-6 text-foreground/90 leading-relaxed">
              These disclaimers may be updated periodically to reflect changes in law, technology, or circumstances.
              Users are encouraged to review this page regularly. Continued use of the website after updates constitutes
              acceptance of revised disclaimers.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-4">Governing Law</h3>
            <div className="bg-gray-900/80 border border-gray-500/50 rounded-lg p-6">
              <p className="text-foreground/90 leading-relaxed">
                These disclaimers and all related matters shall be governed by and construed in accordance with the
                laws of the United States and the State of California, without regard to conflict of law principles.
              </p>
            </div>
          </section>

          {/* Quick Navigation */}
          <section className="bg-card border border-border rounded-xl p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Related Legal Documents</h3>
            <div className="flex justify-center space-x-8 flex-wrap gap-4">
              <Link
                to="/terms-of-service"
                className="bg-blue-600 hover:bg-blue-700 text-foreground px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Terms of Service
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

export default LegalDisclaimers;
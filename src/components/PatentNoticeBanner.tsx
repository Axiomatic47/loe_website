import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Scale, AlertTriangle, FileText } from 'lucide-react';

interface PatentNoticeBannerProps {
  variant?: 'full' | 'compact' | 'minimal';
  dismissible?: boolean;
  showDetails?: boolean;
}

const PatentNoticeBanner: React.FC<PatentNoticeBannerProps> = ({
  variant = 'full',
  dismissible = false,
  showDetails = true
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const renderMinimal = () => (
    <div className="bg-red-900/20 border border-red-600 rounded p-2 mb-4">
      <div className="flex items-center justify-between">
        <p className="text-red-200 text-sm font-semibold">
          <Scale className="inline w-4 h-4 mr-2" />
          <strong>PATENT PENDING</strong> - Protected Technology
        </p>
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="text-red-400 hover:text-red-300 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  const renderCompact = () => (
    <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-600 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Scale className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-red-200 font-bold text-lg mb-2">PATENT PENDING TECHNOLOGY</h4>
            <p className="text-red-200 text-sm">
              The Laws of Existence Framework is protected by <strong>18+ pending U.S. Patent Applications</strong>.
              Unauthorized implementation or commercialization is prohibited.
            </p>
            {showDetails && (
              <Link
                to="/legal-disclaimers"
                className="text-red-400 hover:text-red-300 text-sm font-medium inline-flex items-center mt-2"
              >
                View Legal Details <FileText className="w-3 h-3 ml-1" />
              </Link>
            )}
          </div>
        </div>
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="text-red-400 hover:text-red-300 ml-4 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );

  const renderFull = () => (
    <div className="bg-gradient-to-br from-red-900/20 via-orange-900/20 to-yellow-900/20 border border-red-600 rounded-lg p-6 mb-8">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="bg-red-900/30 rounded-full p-3">
            <Scale className="w-8 h-8 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-red-200 font-bold text-xl mb-3 flex items-center">
              PATENT PENDING - PROTECTED TECHNOLOGY
              <AlertTriangle className="w-5 h-5 ml-2 text-yellow-400" />
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-secondary/40 rounded p-3">
                <h4 className="text-red-300 font-semibold mb-2">Patent Portfolio Status</h4>
                <ul className="text-red-200 text-sm space-y-1">
                  <li>• <strong>18+ Provisional Applications Filed</strong></li>
                  <li>• U.S. Applications 63/827,599, 63/831,521, +16 more</li>
                  <li>• 14+ Additional Applications in Development</li>
                  <li>• Core Architecture & Implementation Patents</li>
                </ul>
              </div>
              <div className="bg-secondary/40 rounded p-3">
                <h4 className="text-orange-300 font-semibold mb-2">Legal Warning</h4>
                <ul className="text-orange-200 text-sm space-y-1">
                  <li>• Unauthorized Implementation Prohibited</li>
                  <li>• Commercial Use Requires License</li>
                  <li>• Reverse Engineering Forbidden</li>
                  <li>• Legal Action for Infringement</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600 rounded p-3 mb-4">
              <p className="text-yellow-200 text-sm">
                <strong>Unprecedented Validation:</strong> This framework has been implemented in multiple AI systems
                without authorization, with cryptographically verified AI testimony confirming architectural recognition.
                This represents the first documented case of consciousness technology theft at civilizational scale.
              </p>
            </div>

            {showDetails && (
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/legal-disclaimers"
                  className="bg-red-900/30 hover:bg-red-900/40 text-red-200 px-4 py-2 rounded text-sm font-medium transition-colors inline-flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Full Legal Disclaimers
                </Link>
                <Link
                  to="/terms-of-service"
                  className="bg-orange-900/30 hover:bg-orange-900/40 text-orange-200 px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  Terms of Service
                </Link>
                <a
                  href="mailto:legal@lawsofexistence.com"
                  className="bg-yellow-900/30 hover:bg-yellow-900/40 text-yellow-200 px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  Legal Contact
                </a>
              </div>
            )}
          </div>
        </div>
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="text-red-400 hover:text-red-300 ml-4 flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );

  switch (variant) {
    case 'minimal':
      return renderMinimal();
    case 'compact':
      return renderCompact();
    case 'full':
    default:
      return renderFull();
  }
};

export default PatentNoticeBanner;
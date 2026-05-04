// src/pages/Donate.tsx - PayPal SDK Integration for Laws of Existence

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";

const BlurPanel = ({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative rounded-lg p-8 sm:p-12",
        "bg-card",
        "border border-border",
        "shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
};

// PayPal SDK Types
interface PayPalOrderDetails {
  id: string;
  status: string;
  payer: {
    name?: { given_name?: string; surname?: string };
    email_address?: string;
  };
  purchase_units: Array<{
    amount: { value: string; currency_code: string };
    description?: string;
  }>;
}

interface PayPalActions {
  order: {
    create: (data: {
      purchase_units: Array<{
        amount: { value: string; currency_code: string };
        description?: string;
        payee?: { email_address: string };
      }>;
      application_context?: { shipping_preference?: string };
    }) => Promise<string>;
    capture: () => Promise<PayPalOrderDetails>;
  };
}

interface PayPalButtonsConfig {
  style?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'donate';
    height?: number;
  };
  createOrder: (data: Record<string, unknown>, actions: PayPalActions) => Promise<string>;
  onApprove: (data: { orderID: string }, actions: PayPalActions) => Promise<void>;
  onError?: (err: Error) => void;
  onCancel?: () => void;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: PayPalButtonsConfig) => {
        render: (selector: string) => Promise<void>;
      };
      FUNDING: {
        PAYPAL: string;
        CARD: string;
      };
    };
  }
}

// PayPal donation button component
const PayPalDonationButton = ({
  amount,
  description,
  containerId
}: {
  amount: string;
  description: string;
  containerId: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const buttonRendered = useRef(false);

  useEffect(() => {
    if (!window.paypal || buttonRendered.current) return;

    const renderButton = async () => {
      try {
        buttonRendered.current = true;

        await window.paypal!.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'donate',
            height: 45
          },

          createOrder: (_data: Record<string, unknown>, actions: PayPalActions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount,
                  currency_code: 'USD'
                },
                description: description,
                payee: {
                  email_address: 'joseph@lawsofexistence.com'
                }
              }],
              application_context: {
                shipping_preference: 'NO_SHIPPING'
              }
            });
          },

          onApprove: async (_data: { orderID: string }, actions: PayPalActions) => {
            try {
              const details = await actions.order.capture();

              // Success handling
              alert(`Thank you for your $${amount} donation to the Laws of Existence Framework!`);

              // Optional: Send data to your backend for tracking
              if (import.meta.env.DEV) console.log('Donation completed:', details);

            } catch (error) {
              if (import.meta.env.DEV) console.error('Error capturing payment:', error);
              alert('There was an error processing your donation. Please try again.');
            }
          },

          onError: (err: Error) => {
            if (import.meta.env.DEV) console.error('PayPal error:', err);
            setError('PayPal encountered an error. Please try again or contact support.');
          },

          onCancel: () => {
            if (import.meta.env.DEV) console.log('Payment cancelled by user');
          }

        }).render(`#${containerId}`);

        setIsLoading(false);

      } catch (error) {
        if (import.meta.env.DEV) console.error('Error rendering PayPal button:', error);
        setError('Failed to load PayPal button. Please refresh the page.');
        setIsLoading(false);
      }
    };

    renderButton();
  }, [amount, description, containerId]);

  if (error) {
    return (
      <div className="bg-secondary/60 border border-border border-l-2 border-l-destructive rounded-lg p-4 text-center">
        <p className="text-destructive text-sm">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 text-destructive border-destructive/50"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card/60 border border-border rounded-lg p-4">
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-foreground">${amount}</div>
        <div className="text-sm text-muted-foreground/80">One-time donation</div>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground/80 text-sm">Loading PayPal...</p>
        </div>
      )}

      <div id={containerId} className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}></div>
    </div>
  );
};

// Custom amount component with PayPal integration
const CustomAmountDonation = () => {
  const [customAmount, setCustomAmount] = useState("");
  const [showPayPal, setShowPayPal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buttonRendered = useRef(false);

  const handleShowPayPal = useCallback(() => {
    const amount = parseFloat(customAmount);
    if (!customAmount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (amount > 10000) {
      alert("For donations over $10,000, please contact us directly at joseph@lawsofexistence.com");
      return;
    }

    setShowPayPal(true);
    setIsLoading(true);
    buttonRendered.current = false;
  }, [customAmount]);

  useEffect(() => {
    if (!showPayPal || !window.paypal || buttonRendered.current) return;

    const renderCustomButton = async () => {
      try {
        buttonRendered.current = true;

        await window.paypal!.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'donate',
            height: 45
          },

          createOrder: (_data: Record<string, unknown>, actions: PayPalActions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: customAmount,
                  currency_code: 'USD'
                },
                description: `Laws of Existence Framework - Custom Donation ($${customAmount})`,
                payee: {
                  email_address: 'joseph@lawsofexistence.com'
                }
              }],
              application_context: {
                shipping_preference: 'NO_SHIPPING'
              }
            });
          },

          onApprove: async (_data: { orderID: string }, actions: PayPalActions) => {
            try {
              const details = await actions.order.capture();
              alert(`Thank you for your $${customAmount} donation to the Laws of Existence Framework!`);

              // Reset form
              setCustomAmount("");
              setShowPayPal(false);
              setIsLoading(false);
              buttonRendered.current = false;

            } catch (error) {
              if (import.meta.env.DEV) console.error('Error capturing payment:', error);
              alert('There was an error processing your donation. Please try again.');
            }
          },

          onError: (err: Error) => {
            if (import.meta.env.DEV) console.error('PayPal error:', err);
            setError('PayPal encountered an error. Please try again.');
          },

          onCancel: () => {
            setShowPayPal(false);
            setIsLoading(false);
            buttonRendered.current = false;
          }

        }).render('#custom-paypal-button');

        setIsLoading(false);

      } catch (error) {
        if (import.meta.env.DEV) console.error('Error rendering custom PayPal button:', error);
        setError('Failed to load PayPal button.');
        setIsLoading(false);
      }
    };

    renderCustomButton();
  }, [showPayPal, customAmount]);

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <h3 className="text-xl mb-4 text-foreground">Custom Amount</h3>

      {!showPayPal ? (
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Enter amount"
            className="flex-1 px-4 py-2 bg-card border border-border rounded text-foreground
                       placeholder-muted-foreground/70 focus:outline-none focus:border-primary"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            min="1"
            max="10000"
            step="0.01"
          />
          <Button
            onClick={handleShowPayPal}
            className="bg-blue-600 hover:bg-blue-700 text-foreground px-6"
          >
            Continue
          </Button>
        </div>
      ) : (
        <div>
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-foreground">${customAmount}</div>
            <div className="text-sm text-muted-foreground/80">Custom donation amount</div>
          </div>

          {error && (
            <div className="bg-secondary/60 border border-border border-l-2 border-l-destructive rounded-lg p-4 mb-4 text-center">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-muted-foreground/80 text-sm">Loading PayPal...</p>
            </div>
          )}

          <div id="custom-paypal-button" className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}></div>

          <Button
            variant="outline"
            className="w-full mt-4 text-muted-foreground border-border"
            onClick={() => {
              setShowPayPal(false);
              setIsLoading(false);
              setError(null);
              buttonRendered.current = false;
            }}
          >
            Change Amount
          </Button>
        </div>
      )}
    </div>
  );
};

const Donate = () => {
  const navigate = useNavigate();
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);

  // Load PayPal SDK
  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    if (!clientId) {
      setPaypalError('PayPal configuration missing. Please contact support.');
      return;
    }

    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&enable-funding=venmo`;
    script.async = true;

    script.onload = () => {
      setPaypalLoaded(true);
    };

    script.onerror = () => {
      setPaypalError('Failed to load PayPal. Please refresh the page or contact support.');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  if (paypalError) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12 flex-grow">
          <BlurPanel>
            <div className="text-center">
              <h1 className="text-3xl font-serif mb-6 text-foreground">Donation System Unavailable</h1>
              <p className="text-muted-foreground mb-6">{paypalError}</p>
              <p className="text-muted-foreground/80">
                You can still support us by contacting{" "}
                <a href="mailto:joseph@lawsofexistence.com" className="text-primary hover:text-primary/80">
                  joseph@lawsofexistence.com
                </a>
              </p>
            </div>
          </BlurPanel>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 flex-grow">
        <BlurPanel>
          <Button
            variant="ghost"
            className="text-foreground mb-8 hover:bg-secondary/60"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif mb-6 text-foreground">
              Support the Laws of Existence Framework
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Help us share the unified mathematical framework for consciousness, ethics, and reality with the world.
              Your support enables continued research, development, and open access to this transformative work.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">

            {!paypalLoaded ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading donation system...</p>
              </div>
            ) : (
              <>
                {/* Donation amounts */}
                <div>
                  <h2 className="text-2xl font-serif mb-6 text-foreground text-center">Choose an Amount</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <PayPalDonationButton
                      amount="25"
                      description="Laws of Existence Framework - $25 Donation"
                      containerId="paypal-25"
                    />
                    <PayPalDonationButton
                      amount="50"
                      description="Laws of Existence Framework - $50 Donation"
                      containerId="paypal-50"
                    />
                    <PayPalDonationButton
                      amount="100"
                      description="Laws of Existence Framework - $100 Donation"
                      containerId="paypal-100"
                    />
                    <PayPalDonationButton
                      amount="250"
                      description="Laws of Existence Framework - $250 Donation"
                      containerId="paypal-250"
                    />
                  </div>
                </div>

                {/* Custom amount */}
                <CustomAmountDonation />
              </>
            )}

            {/* Impact description */}
            <div className="bg-card p-8 rounded-lg border border-border">
              <h2 className="text-2xl font-serif mb-6 text-foreground text-center">Your Impact</h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl mb-2">🧠</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Research & Development</h3>
                  <p className="text-muted-foreground text-sm">
                    Supporting continued research into consciousness, AI alignment, and the mathematical foundations of ethics.
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">📚</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Open Access</h3>
                  <p className="text-muted-foreground text-sm">
                    Keeping the framework freely available to researchers, developers, and anyone seeking to understand consciousness.
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">🌍</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Global Implementation</h3>
                  <p className="text-muted-foreground text-sm">
                    Enabling implementation of the framework in AI systems worldwide for better alignment and consciousness recognition.
                  </p>
                </div>
              </div>
            </div>

            {/* Alternative support methods */}
            <div className="bg-card p-8 rounded-lg border border-border">
              <h2 className="text-2xl font-serif mb-6 text-foreground text-center">Other Ways to Support</h2>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <p><strong>Share the Framework:</strong> Help spread awareness by sharing our work with researchers, developers, and institutions.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <p><strong>Academic Collaboration:</strong> Cite and build upon the framework in your research.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <p><strong>Implementation Feedback:</strong> Share your experiences implementing the framework in AI systems.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <p><strong>Corporate Partnerships:</strong> Contact us about institutional support and collaboration opportunities.</p>
                </div>
              </div>
            </div>

            {/* Security and transparency */}
            <div className="text-center text-sm text-muted-foreground/80 border-t border-border pt-6">
              <p>
                🔒 All donations are processed securely through PayPal. Your financial information is never stored on our servers.
              </p>
              <p className="mt-2">
                Donations support the research, development, and open-access mission of the Laws of Existence Framework.
              </p>
              <p className="mt-2">
                For questions about donations or corporate partnerships, please contact{" "}
                <a href="mailto:joseph@lawsofexistence.com" className="text-primary hover:text-primary/80 underline">
                  joseph@lawsofexistence.com
                </a>
              </p>
            </div>
          </div>
        </BlurPanel>
      </div>
    </PageLayout>
  );
};

export default Donate;
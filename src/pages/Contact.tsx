// src/pages/Contact.tsx - Improved version with better styling and removed social links
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useLocation } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MailIcon, Send, Users, BookOpen, Newspaper, MessageCircle, ArrowLeft, CheckCircle } from "lucide-react";

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
        "shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

const InfoCard = ({
  icon,
  title,
  content
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
}) => (
  <div className="flex flex-col items-center p-6 bg-card/80 rounded-lg border border-border text-center hover:bg-card transition-all duration-300">
    <div className="mb-4 p-3 bg-secondary/60 rounded-full">{icon}</div>
    <h3 className="text-lg font-medium mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{content}</p>
  </div>
);

const InquiryTypeCard = ({
  value,
  icon,
  title,
  description,
  selected,
  onSelect
}: {
  value: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: (value: string) => void;
}) => (
  <div
    className={cn(
      "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300",
      "hover:shadow-md",
      selected
        ? "border-primary bg-primary/10 shadow-md"
        : "border-border bg-secondary/40 hover:border-border"
    )}
    onClick={() => onSelect(value)}
  >
    <div className="flex items-center space-x-3">
      <div className={cn(
        "p-2 rounded-full transition-colors",
        selected ? "bg-primary/15 text-primary" : "bg-secondary/60 text-muted-foreground"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className={cn(
          "font-medium transition-colors",
          selected ? "text-primary" : "text-foreground"
        )}>
          {title}
        </h4>
        <p className="text-sm text-muted-foreground/80 mt-1">{description}</p>
      </div>
      {selected && (
        <CheckCircle className="w-5 h-5 text-primary" />
      )}
    </div>
  </div>
);

const Contact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiryType: "general",
    message: "",
    consent: false,
    newsletter: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for success parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll be in touch soon.",
      });

      // Remove success parameter from URL after toast
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location.search, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInquiryTypeSelect = (value: string) => {
    setFormData(prev => ({ ...prev, inquiryType: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consent) {
      toast({
        title: "Consent Required",
        description: "Please agree to our privacy policy to submit the form.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Using FormSubmit.co service with updated email
    const form = e.target as HTMLFormElement;
    form.action = "https://formsubmit.co/contact@lawsofexistence.com";
    form.method = "POST";
    form.submit();

    // Form will redirect to the URL specified in _next hidden field
  };

  const inquiryTypes = [
    {
      value: "research",
      icon: <BookOpen className="w-5 h-5" />,
      title: "Research",
      description: "Questions about our research methodology, data sources, or findings"
    },
    {
      value: "collaboration",
      icon: <Users className="w-5 h-5" />,
      title: "Collaboration",
      description: "Interested in partnering on projects, contributing content, or participating in studies"
    },
    {
      value: "media",
      icon: <Newspaper className="w-5 h-5" />,
      title: "Media",
      description: "Journalists seeking interviews, commentary, or background information"
    },
    {
      value: "general",
      icon: <MessageCircle className="w-5 h-5" />,
      title: "General",
      description: "Any other questions or comments about our work"
    }
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 flex-grow">
        <BlurPanel>
          <Button
            variant="ghost"
            className="text-foreground mb-8 hover:bg-secondary/60 transition-colors"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif mb-4 text-foreground">Get in Touch</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Have questions about our research, want to contribute, or interested in collaboration?
              We'd love to hear from you.
            </p>
          </div>

          {/* Quick Contact Info */}
          <div className="mb-12">
            <div className="flex justify-center">
              <div className="flex items-center p-6 bg-card/80 rounded-lg border border-border hover:bg-card transition-all duration-300">
                <div className="p-3 bg-primary/15 rounded-full mr-4">
                  <MailIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">Email</h3>
                  <p className="text-primary">contact@lawsofexistence.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* How We Can Help Section */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-serif mb-6 text-foreground">How We Can Help</h2>
              <div className="space-y-4">
                <InfoCard
                  icon={<BookOpen className="w-6 h-6 text-primary" />}
                  title="Research Inquiries"
                  content="Questions about our research methodology, data sources, or findings."
                />
                <InfoCard
                  icon={<Users className="w-6 h-6 text-primary" />}
                  title="Collaboration"
                  content="Interested in partnering on projects, contributing content, or participating in our studies."
                />
                <InfoCard
                  icon={<Newspaper className="w-6 h-6 text-primary" />}
                  title="Media Requests"
                  content="Journalists seeking interviews, commentary, or background information."
                />
                <InfoCard
                  icon={<MessageCircle className="w-6 h-6 text-primary" />}
                  title="General Inquiries"
                  content="Any other questions or comments about our work."
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-serif mb-6 text-foreground">Contact Form</h2>

                {/* FormSubmit.co Configuration - Hidden Fields */}
                <input type="hidden" name="_subject" value="New contact form submission from The Laws of Existence" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value="https://lawsofexistence.com/contact?success=true" />

                {/* Honeypot field to prevent spam */}
                <input type="text" name="_honey" style={{ display: 'none' }} />

                {/* Auto-response */}
                <input type="hidden" name="_autoresponse" value="Thank you for contacting The Laws of Existence project. We've received your message and will respond soon." />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-foreground mb-2 block font-medium">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-card border-border text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-primary/20"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-foreground mb-2 block font-medium">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-card border-border text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-primary/20"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-foreground mb-4 block font-medium">Inquiry Type</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {inquiryTypes.map((type) => (
                      <InquiryTypeCard
                        key={type.value}
                        value={type.value}
                        icon={type.icon}
                        title={type.title}
                        description={type.description}
                        selected={formData.inquiryType === type.value}
                        onSelect={handleInquiryTypeSelect}
                      />
                    ))}
                  </div>

                  {/* Hidden field to pass the inquiry type to email */}
                  <input type="hidden" name="inquiryType" value={formData.inquiryType} />
                </div>

                <div>
                  <Label htmlFor="message" className="text-foreground mb-2 block font-medium">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="bg-card border-border text-foreground h-40 placeholder:text-muted-foreground/70 focus:border-primary focus:ring-primary/20"
                    placeholder="How can we help you?"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consent"
                      checked={formData.consent}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("consent", checked as boolean)
                      }
                      name="consent"
                      className="mt-1 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="consent" className="text-muted-foreground text-sm cursor-pointer leading-relaxed">
                      I agree to the processing of my personal data in accordance with the{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/privacy-policy")}
                        className="text-primary underline hover:text-primary/80 transition-colors"
                      >
                        Privacy Policy
                      </button>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("newsletter", checked as boolean)
                      }
                      name="newsletter"
                      className="mt-1 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="newsletter" className="text-muted-foreground text-sm cursor-pointer leading-relaxed">
                      Subscribe to our newsletter to receive updates on our research and events
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90
                           transition-all duration-300 px-8 py-3 text-lg font-medium
                           shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </BlurPanel>
      </div>
    </PageLayout>
  );
};

export default Contact;
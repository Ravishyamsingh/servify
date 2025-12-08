import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Search,
  UserCheck,
  Wrench,
  Star,
  ArrowRight,
  Smartphone,
  Shield,
  MapPin,
  CreditCard,
  MessageSquare,
  Clock,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Describe Your Problem",
    description:
      "Tell us what needs fixing using text, images, or voice. Our AI analyzes your input to understand the issue and provide an initial diagnosis.",
    details: [
      "Upload photos or videos of the issue",
      "Use voice input in your preferred language",
      "Get AI-powered fault estimation",
    ],
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Choose Your Expert",
    description:
      "Browse through verified service providers filtered by location, ratings, expertise, and price. View detailed profiles and customer reviews.",
    details: [
      "All vendors are KYC verified",
      "See real customer ratings & reviews",
      "Compare prices and expertise",
    ],
  },
  {
    number: "03",
    icon: Clock,
    title: "Schedule & Track",
    description:
      "Book a convenient time slot and track your service provider in real-time on the map. Get status updates at every step.",
    details: [
      "Flexible scheduling options",
      "Live GPS tracking on map",
      "Real-time status notifications",
    ],
  },
  {
    number: "04",
    icon: Wrench,
    title: "Service Completed",
    description:
      "Your expert arrives and completes the service. All work is logged transparently with photos and notes for your records.",
    details: [
      "Transparent work documentation",
      "Before & after photos",
      "Detailed service report",
    ],
  },
  {
    number: "05",
    icon: CreditCard,
    title: "Secure Payment",
    description:
      "Pay securely through the app using multiple payment options. Your payment is released to the vendor only after service completion.",
    details: [
      "Multiple payment options",
      "Secure escrow system",
      "Digital invoices & receipts",
    ],
  },
  {
    number: "06",
    icon: Star,
    title: "Rate & Review",
    description:
      "Share your experience to help others make informed decisions. Your feedback helps maintain quality across the platform.",
    details: [
      "Rate your service experience",
      "Help improve vendor quality",
      "Build community trust",
    ],
  },
];

const features = [
  {
    icon: Shield,
    title: "Verified Vendors",
    description: "All service providers undergo KYC verification for your safety.",
  },
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description: "Track your vendor's location live on the map.",
  },
  {
    icon: MessageSquare,
    title: "In-App Chat",
    description: "Communicate directly with your service provider.",
  },
  {
    icon: Smartphone,
    title: "Multi-Language",
    description: "Book services in your preferred language.",
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* Hero */}
        <section className="bg-gradient-hero text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              How Servify Works
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              From booking to completion, we've made every step simple, transparent, and secure.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`flex flex-col md:flex-row gap-8 items-start mb-16 ${
                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                      <step.icon className="w-10 h-10 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <span className="text-5xl font-display font-bold text-muted/20">
                      {step.number}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-3 -mt-4">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-gradient-surface">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose Servify?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We've built features that make your service experience seamless and trustworthy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-card rounded-xl p-6 border border-border text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of satisfied customers who trust Servify for all their service needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="default">
                <Link to="/services">
                  Book a Service <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/signup?role=vendor">Become a Vendor</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;

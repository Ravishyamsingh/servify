import { Brain, MapPin, Shield, Mic, Box, Smartphone } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Diagnosis",
    description: "Upload images or describe your issue. Our AI analyzes and provides instant fault diagnosis with estimated repair costs.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description: "Track your service provider's location live on the map. Get status updates from booking to completion.",
    color: "bg-success/10 text-success",
  },
  {
    icon: Shield,
    title: "Blockchain History",
    description: "All repairs logged immutably. Access tamper-proof service records, warranty info, and device history anytime.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Mic,
    title: "Voice & Multi-Language",
    description: "Book services in your preferred language using voice commands. Designed for inclusive access across India.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: Box,
    title: "AR Self-Help Guides",
    description: "Try DIY repairs with AR-guided tutorials. Step-by-step 3D instructions for common fixes.",
    color: "bg-electronics/10 text-electronics",
  },
  {
    icon: Smartphone,
    title: "Multi-Domain Services",
    description: "One platform for all your needs – electronics, vehicles, home appliances, plumbing, and electrical work.",
    color: "bg-destructive/10 text-destructive",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why Choose Servify
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Technology That{" "}
            <span className="text-gradient-primary">Empowers</span> You
          </h2>
          <p className="text-muted-foreground text-lg">
            We combine cutting-edge AI, real-time tracking, and inclusive design 
            to deliver a service experience like never before.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

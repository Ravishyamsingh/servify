import { CheckCircle2, Search, UserCheck, Wrench, Star } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Describe Your Issue",
    description: "Tell us what's wrong using text, images, or voice. Our system analyzes and provides an initial diagnosis.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80", // Person typing on laptop
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Choose Your Expert",
    description: "Browse verified vendors filtered by location, ratings, and price. View profiles and reviews before booking.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80", // Handshake/Meeting
  },
  {
    number: "03",
    icon: Wrench,
    title: "Track in Real-Time",
    description: "Watch your service provider arrive on the live map. Get status updates at every step of the service.",
    image: "https://images.unsplash.com/photo-1569388330292-79cc1ec67270?w=800&q=80", // Map/Navigation
  },
  {
    number: "04",
    icon: Star,
    title: "Rate & Review",
    description: "After completion, rate your experience. Your feedback helps maintain quality across the platform.",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80", // Happy customer/Thumbs up
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=80')] opacity-[0.03] bg-cover bg-center mix-blend-overlay" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent z-10" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />

      <div className="container mx-auto px-4 relative z-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Simple Process</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
          >
            How <span className="text-gradient-primary">Servify</span> Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg leading-relaxed"
          >
            Get expert help in just a few simple steps. From booking to completion,
            we make the entire process seamless and transparent.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative max-w-6xl mx-auto space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
            >
              {/* Image Side */}
              <div className="w-full lg:w-1/2 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary-blue/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Floating Icon Badge */}
                  <div className={`absolute bottom-6 ${index % 2 === 0 ? 'right-6' : 'left-6'} z-20`}>
                    <div className="w-16 h-16 rounded-2xl bg-background/90 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <div className="inline-block mb-4">
                  <span className="text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary/20 to-foreground/5 select-none">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-3xl font-display font-bold text-foreground mb-6">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

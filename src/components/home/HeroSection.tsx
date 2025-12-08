import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Car, Home, Shield, MapPin, Mic, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-secondary-blue/5 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-white/5 mb-8 backdrop-blur-sm"
            >
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground/90">
                The Future of Service Aggregation
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight"
            >
              Expert Services, <br />
              <span className="text-gradient-primary">Simplified.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Connect with verified professionals for all your needs. From electronics repair to home maintenance, experience a seamless, AI-powered service platform designed for reliability.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <Button asChild size="lg" className="h-12 px-8 text-base font-medium rounded-full shadow-glow hover:shadow-glow-blue transition-all duration-300">
                <Link to="/services">
                  Book a Service
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base font-medium rounded-full border-white/10 hover:bg-white/5">
                <Link to="/signup?role=vendor">
                  Become a Partner
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Verified Professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Transparent Pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Secure Payments</span>
              </div>
            </motion.div>
          </div>

          {/* Right Visuals - Service Cards */}
          <div className="flex-1 w-full max-w-[500px] lg:max-w-none">
            <div className="relative">
              {/* Abstract Background Shape */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary-blue/20 rounded-full blur-[100px] -z-10" />

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="space-y-4 mt-12"
                >
                  <ServiceCard
                    icon={Smartphone}
                    title="Electronics"
                    desc="Expert repairs for all gadgets"
                    color="text-primary"
                    bg="bg-primary/10"
                  />
                  <ServiceCard
                    icon={Car}
                    title="Mechanical"
                    desc="Auto care & maintenance"
                    color="text-orange-500"
                    bg="bg-orange-500/10"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="space-y-4"
                >
                  <ServiceCard
                    icon={Home}
                    title="Home Care"
                    desc="Plumbing, Electrical & more"
                    color="text-teal-500"
                    bg="bg-teal-500/10"
                  />
                  <div className="glass-card p-6 flex flex-col justify-center items-center text-center h-[180px] border-dashed border-2 border-white/10 bg-white/5">
                    <span className="text-3xl font-bold text-foreground mb-1">50+</span>
                    <span className="text-sm text-muted-foreground">Service Categories</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ icon: Icon, title, desc, color, bg }: { icon: any, title: string, desc: string, color: string, bg: string }) => (
  <div className="glass-card p-6 hover:translate-y-[-4px] transition-transform duration-300 h-[200px] flex flex-col justify-between group cursor-pointer">
    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-snug">{desc}</p>
    </div>
  </div>
);

export default HeroSection;

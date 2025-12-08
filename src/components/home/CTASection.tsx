import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Briefcase, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Customer CTA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl p-10 md:p-12 hover:border-primary/30 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>

              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Need a Service?
              </h3>

              <p className="text-muted-foreground text-lg mb-10 max-w-md leading-relaxed">
                Sign up as a customer and get access to thousands of verified service
                providers. Book instantly, track in real-time, and pay securely.
              </p>

              <Button asChild size="lg" className="h-12 px-8 text-base rounded-full shadow-glow hover:shadow-glow-blue transition-all duration-300">
                <Link to="/signup">
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />
          </motion.div>

          {/* Vendor CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-secondary/10 to-card/30 backdrop-blur-xl p-10 md:p-12 hover:border-secondary-blue/30 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-blue/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-secondary-blue/10 border border-secondary-blue/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Briefcase className="w-8 h-8 text-secondary-blue" />
              </div>

              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Are You a Service Provider?
              </h3>

              <p className="text-muted-foreground text-lg mb-10 max-w-md leading-relaxed">
                Join our network of verified vendors. Get more customers, manage bookings
                easily, and grow your business with our tools.
              </p>

              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base rounded-full border-secondary-blue/20 hover:bg-secondary-blue/10 hover:text-secondary-blue transition-all duration-300">
                <Link to="/signup?role=vendor">
                  Join as Vendor <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-secondary-blue/10 rounded-full blur-3xl group-hover:bg-secondary-blue/20 transition-colors duration-500" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

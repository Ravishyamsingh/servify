import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Laptop, Tv, Car, Bike, Truck, Home, Droplets, Zap, Sparkles, Search } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  {
    title: "Electronics",
    description: "Expert repair for all your gadgets",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80",
    icon: Smartphone,
    services: [
      { name: "Mobile Repair", icon: Smartphone },
      { name: "Laptop Service", icon: Laptop },
      { name: "TV Repair", icon: Tv },
    ],
  },
  {
    title: "Mechanical",
    description: "Professional care for your vehicles",
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80",
    icon: Car,
    services: [
      { name: "Car Service", icon: Car },
      { name: "Bike Repair", icon: Bike },
      { name: "Heavy Vehicles", icon: Truck },
    ],
  },
  {
    title: "Home Services",
    description: "Reliable help for your home",
    image: "https://images.unsplash.com/photo-1581578731117-104f2a41272c?w=800&q=80",
    icon: Home,
    services: [
      { name: "Appliance Repair", icon: Home },
      { name: "Plumbing", icon: Droplets },
      { name: "Electrical", icon: Zap },
    ],
  },
];

const ServicesPreview = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-blue/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Search className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Our Expertise</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              All Services, <span className="text-gradient-primary">One Platform</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Comprehensive solutions for all your needs. From quick fixes to major repairs,
              we have verified experts ready to help.
            </p>
          </div>
          <Button asChild size="lg" className="h-12 px-8 rounded-full shadow-glow hover:shadow-glow-blue transition-all duration-300">
            <Link to="/services">
              View All Services <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-glow transition-all duration-500 h-full flex flex-col"
            >
              {/* Image Header */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent z-10" />
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-6 z-20 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-background/90 backdrop-blur-md flex items-center justify-center shadow-lg">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {category.title}
                    </h3>
                    <p className="text-xs text-muted-foreground/80 font-medium">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Services List */}
              <div className="p-6 pt-2 flex-grow flex flex-col">
                <ul className="space-y-3 mt-auto">
                  {category.services.map((service) => (
                    <li key={service.name}>
                      <Link
                        to="/services"
                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/50 transition-all duration-300 group/item border border-transparent hover:border-border/50"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover/item:bg-primary/10 transition-colors">
                          <service.icon className="w-4 h-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                        </div>
                        <span className="font-medium text-sm text-foreground/80 group-hover/item:text-foreground transition-colors">
                          {service.name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto text-muted-foreground/50 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;

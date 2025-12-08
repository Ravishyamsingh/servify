import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Car,
  Bike,
  Truck,
  Home,
  Droplets,
  Zap,
  Wind,
  Paintbrush,
  Star,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const allServices = [
  // Electronics
  { id: 1, name: "Mobile Repair", category: "Electronics", icon: Smartphone, rating: 4.8, providers: 234, startPrice: 299, image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80" },
  { id: 2, name: "Laptop Service", category: "Electronics", icon: Laptop, rating: 4.7, providers: 189, startPrice: 499, image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80" },
  { id: 3, name: "TV Repair", category: "Electronics", icon: Tv, rating: 4.6, providers: 156, startPrice: 399, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80" },
  { id: 4, name: "Audio Repair", category: "Electronics", icon: Headphones, rating: 4.5, providers: 98, startPrice: 249, image: "https://images.unsplash.com/photo-1558486012-817176f84c6d?w=800&q=80" },
  // Mechanical
  { id: 5, name: "Car Service", category: "Mechanical", icon: Car, rating: 4.8, providers: 312, startPrice: 999, image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80" },
  { id: 6, name: "Bike Repair", category: "Mechanical", icon: Bike, rating: 4.7, providers: 287, startPrice: 299, image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80" },
  { id: 7, name: "Heavy Vehicle", category: "Mechanical", icon: Truck, rating: 4.5, providers: 67, startPrice: 1499, image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80" },
  // Home Services
  { id: 8, name: "Appliance Repair", category: "Home Services", icon: Home, rating: 4.6, providers: 198, startPrice: 349, image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80" },
  { id: 9, name: "Plumbing", category: "Home Services", icon: Droplets, rating: 4.7, providers: 276, startPrice: 199, image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80" },
  { id: 10, name: "Electrical", category: "Home Services", icon: Zap, rating: 4.8, providers: 245, startPrice: 249, image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80" },
  { id: 11, name: "AC Service", category: "Home Services", icon: Wind, rating: 4.6, providers: 187, startPrice: 449, image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80" },
  { id: 12, name: "Painting", category: "Home Services", icon: Paintbrush, rating: 4.5, providers: 134, startPrice: 999, image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80" },
];

const categories = ["All", "Electronics", "Mechanical", "Home Services"];

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredServices = allServices.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Navbar />

      <main className="pt-20">
        {/* Header */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
              >
                <Search className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Explore Services</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
              >
                Find the Right <span className="text-gradient-primary">Expert</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-lg mb-10 leading-relaxed"
              >
                Browse through our wide range of services and find verified experts near you.
                Book instantly with confidence.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3 max-w-xl mx-auto"
              >
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 text-foreground text-lg rounded-2xl shadow-sm transition-all"
                  />
                </div>
                <Button size="lg" className="h-14 px-8 rounded-2xl gap-2 shadow-glow hover:shadow-glow-blue transition-all">
                  <Filter className="w-4 h-4" /> Filter
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="sticky top-20 bg-background/80 backdrop-blur-xl z-40 border-b border-border/50 py-4">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 min-h-[600px]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to="/login"
                    className="group block h-full bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 overflow-hidden hover:border-primary/30 hover:shadow-glow transition-all duration-500 flex flex-col"
                  >
                    {/* Service Image */}
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent z-10" />
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl bg-background/90 backdrop-blur-md flex items-center justify-center shadow-lg">
                        <service.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="absolute bottom-4 left-4 z-20">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-white/90 px-2 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                          {service.category}
                        </span>
                      </div>
                    </div>

                    {/* Service Info */}
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-lg">
                          <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                          <span className="font-medium text-foreground">{service.rating}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{service.providers} pros</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                        <div>
                          <span className="text-xs text-muted-foreground block mb-0.5">Starts from</span>
                          <p className="font-display font-bold text-lg text-foreground">
                            ₹{service.startPrice}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No services found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Services;

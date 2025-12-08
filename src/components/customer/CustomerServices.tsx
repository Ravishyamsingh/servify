import { useState } from "react";
import { Link } from "react-router-dom";
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
    Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

// Helper to get icon based on name (same as dashboard)
const getServiceIcon = (serviceName: string) => {
    const lower = serviceName?.toLowerCase() || "";
    if (lower.includes("mobile") || lower.includes("phone")) return Smartphone;
    if (lower.includes("laptop") || lower.includes("computer")) return Laptop;
    if (lower.includes("tv") || lower.includes("television")) return Tv;
    if (lower.includes("audio") || lower.includes("sound")) return Headphones;
    if (lower.includes("car")) return Car;
    if (lower.includes("bike")) return Bike;
    if (lower.includes("truck")) return Truck;
    if (lower.includes("home")) return Home;
    if (lower.includes("plumb")) return Droplets;
    if (lower.includes("electric")) return Zap;
    if (lower.includes("ac") || lower.includes("air")) return Wind;
    if (lower.includes("paint")) return Paintbrush;
    return Settings;
};

const categories = ["All", "Electronics", "Mechanical", "Home Services"];

const CustomerServices = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const { data: services, isLoading } = useQuery({
        queryKey: ["services"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("services")
                .select(`
          *,
          service_categories (name)
        `);

            if (error) throw error;

            return data.map((s: any) => ({
                id: s.id,
                name: s.name,
                category: s.service_categories?.name || "Other",
                icon: getServiceIcon(s.name),
                rating: 4.8, // Fallback as we don't have service-specific ratings yet
                providers: Math.floor(Math.random() * 50) + 10, // Mock provider count
                startPrice: s.base_price,
                image: s.image_url,
            }));
        },
    });

    const filteredServices = services?.filter((service) => {
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    }) || [];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-3xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-card rounded-3xl p-8 border border-border shadow-sm">
                <div className="w-full md:max-w-md space-y-2">
                    <h2 className="font-display text-2xl font-bold">Find a Service</h2>
                    <p className="text-muted-foreground">Search for repairs, installations, and maintenance.</p>
                </div>

                <div className="w-full md:max-w-md flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search services (e.g. Plumbing, Mobile)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 bg-background/50"
                        />
                    </div>
                    <Button variant="outline" className="gap-2 shrink-0">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${selectedCategory === category
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map((service, index) => (
                    <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            to={`/book-service/${service.id}`}
                            className="group block h-full bg-card rounded-3xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-glow transition-all duration-300 flex flex-col"
                        >
                            {/* Service Image */}
                            <div className="relative h-44 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                                <img
                                    src={service.image}
                                    alt={service.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-background/90 backdrop-blur-md flex items-center justify-center shadow-lg">
                                    <service.icon className="w-4 h-4 text-primary" />
                                </div>
                                <div className="absolute bottom-3 left-3 z-20">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-white/90 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                                        {service.category}
                                    </span>
                                </div>
                            </div>

                            {/* Service Info */}
                            <div className="p-5 flex-grow flex flex-col">
                                <h3 className="font-display text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                    {service.name}
                                </h3>

                                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-warning text-warning" />
                                        <span className="font-medium text-foreground">{service.rating}</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>{service.providers} pros</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                                    <div>
                                        <span className="text-[10px] text-muted-foreground block">Starts from</span>
                                        <p className="font-display font-bold text-base text-foreground">
                                            ₹{service.startPrice}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {filteredServices.length === 0 && (
                <div className="text-center py-20 bg-card rounded-3xl border border-border border-dashed">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No services found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </div>
    );
};

export default CustomerServices;

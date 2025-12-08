import { Star, Quote, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Customer",
    location: "Mumbai",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
    text: "Servify saved my day! My laptop crashed before an important meeting, and they connected me with a verified technician who fixed it within 2 hours.",
  },
  {
    name: "Rajesh Kumar",
    role: "Verified Vendor",
    location: "Delhi",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
    text: "As a mobile repair technician, Servify has transformed my business. The verified badge gives customers confidence, and the platform handles bookings seamlessly.",
  },
  {
    name: "Anita Patel",
    role: "Customer",
    location: "Ahmedabad",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
    text: "The voice booking feature is amazing! My mother who isn't tech-savvy can now book services in Gujarati. Servify truly cares about inclusive access.",
  },
  {
    name: "David Chen",
    role: "Customer",
    location: "Bangalore",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    rating: 5,
    text: "Professional, timely, and transparent. The real-time tracking feature is a game-changer. I knew exactly when the plumber would arrive.",
  },
  {
    name: "Sarah Williams",
    role: "Vendor",
    location: "Pune",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    rating: 5,
    text: "The payments are always on time, and the support team is super helpful. Highly recommend for any service professional looking to grow.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 mb-16 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Quote className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Testimonials</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Trusted by <span className="text-gradient-primary">Thousands</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            See what our customers and vendors say about their experience with Servify.
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex gap-8 w-max">
          <MarqueeGroup />
          <MarqueeGroup />
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 mt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border/50 pt-16">
          {[
            { value: "50K+", label: "Happy Customers" },
            { value: "5K+", label: "Verified Vendors" },
            { value: "100K+", label: "Services Completed" },
            { value: "4.8", label: "Average Rating" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const MarqueeGroup = () => (
  <motion.div
    className="flex gap-8 items-stretch"
    animate={{ x: "-100%" }}
    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
  >
    {testimonials.map((testimonial, index) => (
      <div
        key={index}
        className="w-[350px] md:w-[400px] bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-colors flex flex-col"
      >
        <div className="flex gap-1 mb-6">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-primary text-primary" />
          ))}
        </div>

        <p className="text-foreground leading-relaxed mb-8 flex-grow">
          "{testimonial.text}"
        </p>

        <div className="flex items-center gap-4 mt-auto">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-background"
          />
          <div>
            <h4 className="font-semibold text-foreground text-sm">
              {testimonial.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{testimonial.role}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span>{testimonial.location}</span>
            </div>
          </div>
        </div>
      </div>
    ))}
  </motion.div>
);

export default TestimonialsSection;

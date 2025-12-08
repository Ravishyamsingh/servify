import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, Loader2, CheckCircle2, Store } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const roleConfig = {
  customer: {
    title: "Join Servify",
    subtitle: "Find trusted experts for all your needs",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80", // Happy family/home context
    benefits: [
      "Verified local experts",
      "Upfront pricing",
      "Secure payments",
      "Satisfaction guarantee"
    ],
    accent: "text-primary",
    bgGradient: "from-primary/20 via-primary/5 to-transparent"
  },
  vendor: {
    title: "Partner with Us",
    subtitle: "Grow your business with Servify",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80", // Business meeting/handshake
    benefits: [
      "Access thousands of customers",
      "Manage bookings easily",
      "Guaranteed payments",
      "Build your reputation"
    ],
    accent: "text-success",
    bgGradient: "from-success/20 via-success/5 to-transparent"
  }
};

const Signup = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { signUp, user, userRole, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const config = role ? (roleConfig[role as keyof typeof roleConfig] || roleConfig.customer) : roleConfig.customer;

  // Redirect if already logged in
  useEffect(() => {
    if (user && userRole && !authLoading) {
      const dashboardPath = userRole === "admin"
        ? "/admin/dashboard"
        : userRole === "vendor"
          ? "/vendor/dashboard"
          : "/customer/dashboard";
      navigate(dashboardPath, { replace: true });
    }
  }, [user, userRole, authLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return;
    if (formData.password.length < 8) return;

    setIsLoading(true);
    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        role as "customer" | "vendor"
      );

      if (!error) {
        const dashboardPath = role === "vendor" ? "/vendor/dashboard" : "/customer/dashboard";
        navigate(dashboardPath, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render Role Selection Screen if no role is specified
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

        <div className="w-full max-w-4xl relative z-10">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 shadow-inner"
            >
              <Wrench className="w-8 h-8 text-primary" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Join Servify
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Choose how you want to get started
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {[
              {
                id: "customer",
                title: "I need services",
                desc: "Find trusted experts for home repairs, cleaning, and more.",
                icon: User,
                color: "text-primary",
                bg: "bg-primary/10",
                border: "hover:border-primary/50"
              },
              {
                id: "vendor",
                title: "I'm a provider",
                desc: "Grow your business and reach thousands of new customers.",
                icon: Store,
                color: "text-success",
                bg: "bg-success/10",
                border: "hover:border-success/50"
              }
            ].map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link
                  to={`/signup/${option.id}`}
                  className={`block h-full bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 group ${option.border}`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${option.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <option.icon className={`w-7 h-7 ${option.color}`} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {option.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4 py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-30`} />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

      {/* Animated Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Back Link */}
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </Link>

        {/* Card */}
        <div className="bg-card/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-10 overflow-hidden relative">
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 shadow-inner">
              <Wrench className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              {config.title}
            </h1>
            <p className="text-muted-foreground">{config.subtitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-11 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-11 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-11 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-11 pr-11 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground ml-1">Minimum 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-11 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  required
                  disabled={isLoading}
                />
              </div>
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-destructive ml-1">Passwords don't match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-2"
              disabled={isLoading || (formData.password !== formData.confirmPassword)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                role === "vendor" ? "Continue to KYC" : "Create Account"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-xs text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>

            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to={`/login/${role}`}
                className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;

import { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, User, Store, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const roleConfig = {
  customer: {
    title: "Welcome Back",
    subtitle: "Sign in to manage your bookings",
    image: "https://images.unsplash.com/photo-1581578731117-104f2a41272c?w=1200&q=80", // Home repair context
    quote: "The service was quick and professional. Highly recommended!",
    author: "Sarah Jenkins, Homeowner",
    accent: "text-primary",
    bgGradient: "from-primary/20 via-primary/5 to-transparent"
  },
  vendor: {
    title: "Vendor Portal",
    subtitle: "Sign in to access your dashboard",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=1200&q=80", // Professional/Industrial context
    quote: "Servify helped me grow my business by 200% in just 6 months.",
    author: "Rajesh Kumar, Kumar Electronics",
    accent: "text-success",
    bgGradient: "from-success/20 via-success/5 to-transparent"
  },
  admin: {
    title: "Admin Access",
    subtitle: "Platform management system",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80", // Office/Corporate context
    quote: "Efficient management for a growing ecosystem.",
    author: "System Administrator",
    accent: "text-accent",
    bgGradient: "from-accent/20 via-accent/5 to-transparent"
  },
};

const Login = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn, signOut, user, userRole, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // If role is present, use config, otherwise default to customer for background (or handle differently)
  const config = role ? (roleConfig[role as keyof typeof roleConfig] || roleConfig.customer) : roleConfig.customer;

  // Redirect if already logged in
  useEffect(() => {
    if (user && userRole && !authLoading) {
      // Check for role mismatch if a specific role portal is accessed
      if (role && role !== userRole) {
        toast({
          title: "Access Denied",
          description: `You are logged in as a ${userRole}, but this is the ${role} portal. Please login with the correct account.`,
          variant: "destructive",
        });
        signOut();
        return;
      }

      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        const dashboardPath = userRole === "admin"
          ? "/admin/dashboard"
          : userRole === "vendor"
            ? "/vendor/dashboard"
            : "/customer/dashboard";
        navigate(dashboardPath, { replace: true });
      }
    }
  }, [user, userRole, authLoading, navigate, location, role, signOut, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      await signIn(email, password);
      // Navigation handled by useEffect
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
              Choose your Portal
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Select how you want to log in to Servify
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: "customer",
                title: "Customer",
                desc: "Book services & track requests",
                icon: User,
                color: "text-primary",
                bg: "bg-primary/10",
                border: "hover:border-primary/50"
              },
              {
                id: "vendor",
                title: "Vendor",
                desc: "Manage bookings & grow business",
                icon: Store,
                color: "text-success",
                bg: "bg-success/10",
                border: "hover:border-success/50"
              },
              {
                id: "admin",
                title: "Admin",
                desc: "Platform management & oversight",
                icon: ShieldCheck,
                color: "text-accent",
                bg: "bg-accent/10",
                border: "hover:border-accent/50"
              }
            ].map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link
                  to={`/login/${option.id}`}
                  className={`block h-full bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 group ${option.border}`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${option.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <option.icon className={`w-7 h-7 ${option.color}`} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground">
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
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
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
          to="/login"
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  required
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
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to={`/signup${role !== "customer" ? `?role=${role}` : ""}`}
                className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
              >
                Sign up
              </Link>
            </p>

            {role !== "admin" && (
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  {role === "customer" ? (
                    <>
                      Are you a service provider?{" "}
                      <Link to="/login/vendor" className="text-primary font-medium hover:underline">
                        Login as Vendor
                      </Link>
                    </>
                  ) : (
                    <>
                      Looking for services?{" "}
                      <Link to="/login/customer" className="text-primary font-medium hover:underline">
                        Login as Customer
                      </Link>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Wallet,
  Star,
  User,
  LogOut,
  Bell,
  Settings,
  BadgeCheck,
  Menu,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// Import Sub-components
import VendorOverview from "@/components/vendor/VendorOverview";
import VendorBookings from "@/components/vendor/VendorBookings";
import VendorHistory from "@/components/vendor/VendorHistory";
import VendorReviews from "@/components/vendor/VendorReviews";
import VendorProfile from "@/components/vendor/VendorProfile";
import VendorSettings from "@/components/vendor/VendorSettings";
import VendorEarnings from "@/components/vendor/VendorEarnings";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
    { icon: Calendar, label: "Bookings", id: "bookings" },
    { icon: Clock, label: "Job History", id: "history" },
    { icon: Wallet, label: "Earnings", id: "earnings" },
    { icon: Star, label: "Reviews", id: "reviews" },
    { icon: User, label: "Profile", id: "profile" },
    { icon: Settings, label: "Settings", id: "settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-card/50 backdrop-blur-xl border-r border-white/10 
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between lg:block">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center shadow-lg shadow-success/20 group-hover:scale-105 transition-transform">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display text-xl font-bold block bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Servify
              </span>
              <span className="text-xs text-muted-foreground font-medium tracking-wide">VENDOR PORTAL</span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group ${activeTab === item.id
                ? "text-success bg-success/10 shadow-inner"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? "text-success" : "text-muted-foreground group-hover:text-foreground"}`} />
              {item.label}
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-success rounded-r-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-success/10 to-emerald-500/5 border border-success/10 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <BadgeCheck className="w-5 h-5 text-success" />
              <span className="font-semibold text-success">Verified Pro</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your profile is verified. You're visible to thousands of customers.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto h-screen w-full">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none fixed" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-success/5 rounded-full blur-[100px] pointer-events-none fixed" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none fixed" />

        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold capitalize text-foreground">{activeTab.replace('-', ' ')}</h1>
              <p className="text-sm text-muted-foreground hidden md:block">Welcome back, {user?.user_metadata?.name || 'Vendor'} 👋</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-white/10 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
              </span>
              <span className="text-sm font-medium text-foreground">Accepting Jobs</span>
            </div>

            <button className="relative p-2.5 rounded-xl bg-card/50 border border-white/10 hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-foreground">{user?.user_metadata?.name || 'Vendor'}</p>
                <p className="text-xs text-muted-foreground">Service Provider</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border-2 border-success/20 shadow-sm overflow-hidden">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto relative z-0">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <VendorOverview />
              </motion.div>
            )}

            {activeTab === "bookings" && (
              <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <VendorBookings />
              </motion.div>
            )}

            {activeTab === "history" && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <VendorHistory />
              </motion.div>
            )}

            {activeTab === "earnings" && (
              <motion.div key="earnings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <VendorEarnings />
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <VendorReviews />
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <VendorProfile />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <VendorSettings />
              </motion.div>
            )}

            {/* Fallback for unimplemented tabs */}
            {!["dashboard", "bookings", "history", "reviews", "profile", "settings", "earnings"].includes(activeTab) && (
              <motion.div
                key="fallback"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-[60vh] text-center"
              >
                <div className="w-24 h-24 bg-card/50 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/10">
                  <Settings className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-2 capitalize">{activeTab}</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  This section is currently under development. Check back soon for updates!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;

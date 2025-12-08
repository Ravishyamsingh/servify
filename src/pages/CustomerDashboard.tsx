import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Calendar,
  Clock,
  MapPin,
  Bell,
  User,
  LogOut,
  Plus,
  Star,
  ChevronRight,
  Smartphone,
  Car,
  Zap,
  MessageSquare,
  CreditCard,
  Settings,
  HelpCircle,
  Loader2,
  Receipt,
  Mail,
  Smartphone as Phone,
  CheckCircle2,
  History,
  AlertCircle,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import LiveMap from "@/components/tracking/LiveMap";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import CustomerServices from "@/components/customer/CustomerServices";

const statusColors = {
  on_the_way: "bg-warning/10 text-warning",
  in_progress: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  scheduled: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
  pending: "bg-amber-500/10 text-amber-500",
};

const statusLabels = {
  on_the_way: "On the Way",
  in_progress: "In Progress",
  completed: "Completed",
  scheduled: "Scheduled",
  cancelled: "Cancelled",
  pending: "Pending",
};

const getServiceIcon = (serviceName: string) => {
  const lower = serviceName?.toLowerCase() || "";
  if (lower.includes("mobile") || lower.includes("phone")) return Smartphone;
  if (lower.includes("car") || lower.includes("auto")) return Car;
  if (lower.includes("electric") || lower.includes("wire")) return Zap;
  return Settings; // Default
};

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);

  // Dialog States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone_number: "" });
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    promoEmails: false,
    darkMode: false,
  });

  const { user, signOut } = useAuth();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // --- Data Fetching ---

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["userProfile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        full_name: userProfile.full_name || "",
        phone_number: userProfile.phone_number || ""
      });
    }
  }, [userProfile]);

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["customerBookings", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          vendors (business_name, id, city),
          services (name)
        `)
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((b: any) => ({
        ...b,
        vendor_name: b.vendors?.business_name || "Unknown Vendor",
        vendor_city: b.vendors?.city || "Unknown Location",
        service_name: b.services?.name || "Service",
        icon: getServiceIcon(b.services?.name),
      }));
    },
  });

  // --- Mutations & Actions ---

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: profileForm.full_name,
          phone_number: profileForm.phone_number,
        });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({ title: "Success", description: "Profile updated successfully!" });
      setIsEditProfileOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Password changed successfully!" });
      setIsChangePasswordOpen(false);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };


  // --- Derived Stats ---
  const activeBooking = bookings?.find((b) =>
    ["on_the_way", "in_progress", "scheduled", "pending"].includes(b.status)
  );

  const stats = {
    active: bookings?.filter((b) => ["on_the_way", "in_progress", "scheduled", "pending"].includes(b.status)).length || 0,
    completed: bookings?.filter((b) => b.status === "completed").length || 0,
    spent: bookings?.reduce((acc: number, curr: any) => acc + (curr.status === "completed" ? (curr.total_amount || 0) : 0), 0) || 0,
    savedVendors: 0,
  };

  const handleBookingClick = (bookingId: number) => {
    setSelectedBooking(bookingId);
    const booking = bookings?.find(b => b.id === bookingId);
    if (booking && (booking.status === "on_the_way" || booking.status === "in_progress")) {
      setActiveTab("tracking");
    }
  };

  const NavItem = ({ icon: Icon, label, id }: any) => (
    <button
      onClick={() => handleTabChange(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === id
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-card border-r border-border sticky top-0 h-screen overflow-y-auto">
        <div className="p-8 pb-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Servify</span>
              <span className="text-xs font-bold text-primary uppercase tracking-widest block -mt-1 opacity-80">Customer</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="px-4 mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Menu</div>
          <NavItem icon={Home} label="Dashboard" id="dashboard" />
          <NavItem icon={Search} label="Services" id="services" />
          <NavItem icon={Calendar} label="My Bookings" id="bookings" />
          <NavItem icon={MapPin} label="Track Service" id="tracking" />
          <NavItem icon={History} label="Service History" id="history" />
          <NavItem icon={CreditCard} label="Payments" id="payments" />
          <NavItem icon={MessageSquare} label="Messages" id="messages" />

          <div className="px-4 mt-8 mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account</div>
          <NavItem icon={User} label="Profile" id="profile" />
          <NavItem icon={Settings} label="Settings" id="settings" />
          <NavItem icon={HelpCircle} label="Help & Support" id="help" />
        </nav>

        <div className="p-4 flex-none border-t border-border mt-auto">
          <div className="p-4 rounded-xl bg-secondary/50 mb-3 flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">{userProfile?.full_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{userProfile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="sticky top-0 z-20 h-20 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-8">
          <div>
            <h1 className="font-display text-2xl font-bold capitalize">{activeTab.replace("-", " ")}</h1>
            {activeTab === 'dashboard' && <p className="text-sm text-muted-foreground">Welcome back to your dashboard</p>}
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors border border-border">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-background animate-pulse" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{userProfile?.full_name || "Guest"}</p>
                <p className="text-xs text-muted-foreground">Customer</p>
              </div>
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">{userProfile?.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full pb-20">

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 bg-gradient-hero rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-primary/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-fullblur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/15 transition-colors" />
                  <div className="relative z-10">
                    <h2 className="font-display text-3xl font-bold mb-3">
                      Hello, {profileLoading ? <div className="h-8 w-32 inline-block bg-white/20 align-bottom rounded-lg" /> : userProfile?.full_name?.split(' ')[0] || "User"}! 👋
                    </h2>
                    <p className="text-white/80 mb-8 text-lg max-w-md font-light leading-relaxed">
                      Your home services hub. Track bookings, find pros, and manage everything in one place.
                    </p>
                    <Button asChild className="bg-white text-primary hover:bg-white/90 font-bold rounded-full px-8 h-12 shadow-lg shadow-black/20 hover:scale-105 transition-all">
                      <Link to="/services">
                        <Plus className="w-5 h-5 mr-2" /> Book New Service
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:w-96 shrink-0">
                  {[
                    { label: "Active Jobs", value: stats.active.toString(), icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Completed", value: stats.completed.toString(), icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "Total Spent", value: `₹${stats.spent.toLocaleString()}`, icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "Saved Pros", value: stats.savedVendors.toString(), icon: User, color: "text-purple-500", bg: "bg-purple-500/10" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="font-display text-2xl font-bold tracking-tight mb-1">{bookingsLoading ? <Skeleton className="h-8 w-12" /> : stat.value}</div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide opacity-80">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {activeBooking && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Live Status
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("tracking")} className="rounded-full">
                      Full Tracking <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="bg-card rounded-2xl border border-border p-1 bg-gradient-surface">
                    <div className="bg-background/50 rounded-xl p-5 backdrop-blur-sm">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Settings className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg truncate">{activeBooking.service_name}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusColors[activeBooking.status as keyof typeof statusColors]?.replace('bg-', 'border-') || 'border-gray-200'} ${statusColors[activeBooking.status as keyof typeof statusColors]}`}>
                              {statusLabels[activeBooking.status as keyof typeof statusLabels]}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="font-medium text-foreground">{activeBooking.vendor_name}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            {activeBooking.vendor_city}
                            {activeBooking.scheduled_at && `• ${new Date(activeBooking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                  <div>
                    <h3 className="font-display text-lg font-bold">Recent History</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Your last 5 service requests</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("bookings")} className="rounded-full bg-background hover:bg-muted">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="divide-y divide-border/50">
                  {bookingsLoading ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-6 flex items-center gap-4"><Skeleton className="h-12 w-12 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-32" /></div></div>
                  )) : bookings?.slice(0, 5).map((booking: any) => (
                    <div
                      key={booking.id}
                      onClick={() => handleBookingClick(booking.id)}
                      className="p-5 flex items-center gap-5 hover:bg-muted/30 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
                        <booking.icon className="w-6 h-6 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {booking.service_name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate flex items-center gap-2">
                          {booking.vendor_name}
                          <span className="w-1 h-1 rounded-full bg-border" />
                          {new Date(booking.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground font-mono">₹{booking.total_amount || 0}</p>
                        <span
                          className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColors[booking.status as keyof typeof statusColors]
                            }`}
                        >
                          {statusLabels[booking.status as keyof typeof statusLabels]}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary/50 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                  {!bookingsLoading && (!bookings || bookings.length === 0) && (
                    <div className="p-12 text-center text-muted-foreground">
                      <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="font-medium">No bookings yet</p>
                      <p className="text-sm mt-1">Book your first service today!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "tracking" && (
            activeBooking ? (
              <div className="h-[calc(100vh-12rem)] min-h-[500px] bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
                <LiveMap
                  vendorId={activeBooking.vendors.id}
                  vendorName={activeBooking.vendors.business_name || "Vendor"}
                  vendorPhone={activeBooking.vendors.city || "Unknown"}
                  estimatedTime="25 min"
                  status={activeBooking.status as any}
                  customerAddress={activeBooking.address || "Your Location"}
                  bookingId={activeBooking.id.toString()}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 bg-card rounded-3xl border border-border">
                <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                  <MapPin className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Active Trackings</h3>
                <p className="text-muted-foreground">You don't have any live services to track right now.</p>
                <Button variant="outline" className="mt-6" onClick={() => setActiveTab("bookings")}>View All Bookings</Button>
              </div>
            )
          )}

          {activeTab === "bookings" && (
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden animate-fade-in-up">
              <div className="p-8 border-b border-border bg-muted/30">
                <h3 className="font-display text-xl font-bold">All Bookings</h3>
                <p className="text-sm text-muted-foreground">History of all your service requests</p>
              </div>
              <div className="divide-y divide-border/50">
                {bookingsLoading ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-6"><Skeleton className="h-16 w-full rounded-xl" /></div>
                )) : bookings?.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => handleBookingClick(booking.id)}
                  >
                    <div className="flex items-center gap-5 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center shadow-sm">
                        <booking.icon className="w-7 h-7 text-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{booking.service_name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <User className="w-3 h-3" /> {booking.vendor_name}
                          <span className="text-border">•</span>
                          <Calendar className="w-3 h-3" /> {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-8 min-w-[200px]">
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${statusColors[booking.status as keyof typeof statusColors]?.replace('bg-', 'border-') || 'border-gray-200'} ${statusColors[booking.status as keyof typeof statusColors]}`}>
                          {statusLabels[booking.status as keyof typeof statusLabels]}
                        </span>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-lg font-mono">₹{booking.total_amount || 0}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="hidden md:flex">
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
                {!bookingsLoading && (!bookings || bookings.length === 0) && (
                  <div className="p-20 text-center text-muted-foreground">
                    No booking history found.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
              <div className="bg-card rounded-3xl border border-border p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-hero opacity-80" />
                <div className="relative pt-12 flex flex-col items-center text-center">
                  <Avatar className="w-32 h-32 border-4 border-card shadow-2xl">
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">{userProfile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-display text-3xl font-bold mt-4 mb-1">{userProfile?.full_name || "User Name"}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="mt-6 flex gap-3">
                    <Button className="rounded-full px-6" onClick={() => setIsEditProfileOpen(true)}>Edit Profile</Button>
                    <Button variant="outline" className="rounded-full px-6" onClick={() => setIsChangePasswordOpen(true)}>Change Password</Button>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                <h4 className="font-bold text-lg mb-6">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 block">Full Name</label>
                    <div className="p-3 bg-secondary/30 rounded-xl border border-border font-medium">{userProfile?.full_name || "-"}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 block">Phone Number</label>
                    <div className="p-3 bg-secondary/30 rounded-xl border border-border font-medium">{userProfile?.phone_number || "-"}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 block">Email Address</label>
                    <div className="p-3 bg-secondary/30 rounded-xl border border-border font-medium">{user?.email || "-"}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2 block">Location</label>
                    <div className="p-3 bg-secondary/30 rounded-xl border border-border font-medium">Bangalore, India</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Services Tab - New */}
          {activeTab === "services" && (
            <div className="max-w-7xl mx-auto">
              <CustomerServices />
            </div>
          )}

          {/* Service History Tab */}
          {activeTab === "history" && (
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden animate-fade-in-up">
              <div className="p-8 border-b border-border bg-muted/30">
                <h3 className="font-display text-xl font-bold">Service History</h3>
                <p className="text-sm text-muted-foreground">Past completed and cancelled services</p>
              </div>
              <div className="divide-y divide-border/50">
                {bookingsLoading ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-6"><Skeleton className="h-16 w-full rounded-xl" /></div>
                )) : bookings?.filter((b: any) => ['completed', 'cancelled'].includes(b.status)).map((booking: any) => (
                  <div key={booking.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${booking.status === 'completed' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {booking.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{booking.service_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {new Date(booking.created_at).toLocaleDateString()} • {booking.vendor_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold font-mono text-sm">₹{booking.total_amount || 0}</p>
                      <span className={`text-[10px] font-bold uppercase ${booking.status === 'completed' ? 'text-success' : 'text-destructive'}`}>{booking.status}</span>
                    </div>
                  </div>
                ))}
                {!bookingsLoading && (!bookings || bookings.length === 0 || !bookings.some((b: any) => ['completed', 'cancelled'].includes(b.status))) && (
                  <div className="p-20 text-center text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No service history found.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden animate-fade-in-up">
              <div className="p-8 border-b border-border bg-muted/30 flex justify-between items-center">
                <div>
                  <h3 className="font-display text-xl font-bold">Payment History</h3>
                  <p className="text-sm text-muted-foreground">Your transaction records</p>
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex">Download Statement</Button>
              </div>
              <div className="divide-y divide-border/50">
                <div className="grid grid-cols-4 px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-secondary/20">
                  <div>Date</div>
                  <div>Description</div>
                  <div>Status</div>
                  <div className="text-right">Amount</div>
                </div>
                {bookingsLoading ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-6"><Skeleton className="h-8 w-full" /></div>
                )) : bookings?.filter((b: any) => b.status === 'completed').map((booking: any) => (
                  <div key={booking.id} className="grid grid-cols-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors text-sm">
                    <div className="text-muted-foreground">{new Date(booking.created_at).toLocaleDateString()}</div>
                    <div className="font-medium">{booking.service_name}</div>
                    <div><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">PAID</span></div>
                    <div className="text-right font-mono font-bold">₹{booking.total_amount || 0}</div>
                  </div>
                ))}
                {!bookingsLoading && (!bookings || !bookings.some((b: any) => b.status === 'completed')) && (
                  <div className="p-16 text-center text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No transactions yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Help Tab */}
          {activeTab === "help" && (
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl font-bold mb-2">How can we help you?</h2>
                <p className="text-muted-foreground">Find answers to commonly asked questions or contact our support team.</p>
              </div>

              <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I track my professional?</AccordionTrigger>
                    <AccordionContent>
                      Once your booking is confirmed and the professional is on the way, you can go to the "Track Service" tab to see their live location on the map.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Can I cancel a booking?</AccordionTrigger>
                    <AccordionContent>
                      Yes, you can cancel a booking from the "My Bookings" tab before the professional arrives. Cancellation charges may apply if cancelled last minute.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How are payments processed?</AccordionTrigger>
                    <AccordionContent>
                      Payments are processed securely through our payment gateway. You are charged only after the service is marked as completed.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How do I contact support?</AccordionTrigger>
                    <AccordionContent>
                      You can reach our support team at support@servify.com or call us at +91 98765 43210.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 text-center">
                <h3 className="font-bold text-lg mb-2">Still need help?</h3>
                <p className="text-sm text-muted-foreground mb-6">Our support team is available 24/7 to assist you with any issues.</p>
                <Button className="rounded-full">Contact Support</Button>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
              <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
                <h3 className="font-display text-xl font-bold mb-6">App Settings</h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates about your bookings via email</p>
                    </div>
                    <Switch checked={settings.emailNotifications} onCheckedChange={(c) => setSettings({ ...settings, emailNotifications: c })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates about your bookings via SMS</p>
                    </div>
                    <Switch checked={settings.smsNotifications} onCheckedChange={(c) => setSettings({ ...settings, smsNotifications: c })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Promotional Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive offers and newsletters</p>
                    </div>
                    <Switch checked={settings.promoEmails} onCheckedChange={(c) => setSettings({ ...settings, promoEmails: c })} />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="space-y-0.5">
                      <Label className="text-base">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                    </div>
                    <Switch checked={settings.darkMode} onCheckedChange={(c) => setSettings({ ...settings, darkMode: c })} />
                  </div>
                </div>
              </div>

              <div className="bg-destructive/5 rounded-3xl p-8 border border-destructive/10">
                <h3 className="font-bold text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <Button variant="destructive" className="rounded-full">Delete Account</Button>
              </div>
            </div>
          )}

          {/* Messages Tab (Empty State) */}
          {activeTab === "messages" && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in-up">
              <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">No New Messages</h3>
              <p className="text-muted-foreground max-w-sm">You're all caught up! Messages from your service professionals will appear here.</p>
            </div>
          )}

        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileForm.phone_number}
                onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)} disabled={isUpdating}>Cancel</Button>
            <Button onClick={handleUpdateProfile} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter a new password for your account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)} disabled={isUpdating}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerDashboard;

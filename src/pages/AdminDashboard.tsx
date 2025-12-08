import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  DollarSign,
  BarChart3,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Search,
  MoreVertical,
  Calendar,
  MapPin,
  ChevronRight,
  Filter,
  Menu,
  X
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Interfaces for our data
interface StatCardProps {
  label: string;
  value: string;
  icon: any;
  change?: string;
  trend?: "up" | "down" | "neutral";
  colorClass?: string;
  loading?: boolean;
}

interface Vendor {
  id: string;
  business_name: string;
  category?: string;
  city: string | null;
  created_at: string;
  is_verified: boolean | null;
  email?: string;
}

interface Booking {
  id: number;
  customer_id: string;
  vendor_id: string;
  service_id: number;
  status: string;
  total_amount: number | null;
  created_at: string;
  customer_name?: string;
  vendor_name?: string;
  service_name?: string;
  scheduled_at?: string;
  address?: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  created_at: string;
  role?: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // --- Real-time Data Fetching ---

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const { data: revenueData } = await supabase
        .from("bookings")
        .select("total_amount")
        .eq("status", "completed");

      const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

      const { count: customerCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: vendorCount } = await supabase.from("vendors").select("*", { count: "exact", head: true });
      const { count: verifiedVendorsCount } = await supabase.from("vendors").select("*", { count: "exact", head: true }).eq("is_verified", true);
      const { count: pendingCount } = await supabase.from("vendors").select("*", { count: "exact", head: true }).eq("is_verified", false);

      return {
        revenue: totalRevenue,
        users: (customerCount || 0) + (vendorCount || 0),
        verifiedVendors: verifiedVendorsCount,
        pending: pendingCount,
      };
    },
  });

  const { data: pendingVendors, isLoading: pendingLoading } = useQuery({
    queryKey: ["pendingVendors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("is_verified", false)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as Vendor[];
    },
  });

  const { data: recentBookings, isLoading: recentBookingsLoading } = useQuery({
    queryKey: ["recentBookings"],
    queryFn: async () => {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(`*, vendors (business_name), services (name)`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      const customerIds = bookings.map((b) => b.customer_id);
      if (customerIds.length === 0) return bookings.map((b: any) => ({ ...b, vendor_name: b.vendors?.business_name, service_name: b.services?.name, customer_name: "Unknown" })) as Booking[];

      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", customerIds);
      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]));

      return bookings.map((b: any) => ({
        ...b,
        vendor_name: b.vendors?.business_name,
        service_name: b.services?.name,
        customer_name: profileMap.get(b.customer_id) || "Unknown User",
      })) as Booking[];
    },
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["allUsers"],
    enabled: activeTab === "users",
    queryFn: async () => {
      const [profilesResponse, vendorsResponse] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("vendors").select("*").order("created_at", { ascending: false })
      ]);

      if (profilesResponse.error) throw profilesResponse.error;
      if (vendorsResponse.error) throw vendorsResponse.error;

      const profiles = (profilesResponse.data || []).map(p => ({
        id: p.id,
        full_name: p.full_name || "Unknown User",
        email: "Customer", // Profile doesn't always have email in public table usually
        role: "Customer",
        phone_number: p.phone_number,
        created_at: p.created_at,
        avatar_initial: p.full_name?.charAt(0) || "U"
      }));

      const vendors = (vendorsResponse.data || []).map(v => ({
        id: v.id,
        full_name: v.business_name || "Unknown Vendor",
        email: "Vendor",
        role: "Vendor",
        phone_number: v.city || "No location", // Using city as contact/location proxy if phone missing
        created_at: v.created_at,
        avatar_initial: v.business_name?.charAt(0) || "V"
      }));

      // Sort combined list by created_at desc
      return [...profiles, ...vendors].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });

  const { data: allVendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["allVendors"],
    enabled: activeTab === "vendors",
    queryFn: async () => {
      const { data, error } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Vendor[];
    },
  });

  const { data: allBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["allBookings"],
    enabled: activeTab === "bookings" || activeTab === "analytics",
    queryFn: async () => {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(`*, vendors (business_name), services (name)`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const customerIds = bookings.map((b) => b.customer_id);
      let profileMap = new Map();

      if (customerIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", customerIds);
        profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]));
      }

      return bookings.map((b: any) => ({
        ...b,
        vendor_name: b.vendors?.business_name,
        service_name: b.services?.name,
        customer_name: profileMap.get(b.customer_id) || "Unknown User",
      })) as Booking[];
    },
  });

  // --- Mutations ---

  const approveVendorMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      const { error } = await supabase.from("vendors").update({ is_verified: true }).eq("id", vendorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingVendors"] });
      queryClient.invalidateQueries({ queryKey: ["allVendors"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      toast({
        title: "Approved",
        description: "Vendor has been successfully verified.",
        className: "bg-green-500/10 border-green-500/20 text-green-500"
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve vendor.", variant: "destructive" });
    },
  });

  const rejectVendorMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      console.log("Rejecting vendor", vendorId);
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({ title: "Rejected", description: "Vendor request has been declined.", variant: "default" });
    }
  });

  // --- Stat Card Component ---
  const StatCard = ({ label, value, icon: Icon, change, trend, colorClass, loading }: StatCardProps) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-sm hover:shadow-lg hover:bg-card/70 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl transition-colors duration-300 ${colorClass ? colorClass : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change && !loading && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${trend === 'up' ? 'text-green-500 bg-green-500/10 border-green-500/20' :
            trend === 'down' ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-gray-400 bg-gray-500/10 border-gray-500/20'
            }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
            {change}
          </div>
        )}
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-8 w-24 mb-2 bg-white/5" />
        ) : (
          <h3 className="text-3xl font-bold font-display text-foreground tracking-tight">{value}</h3>
        )}
        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
          {label}
          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
        </p>
      </div>
    </motion.div>
  );

  // --- Tab Contents ---

  const DashboardTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Revenue" value={`₹${stats?.revenue?.toLocaleString() || '0'}`} icon={DollarSign} change="+12.5%" trend="up" colorClass="bg-green-500/10 text-green-500" loading={statsLoading} />
        <StatCard label="Active Users" value={stats?.users?.toString() || '0'} icon={Users} change="+5.2%" trend="up" colorClass="bg-blue-500/10 text-blue-500" loading={statsLoading} />
        <StatCard label="Verified Vendors" value={stats?.verifiedVendors?.toString() || '0'} icon={CheckCircle} change="+3" trend="up" colorClass="bg-indigo-500/10 text-indigo-500" loading={statsLoading} />
        <StatCard label="Pending Approvals" value={stats?.pending?.toString() || '0'} icon={AlertTriangle} change="Action Needed" trend="neutral" colorClass="bg-amber-500/10 text-amber-500" loading={statsLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2 bg-card/50 backdrop-blur-md rounded-3xl border border-white/10 shadow-sm flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">Recent Bookings</h3>
              <p className="text-sm text-muted-foreground">Latest service requests</p>
            </div>
            <Button variant="outline" className="rounded-full text-xs h-8 border-white/10 bg-white/5 hover:bg-white/10 text-foreground" onClick={() => setActiveTab("bookings")}>View All</Button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-muted-foreground font-medium">
                <tr>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentBookingsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={4} className="p-6"><Skeleton className="h-6 w-full bg-white/5" /></td></tr>
                  ))
                ) : recentBookings?.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/5 transition-colors group cursor-default">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{booking.service_name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 border border-white/10">
                          <AvatarFallback className="text-[10px] bg-primary/20 text-primary">{booking.customer_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground group-hover:text-foreground">{booking.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${booking.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        booking.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-white/5 text-muted-foreground border-white/10'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${booking.status === 'completed' ? 'bg-green-500' :
                          booking.status === 'pending' ? 'bg-amber-500' : 'bg-gray-500'
                          }`} />
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-foreground font-mono">
                      {booking.total_amount ? `₹${booking.total_amount}` : '-'}
                    </td>
                  </tr>
                ))}
                {!recentBookingsLoading && (!recentBookings || recentBookings.length === 0) && (
                  <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No recent bookings</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-1 bg-card/50 backdrop-blur-md rounded-3xl border border-white/10 shadow-sm flex flex-col h-full overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 bg-amber-500/5">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              Pending Approvals
              {stats?.pending && stats.pending > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white animate-pulse">{stats.pending}</span>}
            </h3>
            <p className="text-sm text-muted-foreground">Vendors awaiting verification</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {pendingLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl bg-white/5" />)
            ) : pendingVendors?.map((vendor) => (
              <div key={vendor.id} className="group p-4 rounded-2xl bg-card border border-white/5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shadow-inner">
                    {vendor.business_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">NEW</div>
                </div>
                <h4 className="font-semibold text-foreground mb-1">{vendor.business_name}</h4>
                <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {vendor.city || 'Unknown Location'}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:translate-y-px transition-all" onClick={() => approveVendorMutation.mutate(vendor.id)} disabled={approveVendorMutation.isPending}>
                    {approveVendorMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                  </Button>
                  <Button size="sm" variant="ghost" className="px-3 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10" onClick={() => rejectVendorMutation.mutate(vendor.id)}>Refuse</Button>
                </div>
              </div>
            ))}
            {!pendingLoading && (!pendingVendors || pendingVendors.length === 0) && (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <CheckCircle className="w-8 h-8 text-white/20" />
                </div>
                <p className="font-medium">All caught up!</p>
                <p className="text-xs text-white/40">No pending vendor requests</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const UsersTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card/50 backdrop-blur-md rounded-3xl border border-white/10 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">All Users</h3>
          <p className="text-sm text-muted-foreground">Manage user accounts</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-foreground"><Filter className="w-4 h-4" /> Filter</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-muted-foreground font-medium">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {usersLoading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={5} className="p-6"><Skeleton className="h-4 w-full bg-white/5" /></td></tr>) : allUsers?.map((profile: any) => (
              <tr key={profile.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                  <Avatar className="w-8 h-8 border border-white/10">
                    <AvatarFallback className="bg-white/10 text-foreground">{profile.avatar_initial}</AvatarFallback>
                  </Avatar>
                  {profile.full_name || "N/A"}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${profile.role === 'Vendor'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                    {profile.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{profile.phone_number || "-"}</td>
                <td className="px-6 py-4 text-muted-foreground">{new Date(profile.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground"><MoreVertical className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
            {!usersLoading && (!allUsers || allUsers.length === 0) && (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const VendorsTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card/50 backdrop-blur-md rounded-3xl border border-white/10 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h3 className="font-display text-lg font-bold text-foreground">Vendors Directory</h3>
        <p className="text-sm text-muted-foreground">Manage and verify service providers</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-muted-foreground font-medium">
            <tr>
              <th className="px-6 py-4">Business Name</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {vendorsLoading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={5} className="p-6"><Skeleton className="h-4 w-full bg-white/5" /></td></tr>) : allVendors?.map((v) => (
              <tr key={v.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{v.business_name}</td>
                <td className="px-6 py-4 text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3 my-auto" />{v.city || "-"}</td>
                <td className="px-6 py-4">
                  {v.is_verified ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  {!v.is_verified && <Button size="sm" onClick={() => approveVendorMutation.mutate(v.id)} className="bg-primary hover:bg-primary/90 text-white shadow-sm rounded-lg h-8 text-xs font-medium">Approve</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const BookingsTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card/50 backdrop-blur-md rounded-3xl border border-white/10 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h3 className="font-display text-lg font-bold text-foreground">All Bookings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-muted-foreground font-medium">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Vendor</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bookingsLoading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6} className="p-6"><Skeleton className="h-4 w-full bg-white/5" /></td></tr>) : allBookings?.map((b) => (
              <tr key={b.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-muted-foreground font-mono text-xs">#{b.id}</td>
                <td className="px-6 py-4 font-medium text-foreground">{b.service_name}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6 border border-white/10"><AvatarFallback className="text-[10px] bg-white/10 text-foreground">{b.customer_name?.charAt(0)}</AvatarFallback></Avatar>
                    <span className="group-hover:text-foreground transition-colors">{b.customer_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{b.vendor_name || "-"}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${b.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    b.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-white/5 text-muted-foreground border-white/10'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'completed' ? 'bg-emerald-500' :
                      b.status === 'pending' ? 'bg-amber-500' : 'bg-gray-500'
                      }`} />
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium font-mono text-foreground">₹{b.total_amount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const AnalyticsTab = () => {
    const data = allBookings ? allBookings.reduce((acc: any[], curr) => {
      const date = new Date(curr.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.amount += (curr.total_amount || 0);
        existing.count += 1;
      } else {
        acc.push({ date, amount: curr.total_amount || 0, count: 1 });
      }
      return acc;
    }, []).reverse() : [];
    const chartData = [...data].reverse();

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="bg-card/50 backdrop-blur-md rounded-3xl border border-white/10 shadow-sm p-6">
          <h3 className="font-display text-lg font-bold text-foreground mb-6">Revenue Trend</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)', padding: '12px', color: '#fff' }}
                  cursor={{ stroke: '#6366F1', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    );
  };

  const SettingsTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card/50 backdrop-blur-md rounded-3xl border border-white/10 shadow-sm p-8 max-w-2xl mx-auto">
      <h3 className="font-display text-xl font-bold text-foreground mb-4">Platform Settings</h3>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <h4 className="font-semibold text-foreground">Maintenance Mode</h4>
            <p className="text-xs text-muted-foreground">Temporarily disable platform access</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full border-white/10 bg-transparent text-foreground hover:bg-white/5">Enable</Button>
        </div>
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <h4 className="font-semibold text-foreground">Email Notifications</h4>
            <p className="text-xs text-muted-foreground">Receive alerts for new bookings and vendors</p>
          </div>
          <Button variant="outline" size="sm" className="text-green-500 border-green-500/20 bg-green-500/10 rounded-full">Active</Button>
        </div>
      </div>
    </motion.div>
  )

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
    { icon: Users, label: "Users", id: "users" },
    { icon: Briefcase, label: "Vendors", id: "vendors" },
    { icon: FileText, label: "Bookings", id: "bookings" },
    { icon: BarChart3, label: "Analytics", id: "analytics" },
    { icon: Settings, label: "Settings", id: "settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none fixed" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none fixed" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none fixed" />

      {/* Sidebar - Fixed for large screens */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-card/50 backdrop-blur-xl border-r border-white/10 
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between lg:block">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                Servify
              </span>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block -mt-1 opacity-80">Admin</span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1">
          <div className="px-4 mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Menu</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group ${activeTab === item.id
                ? "text-white bg-white/10 shadow-inner"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'text-indigo-400 scale-110' : 'group-hover:text-white group-hover:scale-110'}`} />
              <span className="relative z-10">{item.label}</span>
              {activeTab === item.id && <motion.div layoutId="activeTab" className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 shadow-sm">
            <Avatar className="w-9 h-9 border border-white/10 cursor-pointer hover:border-indigo-500/50 transition-colors">
              <AvatarFallback className="bg-indigo-500/20 text-indigo-400 font-bold">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-wider">{userRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all hover:scale-110"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative z-10">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex items-center justify-between transition-all duration-300">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4"
          >
            <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground capitalize tracking-tight">{activeTab}</h1>
              <p className="text-sm text-muted-foreground font-medium">
                {activeTab === 'dashboard' ? 'Platform Overview' : `Manage ${activeTab}`}
              </p>
            </div>
          </motion.div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2.5 rounded-full bg-white/5 border-transparent focus:bg-white/10 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 w-64 transition-all duration-300 text-sm font-medium text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button className="relative p-3 rounded-full bg-white/5 border border-white/10 shadow-sm hover:shadow-md hover:bg-white/10 transition-all duration-300 group">
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background animate-pulse" />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardTab />}
              {activeTab === 'users' && <UsersTab />}
              {activeTab === 'vendors' && <VendorsTab />}
              {activeTab === 'bookings' && <BookingsTab />}
              {activeTab === 'analytics' && <AnalyticsTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

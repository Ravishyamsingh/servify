import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Wallet,
    Star,
    CheckCircle,
    Users,
    Filter,
    MoreVertical,
    MapPin,
    Phone,
    Navigation,
    Loader2,
    Clock,
    User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import LocationSharingToggle from "@/components/vendor/LocationSharingToggle";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Booking {
    id: number;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    total_amount: number;
    scheduled_at: string;
    address: string;
    created_at: string;
    profiles: {
        full_name: string;
        avatar_url: string | null;
        phone_number: string | null;
    };
    services: {
        name: string;
    };
}

interface DashboardStats {
    earnings: number;
    completedJobs: number;
    rating: number;
    totalCustomers: number;
}

const VendorOverview = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        earnings: 0,
        completedJobs: 0,
        rating: 0,
        totalCustomers: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Manual fetch to bypass potential missing FK issue
                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('bookings')
                    .select(`
                    *,
                    services:service_id (name)
                `)
                    .eq('vendor_id', user.id)
                    .order('created_at', { ascending: false });

                if (bookingsError) throw bookingsError;

                // Manually fetch profiles
                const customerIds = [...new Set(bookingsData.map((b: any) => b.customer_id))];
                let profilesMap: Record<string, any> = {};

                if (customerIds.length > 0) {
                    const { data: profilesData, error: profilesError } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url, phone_number')
                        .in('id', customerIds);

                    if (!profilesError && profilesData) {
                        profilesMap = profilesData.reduce((acc, profile) => {
                            acc[profile.id] = profile;
                            return acc;
                        }, {} as Record<string, any>);
                    }
                }

                const bookingsWithProfiles = bookingsData.map((booking: any) => ({
                    ...booking,
                    profiles: profilesMap[booking.customer_id] || { full_name: 'Unknown User', avatar_url: null, phone_number: null }
                }));

                const typedBookings = bookingsWithProfiles as unknown as Booking[];
                setBookings(typedBookings);

                const { data: vendorData, error: vendorError } = await supabase
                    .from('vendors')
                    .select('rating')
                    .eq('id', user.id)
                    .single();

                if (vendorError && vendorError.code !== 'PGRST116') throw vendorError;

                const completed = typedBookings.filter(b => b.status === 'completed');
                const uniqueCustomers = new Set(typedBookings.map(b => b.profiles.full_name)).size;
                const totalEarnings = completed.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

                setStats({
                    earnings: totalEarnings,
                    completedJobs: completed.length,
                    rating: vendorData?.rating || 0,
                    totalCustomers: uniqueCustomers
                });

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        const channel = supabase
            .channel('vendor-overview')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `vendor_id=eq.${user.id}`
                },
                () => {
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const handleUpdateStatus = async (bookingId: number, newStatus: Booking['status']) => {
        setProcessingId(bookingId);
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', bookingId);

            if (error) throw error;

            toast({
                title: "Status Updated",
                description: `Booking marked as ${newStatus.replace('_', ' ')}.`,
            });
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: "Update Failed",
                description: "Please try again.",
                variant: "destructive",
            });
        } finally {
            setProcessingId(null);
        }
    };

    const requests = bookings.filter(b => b.status === 'pending');
    const activeJobs = bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Earnings", value: `₹${stats.earnings.toLocaleString()}`, icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+12%" },
                    { label: "Jobs Completed", value: stats.completedJobs.toString(), icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+8%" },
                    { label: "Rating", value: stats.rating.toFixed(1), icon: Star, color: "text-amber-500", bg: "bg-amber-500/10", trend: "Top 10%" },
                    { label: "Total Customers", value: stats.totalCustomers.toString(), icon: Users, color: "text-purple-500", bg: "bg-purple-500/10", trend: "+5" },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:shadow-lg transition-all duration-300 group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className="text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                                {stat.trend}
                            </span>
                        </div>
                        <p className="font-display text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                        <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* New Requests */}
                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div>
                            <h3 className="font-display text-lg font-bold">New Requests</h3>
                            <p className="text-sm text-muted-foreground">Jobs waiting for your acceptance</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
                                <Filter className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[500px]">
                        <AnimatePresence mode="popLayout">
                            {requests.length > 0 ? requests.map((request) => (
                                <motion.div
                                    key={request.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-background/50 border border-white/5 rounded-2xl p-5 hover:border-primary/20 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                                                {request.profiles.avatar_url ? (
                                                    <img src={request.profiles.avatar_url} alt={request.profiles.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-6 h-6 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground">{request.services.name}</h4>
                                                <p className="text-sm text-muted-foreground">{request.profiles.full_name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-display font-bold text-lg text-primary block">₹{request.total_amount}</span>
                                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6 bg-secondary/30 p-3 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <span className="truncate max-w-[150px]">{request.address}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            variant="outline"
                                            className="w-full rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                                            onClick={() => handleUpdateStatus(request.id, 'cancelled')}
                                            disabled={processingId === request.id}
                                        >
                                            {processingId === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Decline"}
                                        </Button>
                                        <Button
                                            className="w-full rounded-xl bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20"
                                            onClick={() => handleUpdateStatus(request.id, 'confirmed')}
                                            disabled={processingId === request.id}
                                        >
                                            {processingId === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept Job"}
                                        </Button>
                                    </div>
                                </motion.div>
                            )) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-64 text-center"
                                >
                                    <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-lg font-medium text-foreground">All caught up!</p>
                                    <p className="text-muted-foreground">No new requests at the moment.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Active Jobs */}
                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="font-display text-lg font-bold">Active Jobs</h3>
                        <p className="text-sm text-muted-foreground">Track your ongoing work</p>
                    </div>

                    <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[500px]">
                        {activeJobs.length > 0 ? activeJobs.map((job) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-background/80 to-background/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider border border-amber-500/20">
                                        {job.status.replace("_", " ")}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
                                        {job.profiles.avatar_url ? (
                                            <img src={job.profiles.avatar_url} alt={job.profiles.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-foreground">{job.services.name}</h4>
                                        <p className="text-muted-foreground">{job.profiles.full_name}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-secondary/30 p-3 rounded-xl">
                                        <p className="text-xs text-muted-foreground mb-1">Location</p>
                                        <p className="text-sm font-medium truncate">{job.address}</p>
                                    </div>
                                    <div className="bg-secondary/30 p-3 rounded-xl">
                                        <p className="text-xs text-muted-foreground mb-1">Est. Earnings</p>
                                        <p className="text-sm font-medium text-success">₹{job.total_amount}</p>
                                    </div>
                                </div>

                                {(job.status === "in_progress" || job.status === "confirmed") && (
                                    <div className="mb-6">
                                        <LocationSharingToggle
                                            vendorId={user?.id || ''}
                                            bookingId={job.id.toString()}
                                            compact
                                        />
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-xl h-11"
                                        onClick={() => window.location.href = `tel:${job.profiles.phone_number}`}
                                        disabled={!job.profiles.phone_number}
                                    >
                                        <Phone className="w-4 h-4 mr-2" /> Call
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-xl h-11"
                                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`, "_blank")}
                                    >
                                        <Navigation className="w-4 h-4 mr-2" /> Map
                                    </Button>
                                </div>

                                <Button
                                    className="w-full mt-3 rounded-xl h-11 bg-primary hover:bg-primary/90"
                                    onClick={() => handleUpdateStatus(job.id, job.status === "confirmed" ? "in_progress" : "completed")}
                                    disabled={processingId === job.id}
                                >
                                    {processingId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        job.status === "confirmed" ? "Start Job" : "Complete Job"
                                    )}
                                </Button>
                            </motion.div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                                    <Clock className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-lg font-medium text-foreground">No active jobs</p>
                                <p className="text-muted-foreground">You're free to take new requests!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VendorOverview;

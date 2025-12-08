import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2, Calendar } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Booking {
    id: number;
    status: string;
    total_amount: number;
    scheduled_at: string;
    address: string;
    created_at: string;
    profiles: {
        full_name: string;
        phone_number: string | null;
    };
    services: {
        name: string;
    };
}

const VendorBookings = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        if (!user) return;

        const fetchBookings = async () => {
            try {
                // Manual fetch to bypass potential missing FK issue
                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('bookings')
                    .select(`
                        *,
                        customer_id,
                        services:service_id(name)
                    `)
                    .eq('vendor_id', user.id)
                    .order('created_at', { ascending: false });

                if (bookingsError) throw bookingsError;

                // Manually fetch profiles
                const customerIds = [...new Set(bookingsData.map((b: any) => b.customer_id))];
                let profilesMap: Record<string, any> = {};

                if (customerIds.length > 0) {
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('id, full_name, phone_number')
                        .in('id', customerIds);

                    if (profilesData) {
                        profilesMap = profilesData.reduce((acc, p) => {
                            acc[p.id] = p;
                            return acc;
                        }, {} as Record<string, any>);
                    }
                }

                const bookingsWithProfiles = bookingsData.map((b: any) => ({
                    ...b,
                    profiles: profilesMap[b.customer_id] || { full_name: 'Unknown User', phone_number: null }
                }));

                setBookings(bookingsWithProfiles as unknown as Booking[]);
            } catch (error) {
                console.error('Error fetching bookings:', error);
                toast({
                    title: "Error",
                    description: "Could not load bookings.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, [user, toast]);

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.services.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id.toString().includes(searchTerm);

        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-success/20 text-success hover:bg-success/30';
            case 'in_progress': return 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30';
            case 'confirmed': return 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30';
            case 'cancelled': return 'bg-destructive/20 text-destructive hover:bg-destructive/30';
            default: return 'bg-secondary text-muted-foreground';
        }
    };

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
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by customer, service, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-background/50"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-background/50">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="bg-background/50">
                        Export
                    </Button>
                </div>
            </div>

            <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="text-muted-foreground">Booking ID</TableHead>
                            <TableHead className="text-muted-foreground">Customer</TableHead>
                            <TableHead className="text-muted-foreground">Service</TableHead>
                            <TableHead className="text-muted-foreground">Date & Time</TableHead>
                            <TableHead className="text-muted-foreground">Amount</TableHead>
                            <TableHead className="text-muted-foreground">Status</TableHead>
                            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map((booking) => (
                                <TableRow key={booking.id} className="hover:bg-white/5 border-white/5 transition-colors">
                                    <TableCell className="font-medium">#{booking.id}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-foreground">{booking.profiles.full_name}</p>
                                            <p className="text-xs text-muted-foreground">{booking.profiles.phone_number || 'No phone'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{booking.services.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span>{format(new Date(booking.scheduled_at), "MMM d, yyyy • h:mm a")}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-success">₹{booking.total_amount}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={`${getStatusColor(booking.status)} border-0 capitalize`}>
                                            {booking.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="hover:bg-white/10">
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center text-muted-foreground">
                                    No bookings found matching your filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </motion.div>
    );
};

export default VendorBookings;

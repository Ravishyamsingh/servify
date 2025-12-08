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
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, MapPin } from "lucide-react";

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

const VendorHistory = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [history, setHistory] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchHistory = async () => {
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
                    .in('status', ['completed', 'cancelled'])
                    .order('scheduled_at', { ascending: false });

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

                setHistory(bookingsWithProfiles as unknown as Booking[]);
            } catch (error) {
                console.error('Error fetching history:', error);
                toast({
                    title: "Error",
                    description: "Could not load job history.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [user, toast]);

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
            <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-display font-bold text-foreground">Job History</h2>
                        <p className="text-sm text-muted-foreground">A record of all your completed and cancelled jobs</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/5 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="hover:bg-transparent border-white/5">
                                <TableHead className="text-muted-foreground">Job ID</TableHead>
                                <TableHead className="text-muted-foreground">Service Details</TableHead>
                                <TableHead className="text-muted-foreground">Location</TableHead>
                                <TableHead className="text-muted-foreground">Date Completed</TableHead>
                                <TableHead className="text-muted-foreground">Earnings</TableHead>
                                <TableHead className="text-muted-foreground">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length > 0 ? (
                                history.map((job) => (
                                    <TableRow key={job.id} className="hover:bg-white/5 border-white/5 transition-colors">
                                        <TableCell className="font-medium">#{job.id}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-foreground">{job.services.name}</p>
                                                <p className="text-xs text-muted-foreground">Customer: {job.profiles.full_name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate max-w-[150px]">{job.address}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <span>{format(new Date(job.scheduled_at), "MMM d, yyyy")}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-success">₹{job.total_amount}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`${job.status === 'completed' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'} border-0 capitalize`}>
                                                {job.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
                                        No history available yet. Complete some jobs to see them here!
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </motion.div>
    );
};

export default VendorHistory;

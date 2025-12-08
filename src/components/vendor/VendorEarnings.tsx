import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, DollarSign, Calendar, ArrowUpRight, Download, Wallet, Clock } from "lucide-react";

interface Transaction {
    id: number;
    amount: number;
    date: string;
    service: string;
    customer: string;
    status: string;
}

const VendorEarnings = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        pendingClearance: 0,
        avgPerJob: 0,
        thisWeek: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [weeklyData, setWeeklyData] = useState<{ day: string; amount: number }[]>([]);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch completed bookings for earnings without join
                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('bookings')
                    .select(`
                        id,
                        total_amount,
                        created_at,
                        status,
                        customer_id,
                        services:service_id(name)
                    `)
                    .eq('vendor_id', user.id)
                    .eq('status', 'completed')
                    .order('created_at', { ascending: false });

                if (bookingsError) throw bookingsError;

                // Manually fetch profiles
                const customerIds = [...new Set(bookingsData.map((b: any) => b.customer_id))];
                let profilesMap: Record<string, any> = {};

                if (customerIds.length > 0) {
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('id, full_name')
                        .in('id', customerIds);

                    if (profilesData) {
                        profilesMap = profilesData.reduce((acc, p) => {
                            acc[p.id] = p;
                            return acc;
                        }, {} as Record<string, any>);
                    }
                }

                const mappedTransactions = bookingsData.map((b: any) => ({
                    id: b.id,
                    amount: Number(b.total_amount) || 0,
                    date: b.created_at,
                    service: b.services?.name || 'Service',
                    customer: profilesMap[b.customer_id]?.full_name || 'Customer',
                    status: 'paid' // Assuming completed jobs are paid
                }));

                setTransactions(mappedTransactions);

                // Calculate Stats
                const total = mappedTransactions.reduce((sum, t) => sum + t.amount, 0);
                const avg = mappedTransactions.length > 0 ? total / mappedTransactions.length : 0;

                // Mock pending clearance (e.g. 10% of total)
                const pending = total * 0.10;

                // Weekly Data Calculation
                const start = startOfWeek(new Date(), { weekStartsOn: 1 });
                const end = endOfWeek(new Date(), { weekStartsOn: 1 });
                const days = eachDayOfInterval({ start, end });

                const weeklyChart = days.map(day => {
                    const dailyTotal = mappedTransactions
                        .filter(t => isSameDay(new Date(t.date), day))
                        .reduce((sum, t) => sum + t.amount, 0);
                    return {
                        day: format(day, "EEE"),
                        amount: dailyTotal
                    };
                });

                const weekTotal = weeklyChart.reduce((sum, d) => sum + d.amount, 0);

                setStats({
                    totalEarnings: total,
                    pendingClearance: pending,
                    avgPerJob: avg,
                    thisWeek: weekTotal
                });
                setWeeklyData(weeklyChart);

            } catch (error) {
                console.error('Error fetching earnings:', error);
                toast({
                    title: "Error",
                    description: "Could not load earnings data.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, toast]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const maxChartValue = Math.max(...weeklyData.map(d => d.amount), 100); // Prevent division by zero

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="w-16 h-16" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Earnings</p>
                    <h3 className="text-3xl font-display font-bold text-foreground">₹{stats.totalEarnings.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center text-xs font-medium text-success bg-success/10 w-fit px-2 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3 mr-1" /> +15% from last month
                    </div>
                </div>

                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-16 h-16" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Pending Clearance</p>
                    <h3 className="text-3xl font-display font-bold text-foreground">₹{stats.pendingClearance.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center text-xs font-medium text-amber-500 bg-amber-500/10 w-fit px-2 py-1 rounded-full">
                        Available in 2-3 days
                    </div>
                </div>

                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-16 h-16" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Average per Job</p>
                    <h3 className="text-3xl font-display font-bold text-foreground">₹{Math.round(stats.avgPerJob).toLocaleString()}</h3>
                    <div className="mt-4 flex items-center text-xs font-medium text-blue-500 bg-blue-500/10 w-fit px-2 py-1 rounded-full">
                        Based on {transactions.length} jobs
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-display text-lg font-bold">Revenue Analytics</h3>
                            <p className="text-sm text-muted-foreground">Weekly earnings overview</p>
                        </div>
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                            Last 7 Days
                        </Button>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-4">
                        {weeklyData.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full relative h-full flex items-end rounded-t-xl bg-secondary/30 overflow-hidden">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(data.amount / maxChartValue) * 100}%` }}
                                        transition={{ duration: 0.8, delay: index * 0.1 }}
                                        className="w-full bg-primary hover:bg-primary/80 transition-colors relative"
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold px-2 py-1 rounded transition-opacity whitespace-nowrap">
                                            ₹{data.amount}
                                        </div>
                                    </motion.div>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">{data.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display text-lg font-bold">Recent Payouts</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowUpRight className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2">
                        {transactions.slice(0, 5).map(t => (
                            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{t.service}</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(t.date), "MMM d")}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">+₹{t.amount}</p>
                                    <p className="text-xs text-green-500 font-medium">Paid</p>
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <div className="text-center text-muted-foreground py-10">No transactions yet</div>
                        )}
                    </div>
                    <Button variant="outline" className="w-full mt-4 rounded-xl">
                        <Download className="w-4 h-4 mr-2" /> Download Report
                    </Button>
                </div>
            </div>

            {/* Detailed History Table */}
            <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="font-display text-lg font-bold">Transaction History</h3>
                </div>
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-muted-foreground">Date</TableHead>
                            <TableHead className="text-muted-foreground">Description</TableHead>
                            <TableHead className="text-muted-foreground">Customer</TableHead>
                            <TableHead className="text-muted-foreground">Status</TableHead>
                            <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((t) => (
                            <TableRow key={t.id} className="border-white/5 hover:bg-white/5">
                                <TableCell className="font-medium text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {format(new Date(t.date), "MMM d, yyyy")}
                                    </div>
                                </TableCell>
                                <TableCell>{t.service}</TableCell>
                                <TableCell>{t.customer}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20 uppercase">
                                        {t.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-bold">₹{t.amount.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                        {transactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No transaction records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </motion.div>
    );
};

export default VendorEarnings;

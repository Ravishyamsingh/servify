import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Star, User, MessageSquare } from "lucide-react";

interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    customer: {
        full_name: string;
        avatar_url: string | null;
    };
}

const VendorReviews = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        if (!user) return;

        const fetchReviews = async () => {
            try {
                // Note: We're using a join on the 'reviews' table. 
                // Ensure the foreign key relationship is correctly named in Supabase.
                // If 'customer:customer_id' fails, we might need to adjust based on the actual relation name.
                // Manual fetch to bypass potential missing FK issue
                const { data: reviewsData, error: reviewsError } = await supabase
                    .from('reviews')
                    .select(`
                        id,
                        rating,
                        comment,
                        created_at,
                        customer_id
                    `)
                    .eq('vendor_id', user.id)
                    .order('created_at', { ascending: false });

                if (reviewsError) throw reviewsError;

                // Manually fetch profiles
                const customerIds = [...new Set(reviewsData.map((r: any) => r.customer_id))];
                let profilesMap: Record<string, any> = {};

                if (customerIds.length > 0) {
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url')
                        .in('id', customerIds);

                    if (profilesData) {
                        profilesMap = profilesData.reduce((acc, p) => {
                            acc[p.id] = p;
                            return acc;
                        }, {} as Record<string, any>);
                    }
                }

                const typedReviews = reviewsData.map((r: any) => ({
                    id: r.id,
                    rating: r.rating,
                    comment: r.comment,
                    created_at: r.created_at,
                    customer: profilesMap[r.customer_id] || { full_name: 'Unknown User', avatar_url: null }
                })) as Review[];

                setReviews(typedReviews);

                if (typedReviews.length > 0) {
                    const total = typedReviews.reduce((sum, r) => sum + r.rating, 0);
                    setAverageRating(total / typedReviews.length);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
                toast({
                    title: "Error",
                    description: "Could not load reviews.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
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
            className="space-y-8"
        >
            {/* Header Stats */}
            <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center border-2 border-amber-500/20">
                        <Star className="w-10 h-10 text-amber-500 fill-amber-500" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl font-display font-bold text-foreground">{averageRating.toFixed(1)}</h2>
                            <span className="text-muted-foreground">/ 5.0</span>
                        </div>
                        <p className="text-muted-foreground">Based on {reviews.length} reviews</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex flex-col items-center gap-1">
                            <div className="h-24 w-2 bg-secondary rounded-full overflow-hidden relative">
                                <div
                                    className="absolute bottom-0 left-0 w-full bg-amber-500 rounded-full"
                                    style={{
                                        height: `${reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0}%`
                                    }}
                                />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{star}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-primary/20 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                        {review.customer.avatar_url ? (
                                            <img src={review.customer.avatar_url} alt={review.customer.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground">{review.customer.full_name}</h4>
                                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">"{review.comment}"</p>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium text-foreground">No reviews yet</p>
                        <p className="text-muted-foreground">Reviews will appear here once customers rate your services.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default VendorReviews;

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Save, User, Building2, MapPin, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";

const profileSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
    business_name: z.string().min(2, "Business name is required"),
    description: z.string().optional(),
    city: z.string().min(2, "City is required"),
    address: z.string().min(5, "Address is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const VendorProfile = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: "",
            phone_number: "",
            business_name: "",
            description: "",
            city: "",
            address: "",
        },
    });
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            try {
                const { data: profileData, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .maybeSingle();

                const { data: vendorData, error: vendorError } = await supabase
                    .from("vendors")
                    .select("*")
                    .eq("id", user.id)
                    .maybeSingle();

                if (profileError) throw profileError;
                if (vendorError) throw vendorError;

                // Cast to any to handle type mismatch with generated types
                const profile = profileData as any;
                const vendor = vendorData as any;

                form.reset({
                    full_name: profile?.full_name || "",
                    phone_number: profile?.phone_number || "",
                    business_name: vendor?.business_name || "",
                    description: vendor?.description || "",
                    city: vendor?.city || "",
                    address: vendor?.address || "",
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast({
                    title: "Error",
                    description: "Could not load profile data.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user, form, toast]);

    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return;
        setIsSaving(true);

        try {
            // Update Profile
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    full_name: data.full_name,
                    phone_number: data.phone_number,
                    updated_at: new Date().toISOString(),
                } as any);

            if (profileError) throw profileError;

            // Update Vendor Details
            const { error: vendorError } = await supabase
                .from("vendors")
                .upsert({
                    id: user.id,
                    business_name: data.business_name,
                    description: data.description,
                    city: data.city,
                    address: data.address,
                    updated_at: new Date().toISOString(),
                } as any);

            if (vendorError) throw vendorError;

            toast({
                title: "Success",
                description: "Profile updated successfully!",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Error",
                description: "Failed to update profile.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
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
            className="max-w-4xl mx-auto"
        >
            <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border-2 border-primary/20">
                        <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-bold text-foreground">Edit Profile</h2>
                        <p className="text-muted-foreground">Manage your personal and business information</p>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Personal Info */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" /> Personal Details
                                </h3>

                                <FormField
                                    control={form.control}
                                    name="full_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} className="bg-background/50" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="+91 98765 43210" className="pl-9 bg-background/50" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FormLabel>Email Address</FormLabel>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input value={user?.email || ""} disabled className="pl-9 bg-secondary/50" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                                </div>
                            </div>

                            {/* Business Info */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" /> Business Details
                                </h3>

                                <FormField
                                    control={form.control}
                                    name="business_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="TechFix Solutions" {...field} className="bg-background/50" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Mumbai" {...field} className="bg-background/50" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Textarea
                                                        placeholder="Shop No. 4, Main Street..."
                                                        className="pl-9 min-h-[100px] bg-background/50 resize-none"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>About Your Business</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell customers about your services and expertise..."
                                            className="min-h-[100px] bg-background/50"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit" size="lg" disabled={isSaving} className="w-full md:w-auto">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </motion.div>
    );
};

export default VendorProfile;

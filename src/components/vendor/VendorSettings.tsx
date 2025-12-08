import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bell, Shield, Moon, Globe, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const VendorSettings = () => {
    const { toast } = useToast();
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Settings Saved",
                description: "Your preferences have been updated.",
            });
        }, 1000);
    };

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-8"
        >
            <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">Settings</h2>

                <div className="space-y-8">
                    {/* Notifications */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary" /> Notifications
                        </h3>
                        <div className="bg-background/50 rounded-xl p-4 space-y-4 border border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>New Job Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Get notified when a new request arrives</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive daily summaries via email</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Moon className="w-5 h-5 text-primary" /> Appearance
                        </h3>
                        <div className="bg-background/50 rounded-xl p-4 space-y-4 border border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Dark Mode</Label>
                                    <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                                </div>
                                <Switch defaultChecked disabled />
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" /> Security
                        </h3>
                        <div className="bg-background/50 rounded-xl p-4 space-y-4 border border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Two-Factor Authentication</Label>
                                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                                </div>
                                <Button variant="outline" size="sm">Enable</Button>
                            </div>
                            <div className="pt-2">
                                <Button variant="destructive" className="w-full sm:w-auto" onClick={handleLogout}>
                                    <LogOut className="w-4 h-4 mr-2" /> Sign out of all devices
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button size="lg" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save Preferences"}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VendorSettings;

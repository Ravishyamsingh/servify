import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn, UserPlus, ShieldCheck, Wrench } from "lucide-react";
import { motion } from "framer-motion";

const AuthSelection = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-hero opacity-50" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            {/* Animated Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 10, repeat: Infinity, delay: 2 }}
                className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-3xl"
            />

            <div className="w-full max-w-4xl relative z-10">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary mb-6 shadow-glow"
                    >
                        <Wrench className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4"
                    >
                        Welcome to Servify
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        Your trusted platform for local services. Connect with experts or grow your business today.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {/* Login Option */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Link
                            to="/login"
                            className="group block h-full bg-card/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 hover:shadow-2xl hover:border-primary/50 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                <LogIn className="w-8 h-8 text-primary" />
                            </div>

                            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                                Login
                            </h2>
                            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                                Welcome back! Access your dashboard to manage bookings and services.
                            </p>

                            <div className="flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform duration-300">
                                Sign In <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </div>
                        </Link>
                    </motion.div>

                    {/* Signup Option */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Link
                            to="/signup"
                            className="group block h-full bg-card/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 hover:shadow-2xl hover:border-accent/50 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                <UserPlus className="w-8 h-8 text-accent" />
                            </div>

                            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                                Sign Up
                            </h2>
                            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                                New here? Create an account to book services or become a vendor.
                            </p>

                            <div className="flex items-center text-accent font-semibold group-hover:translate-x-2 transition-transform duration-300">
                                Get Started <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </div>
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 px-6 py-3 rounded-full hover:bg-secondary/50">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthSelection;

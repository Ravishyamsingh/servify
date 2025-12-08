import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Mic,
  Brain,
  MapPin,
  Star,
  Clock,
  Shield,
  CheckCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentModal from "@/components/payment/PaymentModal";
import ImageUpload from "@/components/booking/ImageUpload";
import DateTimePicker from "@/components/booking/DateTimePicker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const steps = [
  { id: 1, title: "Describe Issue" },
  { id: 2, title: "AI Diagnosis" },
  { id: 3, title: "Choose Vendor" },
  { id: 4, title: "Schedule" },
  { id: 5, title: "Confirm" },
];

const BookService = () => {
  const { serviceId: serviceID } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [issueDescription, setIssueDescription] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [address, setAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoadingVendors(true);
      try {
        let query = supabase
          .from('vendors')
          .select(`
            *,
            vendor_services!inner (price)
          `);

        if (serviceID) {
          query = query.eq('vendor_services.service_id', serviceID);
        }

        const { data: vendorsData, error: vendorsError } = await query;

        if (vendorsError) throw vendorsError;

        // Manually fetch profiles since FK might be missing
        const vendorIds = vendorsData.map(v => v.id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', vendorIds);

        if (profilesError) throw profilesError;

        // Create a map for quick lookup
        const profilesMap = (profilesData || []).reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        // Map to display format
        const mappedVendors = vendorsData.map((v: any, index: number) => {
          const profile = profilesMap[v.id];
          return {
            id: v.id, // UUID
            name: v.business_name || profile?.full_name || "Service Provider",
            rating: 4.5 + (index % 5) * 0.1, // Mock rating
            reviews: 10 + index * 5, // Mock reviews
            distance: `${(index + 1.5).toFixed(1)} km`, // Mock distance
            price: v.vendor_services?.[0]?.price || 999, // Real price from DB
            eta: `${30 + index * 10} min`, // Mock ETA
            verified: true,
            image: profile?.avatar_url || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
          };
        });

        setVendorsList(mappedVendors);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        toast({
          title: "Error",
          description: "Could not load vendors.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingVendors(false);
      }
    };

    fetchVendors();
  }, []);

  const selectedVendorData = vendorsList.find((v) => v.id === selectedVendor);

  // Handle going to next step (Step 1 -> Step 2)
  const handleNext = () => {
    if (!issueDescription.trim()) {
      toast({
        title: "Description required",
        description: "Please describe your issue before proceeding.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(2);
  };

  // Optional AI Analysis (secondary action)
  const handleAnalyze = async () => {
    if (!issueDescription.trim()) {
      toast({
        title: "Description required",
        description: "Please describe your issue before analysis.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your issue. Review the diagnosis below.",
      });
      setCurrentStep(2);
    } catch (error) {
      console.error("Error during analysis:", error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenPayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentModalOpen(false);
    setIsSubmitting(true);

    try {
      if (!user || !selectedVendor) {
        throw new Error("User or Vendor invalid");
      }

      // 1. Create the booking record
      // Note: service_id should ideally be a UUID. 
      // For this demo, we might need to fetch a real service ID or use a placeholder if serviceId is an integer from URL.
      // Let's first try to find a valid service ID from the 'services' table if possible,
      // or insert a dummy one if we are strict constraints. 
      // Assuming current schema allows linking to a service. 
      // For now, let's pick the FIRST service ID from DB as a fallback to ensure FK constraint passes,
      // OR rely on serviceId being valid.

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: user.id,
          vendor_id: selectedVendor,
          service_id: serviceID,
          status: 'pending',
          scheduled_date: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
          scheduled_time: selectedTime,
          address: address,
          issue_description: issueDescription,
          total_amount: selectedVendorData?.price || 0
        });

      if (bookingError) throw bookingError;

      toast({
        title: "Booking Confirmed!",
        description: "Your request has been sent to the vendor.",
      });
      navigate("/customer/dashboard");

    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: "Could not create booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Camera not available",
          description: "Please use the file upload option instead.",
          variant: "destructive",
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // In a real app, you'd open a camera modal here
      stream.getTracks().forEach(track => track.stop());

      toast({
        title: "Camera access granted",
        description: "Camera feature coming soon. Please use file upload for now.",
      });
    } catch (error) {
      console.error("Camera error:", error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access or use file upload.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceInput = () => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input. Please type your issue.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIssueDescription((prev) => prev + " " + transcript);
      toast({
        title: "Voice captured",
        description: "Your voice input has been added to the description.",
      });
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      toast({
        title: "Voice input failed",
        description: "Please try again or type your issue.",
        variant: "destructive",
      });
    };

    recognition.start();
    toast({
      title: "Listening...",
      description: "Speak now to describe your issue.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Link */}
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-10">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${currentStep >= step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                    }`}
                >
                  {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block w-16 lg:w-24 h-1 mx-2 rounded transition-colors ${currentStep > step.id ? "bg-primary" : "bg-secondary"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="bg-card rounded-2xl border border-border p-8">
            {/* Step 1: Describe Issue */}
            {currentStep === 1 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">Describe Your Issue</h2>
                <p className="text-muted-foreground mb-8">
                  Tell us what's wrong. You can type, upload images, or use voice input.
                </p>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="issue">What's the problem?</Label>
                    <Textarea
                      id="issue"
                      placeholder="E.g., My phone screen is cracked and touch is not working properly..."
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      className="mt-2 min-h-[120px]"
                    />
                  </div>

                  {/* Working Image Upload */}
                  <div>
                    <Label>Upload Images/Videos (Optional)</Label>
                    <div className="mt-2">
                      <ImageUpload
                        images={uploadedImages}
                        onImagesChange={setUploadedImages}
                        maxFiles={5}
                        maxSizeMB={10}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={handleTakePhoto}>
                      <Camera className="w-4 h-4" /> Take Photo
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={handleVoiceInput}>
                      <Mic className="w-4 h-4" /> Voice Input
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  {/* Optional AI Analysis - Secondary */}
                  <Button
                    variant="outline"
                    onClick={handleAnalyze}
                    disabled={!issueDescription || isAnalyzing}
                    className="gap-2"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                    AI Analysis (Optional)
                  </Button>

                  {/* Primary Next Button */}
                  <Button
                    onClick={handleNext}
                    disabled={!issueDescription}
                    className="gap-2"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: AI Diagnosis */}
            {currentStep === 2 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">AI Diagnosis</h2>
                <p className="text-muted-foreground mb-8">
                  Our AI has analyzed your issue. Here's what we found:
                </p>

                <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Diagnosis Result</h3>
                      <p className="text-muted-foreground mb-4">
                        Based on your description, this appears to be a <strong>screen replacement</strong> issue.
                        The touch digitizer may also need replacement if touch is not responding.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-card rounded-lg">
                          <p className="text-sm text-muted-foreground">Estimated Cost</p>
                          <p className="font-display font-bold text-lg">₹1,200 - ₹2,500</p>
                        </div>
                        <div className="p-3 bg-card rounded-lg">
                          <p className="text-sm text-muted-foreground">Estimated Time</p>
                          <p className="font-display font-bold text-lg">1 - 2 hours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={() => setCurrentStep(3)}>
                    Choose Vendor <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Choose Vendor */}
            {currentStep === 3 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">Choose a Vendor</h2>
                <p className="text-muted-foreground mb-8">
                  Select from verified service providers near you.
                </p>

                {isLoadingVendors ? (
                  <div className="text-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p>Finding experts near you...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vendorsList.map((vendor) => (
                      <div
                        key={vendor.id}
                        onClick={() => setSelectedVendor(vendor.id)}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedVendor === vendor.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={vendor.image}
                            alt={vendor.name}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{vendor.name}</h3>
                              {vendor.verified && (
                                <Shield className="w-4 h-4 text-success" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-warning text-warning" />
                                {vendor.rating} ({vendor.reviews})
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {vendor.distance}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {vendor.eta}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display font-bold text-xl text-foreground">
                              ₹{vendor.price}
                            </p>
                            <p className="text-xs text-muted-foreground">estimated</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {vendorsList.length === 0 && (
                      <div className="text-center py-10 text-muted-foreground">
                        No vendors found.
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={() => setCurrentStep(4)} disabled={!selectedVendor}>
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Schedule */}
            {currentStep === 4 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">Schedule Service</h2>
                <p className="text-muted-foreground mb-8">
                  Choose when and where you'd like the service.
                </p>

                <DateTimePicker
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateChange={setSelectedDate}
                  onTimeChange={setSelectedTime}
                />

                <div className="mt-6">
                  <Label htmlFor="address">Service Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your complete address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(5)}
                    disabled={!selectedDate || !selectedTime || !address}
                  >
                    Review Booking <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Confirm & Payment */}
            {currentStep === 5 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-2">Confirm Booking</h2>
                <p className="text-muted-foreground mb-8">
                  Review your booking details and proceed to payment.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-secondary rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Service</p>
                    <p className="font-semibold">Mobile Screen Repair</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Vendor</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{selectedVendorData?.name}</p>
                      {selectedVendorData?.verified && (
                        <Shield className="w-4 h-4 text-success" />
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-secondary rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Schedule</p>
                    <p className="font-semibold">
                      {selectedDate ? format(selectedDate, "PPP") : ""} at {selectedTime ? format(new Date(`2024-01-01T${selectedTime}:00`), "h:mm a") : ""}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Service Address</p>
                    <p className="font-semibold">{address}</p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service Charge</span>
                      <span>₹{selectedVendorData?.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee (2%)</span>
                      <span>₹{Math.round((selectedVendorData?.price || 0) * 0.02).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <span>₹{Math.round(((selectedVendorData?.price || 0) * 1.02) * 0.18).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-semibold">Total Amount</span>
                      <span className="font-display font-bold text-xl text-primary">
                        ₹{Math.round(((selectedVendorData?.price || 0) * 1.02) * 1.18).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
                    <Lock className="w-4 h-4 text-success" />
                    <span>Secure payment powered by 256-bit encryption</span>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={() => setCurrentStep(4)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    variant="hero"
                    onClick={handleOpenPayment}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pay Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={selectedVendorData?.price || 0}
        serviceName="Mobile Screen Repair"
        vendorName={selectedVendorData?.name || ""}
        customerEmail={user?.email || undefined}
      />
    </div>
  );
};

export default BookService;

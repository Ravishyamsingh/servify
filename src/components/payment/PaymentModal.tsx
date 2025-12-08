import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CreditCard,
  Lock,
  CheckCircle,
  Loader2,
  Shield,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/integrations/stripe";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  serviceName: string;
  vendorName: string;
  customerEmail?: string;
}

const paymentMethods = [
  { id: "card", label: "Card (Stripe Checkout)", icon: CreditCard, logos: ["Visa", "Mastercard", "Rupay"] },
  { id: "cash", label: "Pay After Work / Cash", icon: Banknote, logos: ["Pay on Completion"] },
];

const PaymentModal = ({ isOpen, onClose, onSuccess, amount, serviceName, vendorName, customerEmail }: PaymentModalProps) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"select" | "details" | "processing" | "success">("select");
  const [error, setError] = useState<string | null>(null);

  const serviceCharge = amount;
  const platformFee = Math.max(0, Math.round(amount * 0.02));
  const gst = Math.max(0, Math.round((serviceCharge + platformFee) * 0.18));
  const totalAmount = serviceCharge + platformFee + gst;

  const validatePaymentDetails = () => {
    setError(null);

    if (paymentMethod === "card") {
      if (totalAmount <= 0) {
        setError("Payment amount is invalid");
        return false;
      }
    }

    return true;
  };

  const handleProceedToDetails = () => {
    setPaymentStep("details");
  };

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    setPaymentStep("processing");
    setError(null);

    try {
      const totalInMinor = Math.max(1, Math.round(totalAmount * 100));
      const { url } = await createCheckoutSession({
        amountInMinor: totalInMinor,
        currency: "inr",
        serviceName,
        vendorName,
        customerEmail,
        metadata: {
          service: serviceName,
          vendor: vendorName,
          amount: totalAmount.toString(),
        },
      });

      if (!url) {
        throw new Error("No checkout URL returned from server");
      }

      window.location.href = url;
    } catch (err) {
      console.error("Stripe checkout error:", err);
      setError("Payment failed to start. Please try again.");
      setPaymentStep("details");
      toast({
        title: "Payment Failed",
        description: err instanceof Error ? err.message : "Unable to initiate payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    try {
      if (!validatePaymentDetails()) {
        return;
      }

      if (paymentMethod === "card") {
        await handleStripeCheckout();
        return;
      }

      if (paymentMethod === "cash") {
        setIsProcessing(true);
        setPaymentStep("processing");
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setPaymentStep("success");
        setTimeout(() => {
          onSuccess();
        }, 1200);
        setIsProcessing(false);
        return;
      }

      setError("Please choose card to pay via Stripe");
    } catch (err) {
      console.error("Payment error:", err);
      setError("Payment failed. Please try again.");
      setPaymentStep("details");
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (paymentMethod !== "card") {
        setIsProcessing(false);
      }
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setPaymentStep("select");
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-success" />
            Secure Payment
          </DialogTitle>
          <DialogDescription>
            Choose a payment method to complete your booking.
          </DialogDescription>
        </DialogHeader>

        {/* Payment Summary */}
        <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service</span>
            <span className="font-medium">{serviceName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vendor</span>
            <span className="font-medium">{vendorName}</span>
          </div>
          <div className="border-t border-border my-2 pt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Charge</span>
              <span>₹{serviceCharge.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span>₹{platformFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST (18%)</span>
              <span>₹{gst.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Payment Method Selection */}
        {paymentStep === "select" && (
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                    }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <method.icon className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <Label htmlFor={method.id} className="font-medium cursor-pointer">
                      {method.label}
                    </Label>
                    <div className="flex gap-2 mt-1">
                      {method.logos.map((logo) => (
                        <span key={logo} className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                          {logo}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <Button className="w-full" size="lg" onClick={handleProceedToDetails}>
              Continue to Payment
            </Button>
          </div>
        )}

        {/* Payment Details Form */}
        {paymentStep === "details" && (
          <div className="space-y-4">
            {paymentMethod === "card" && (
              <div className="space-y-3 p-4 border rounded-lg bg-secondary/40">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <p className="font-semibold">Stripe Secure Checkout</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  You will be redirected to Stripe to complete your card payment securely. No card
                  details are stored in this app.
                </p>
              </div>
            )}

            {paymentMethod === "cash" && (
              <div className="text-center py-6">
                <Banknote className="w-12 h-12 mx-auto text-primary mb-3" />
                <h3 className="font-semibold text-lg mb-2">Pay After Work</h3>
                <p className="text-muted-foreground px-4">
                  You can pay the vendor <strong>₹{totalAmount.toLocaleString()}</strong> in cash or via UPI after the service is completed to your satisfaction.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setPaymentStep("select")}>Back</Button>
              <Button className="flex-1" onClick={handlePayment} disabled={isProcessing}>
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : paymentMethod === "cash" ? "Confirm Booking" : `Pay ₹${totalAmount.toLocaleString()}`}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Your payment is secured with 256-bit encryption</span>
            </div>
          </div>
        )}

        {/* Processing State */}
        {paymentStep === "processing" && (
          <div className="py-12 text-center">
            <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
            <h3 className="font-semibold text-lg mb-2">Processing Payment</h3>
            <p className="text-muted-foreground">Please wait while we process your payment...</p>
            <p className="text-xs text-muted-foreground mt-4">Do not close this window or press back</p>
          </div>
        )}

        {/* Success State */}
        {paymentStep === "success" && (
          <div className="py-12 text-center">
            <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Booking Confirmed!</h3>
            <p className="text-muted-foreground">Your service request has been successfully placed.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;

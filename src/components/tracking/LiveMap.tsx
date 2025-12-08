import { useState, useEffect } from "react";
import { MapPin, Navigation, Phone, MessageSquare, Clock, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVendorLocationTracking } from "@/hooks/useVendorLocationTracking";

interface LiveMapProps {
  vendorId?: string;
  vendorName: string;
  vendorPhone?: string;
  estimatedTime?: string;
  status: "accepted" | "on_the_way" | "arrived" | "in_progress" | "completed";
  customerAddress?: string;
  bookingId?: string;
  customerLocation?: { lat: number; lng: number };
}

const statusSteps = [
  { id: "accepted", label: "Job Accepted", icon: CheckCircle },
  { id: "on_the_way", label: "On the Way", icon: Navigation },
  { id: "arrived", label: "Arrived", icon: MapPin },
  { id: "in_progress", label: "Work in Progress", icon: Clock },
  { id: "completed", label: "Completed", icon: CheckCircle },
];

const LiveMap = ({
  vendorId,
  vendorName,
  vendorPhone,
  estimatedTime,
  status,
  customerAddress,
  bookingId,
  customerLocation,
}: LiveMapProps) => {
  const [mapError, setMapError] = useState<string | null>(null);

  // Use real-time vendor location tracking
  const { vendorLocation, isLoading, error } = useVendorLocationTracking({
    vendorId,
    bookingId,
    enabled: status === "on_the_way" || status === "arrived",
  });

  // Calculate vendor marker position based on real coordinates or simulate
  const getVendorMarkerPosition = () => {
    if (vendorLocation) {
      // Real location available - calculate position relative to customer
      const baseLat = customerLocation?.lat || 12.9716;
      const baseLng = customerLocation?.lng || 77.5946;
      
      // Calculate relative position for display (simplified visualization)
      const latDiff = (vendorLocation.lat - baseLat) * 10000;
      const lngDiff = (vendorLocation.lng - baseLng) * 10000;
      
      return {
        top: Math.max(10, Math.min(70, 50 - latDiff)),
        left: Math.max(10, Math.min(70, 50 + lngDiff)),
      };
    }
    
    // Fallback to animated position
    return {
      top: 30,
      left: 40,
    };
  };

  const markerPosition = getVendorMarkerPosition();

  const currentStepIndex = statusSteps.findIndex((step) => step.id === status);

  const handleCall = () => {
    if (vendorPhone) {
      window.location.href = `tel:${vendorPhone}`;
    }
  };

  const handleMessage = () => {
    console.log("Open chat with vendor");
  };

  // Format timestamp for display
  const formatLastUpdate = (timestamp?: string) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card h-64 md:h-80">
        {/* Placeholder Map UI */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-card">
          {/* Grid pattern for map feel */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Customer location marker */}
          <div className="absolute bottom-1/4 right-1/3">
            <div className="relative">
              <div className="w-4 h-4 bg-primary rounded-full animate-ping absolute" />
              <div className="w-4 h-4 bg-primary rounded-full relative z-10" />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                Your Location
              </div>
            </div>
          </div>

          {/* Vendor location marker - real-time updates */}
          {(status === "on_the_way" || status === "arrived") && (
            <div
              className="absolute transition-all duration-1000 ease-out"
              style={{
                top: `${markerPosition.top}%`,
                left: `${markerPosition.left}%`,
              }}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center shadow-lg shadow-success/30">
                  <Navigation
                    className="w-5 h-5 text-success-foreground"
                    style={{
                      transform: `rotate(${vendorLocation?.heading || 0}deg)`,
                    }}
                  />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-success font-medium whitespace-nowrap">
                  {vendorName}
                </div>
                {/* Speed indicator */}
                {vendorLocation?.speed && vendorLocation.speed > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap bg-card/80 px-2 py-0.5 rounded">
                    {Math.round(vendorLocation.speed * 3.6)} km/h
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (status === "on_the_way" || status === "arrived") && (
            <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-full border border-border">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-sm">Loading location...</span>
              </div>
            </div>
          )}

          {/* Real-time status badge */}
          {vendorLocation && (
            <div className="absolute top-4 left-4 bg-success/20 backdrop-blur-sm px-3 py-2 rounded-full border border-success/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-sm text-success font-medium">Live Tracking</span>
                {vendorLocation.timestamp && (
                  <span className="text-xs text-muted-foreground">
                    • {formatLastUpdate(vendorLocation.timestamp)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ETA badge */}
          {estimatedTime && status === "on_the_way" && (
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">ETA: {estimatedTime}</span>
              </div>
            </div>
          )}

          {/* Error indicator */}
          {error && (
            <div className="absolute bottom-4 left-4 bg-destructive/20 backdrop-blur-sm px-3 py-2 rounded-full border border-destructive/30">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            </div>
          )}

          {/* Coordinates display */}
          {vendorLocation && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/70 bg-card/50 px-2 py-1 rounded">
              {vendorLocation.lat.toFixed(6)}, {vendorLocation.lng.toFixed(6)}
            </div>
          )}

          {/* Map attribution placeholder */}
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground/50">
            Real-time GPS tracking enabled
          </div>
        </div>

        {/* Map not available notice */}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
            <p className="text-muted-foreground">{mapError}</p>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-semibold text-foreground mb-4">Service Status</h4>
        <div className="relative">
          {statusSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div key={step.id} className="flex items-start gap-4 pb-6 last:pb-0">
                {/* Status line */}
                {index < statusSteps.length - 1 && (
                  <div
                    className={`absolute left-[19px] w-0.5 h-8 mt-8 ${
                      isCompleted ? "bg-success" : "bg-border"
                    }`}
                    style={{ top: `${index * 56}px` }}
                  />
                )}

                {/* Status icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? "bg-success text-success-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground animate-pulse"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>

                {/* Status text */}
                <div className="flex-1 pt-2">
                  <p
                    className={`font-medium ${
                      isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && step.id === "on_the_way" && estimatedTime && (
                    <p className="text-sm text-primary">Arriving in {estimatedTime}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vendor Contact */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center text-success-foreground font-semibold">
              {vendorName.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-foreground">{vendorName}</p>
              <p className="text-sm text-muted-foreground">Your service provider</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleMessage}>
              <MessageSquare className="w-5 h-5" />
            </Button>
            <Button variant="default" size="icon" onClick={handleCall}>
              <Phone className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Service address */}
        {customerAddress && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Service Address</p>
                <p className="text-foreground">{customerAddress}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMap;

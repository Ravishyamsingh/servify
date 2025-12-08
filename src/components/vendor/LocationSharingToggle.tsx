import { useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useShareVendorLocation } from "@/hooks/useVendorLocationTracking";

interface LocationSharingToggleProps {
  vendorId: string;
  bookingId?: string;
  compact?: boolean;
}

const LocationSharingToggle = ({
  vendorId,
  bookingId,
  compact = false,
}: LocationSharingToggleProps) => {
  const { isSharing, startSharing, stopSharing } = useShareVendorLocation(
    vendorId,
    bookingId
  );
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      if (isSharing) {
        stopSharing();
      } else {
        await startSharing();
      }
    } finally {
      setIsToggling(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Switch
          checked={isSharing}
          onCheckedChange={handleToggle}
          disabled={isToggling}
        />
        <span className="text-sm text-muted-foreground">
          {isSharing ? "Sharing" : "Share"} Location
        </span>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isSharing
                ? "bg-success text-success-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {isToggling ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSharing ? (
              <Navigation className="w-5 h-5" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">Location Sharing</p>
            <p className="text-sm text-muted-foreground">
              {isSharing
                ? "Your location is being shared with the customer"
                : "Share your location for live tracking"}
            </p>
          </div>
        </div>
        <Button
          variant={isSharing ? "destructive" : "default"}
          size="sm"
          onClick={handleToggle}
          disabled={isToggling}
        >
          {isToggling ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          {isSharing ? "Stop Sharing" : "Start Sharing"}
        </Button>
      </div>

      {isSharing && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm text-success">Live tracking active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSharingToggle;

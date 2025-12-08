import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VendorLocation {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp?: string;
}

interface UseVendorLocationTrackingProps {
  vendorId?: string;
  bookingId?: string;
  enabled?: boolean;
}

export const useVendorLocationTracking = ({
  vendorId,
  bookingId,
  enabled = true,
}: UseVendorLocationTrackingProps) => {
  const [vendorLocation, setVendorLocation] = useState<VendorLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch latest location on mount
  useEffect(() => {
    if (!vendorId || !enabled) {
      setIsLoading(false);
      return;
    }

    const fetchLatestLocation = async () => {
      try {
        let query = supabase
          .from("vendor_locations")
          .select("*")
          .eq("vendor_id", vendorId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (bookingId) {
          query = query.eq("booking_id", bookingId);
        }

        const { data, error: fetchError } = await query.single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching vendor location:", fetchError);
          setError("Unable to fetch vendor location");
        } else if (data) {
          setVendorLocation({
            lat: Number(data.latitude),
            lng: Number(data.longitude),
            heading: data.heading ? Number(data.heading) : undefined,
            speed: data.speed ? Number(data.speed) : undefined,
            accuracy: data.accuracy || undefined,
            timestamp: data.created_at,
          });
        }
      } catch (err) {
        console.error("Error in fetchLatestLocation:", err);
        setError("Failed to load location data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestLocation();
  }, [vendorId, bookingId, enabled]);

  // Subscribe to real-time location updates
  useEffect(() => {
    if (!vendorId || !enabled) return;

    console.log("Setting up real-time location tracking for vendor:", vendorId);

    const channel = supabase
      .channel(`vendor-location-${vendorId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "vendor_locations",
          filter: `vendor_id=eq.${vendorId}`,
        },
        (payload) => {
          console.log("Received location update:", payload);
          const newLocation = payload.new as {
            latitude: number;
            longitude: number;
            heading: number | null;
            speed: number | null;
            accuracy: number | null;
            created_at: string;
          };

          setVendorLocation({
            lat: Number(newLocation.latitude),
            lng: Number(newLocation.longitude),
            heading: newLocation.heading ? Number(newLocation.heading) : undefined,
            speed: newLocation.speed ? Number(newLocation.speed) : undefined,
            accuracy: newLocation.accuracy || undefined,
            timestamp: newLocation.created_at,
          });
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to vendor location updates");
        }
      });

    return () => {
      console.log("Cleaning up location subscription");
      supabase.removeChannel(channel);
    };
  }, [vendorId, enabled]);

  return {
    vendorLocation,
    isLoading,
    error,
  };
};

// Hook for vendors to share their location
export const useShareVendorLocation = (vendorId?: string, bookingId?: string) => {
  const [isSharing, setIsSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();

  const startSharing = useCallback(async () => {
    if (!vendorId) {
      toast({
        title: "Error",
        description: "Vendor ID is required to share location",
        variant: "destructive",
      });
      return;
    }

    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, heading, speed, accuracy } = position.coords;

        try {
          const { error } = await supabase.from("vendor_locations").insert({
            vendor_id: vendorId,
            booking_id: bookingId || null,
            latitude,
            longitude,
            heading: heading || null,
            speed: speed || null,
            accuracy: accuracy ? Math.round(accuracy) : null,
          });

          if (error) {
            console.error("Error inserting location:", error);
          } else {
            console.log("Location shared successfully:", { latitude, longitude });
          }
        } catch (err) {
          console.error("Failed to share location:", err);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "Location Error",
          description: getGeolocationErrorMessage(error),
          variant: "destructive",
        });
        setIsSharing(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    setWatchId(id);

    toast({
      title: "Location Sharing Started",
      description: "Your location is now being shared with the customer",
    });
  }, [vendorId, bookingId, toast]);

  const stopSharing = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsSharing(false);

    toast({
      title: "Location Sharing Stopped",
      description: "You are no longer sharing your location",
    });
  }, [watchId, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    isSharing,
    startSharing,
    stopSharing,
  };
};

function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission denied. Please enable location access.";
    case error.POSITION_UNAVAILABLE:
      return "Location information unavailable.";
    case error.TIMEOUT:
      return "Location request timed out.";
    default:
      return "An unknown error occurred.";
  }
}

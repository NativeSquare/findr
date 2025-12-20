import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import * as Location from "expo-location";
import { useEffect, useRef } from "react";

export function useLocationTracking() {
  const user = useQuery(api.users.currentUser);
  const updateUserLocation = useMutation(api.geospatial.updateUserLocation);
  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null
  );

  useEffect(() => {
    // Only track location if user is authenticated and has an ID
    if (!user?._id) {
      // Clean up subscription if user logs out
      if (watchSubscriptionRef.current) {
        watchSubscriptionRef.current.remove();
        watchSubscriptionRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const startLocationTracking = async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Location permission not granted");
          return;
        }

        // Check if location services are enabled
        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
          console.warn("Location services are not enabled");
          return;
        }

        // Start watching position
        watchSubscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 30000, // Update every 30 seconds
            distanceInterval: 100, // Update every 100 meters
          },
          (location) => {
            if (!isMounted || !user?._id) return;

            const { latitude, longitude } = location.coords;

            // Update user location in Convex
            updateUserLocation({
              id: user._id,
              latitude,
              longitude,
            }).catch((error) => {
              console.error("Failed to update user location:", error);
            });
          }
        );
      } catch (error) {
        console.error("Error starting location tracking:", error);
      }
    };

    startLocationTracking();

    // Cleanup function
    return () => {
      isMounted = false;
      if (watchSubscriptionRef.current) {
        watchSubscriptionRef.current.remove();
        watchSubscriptionRef.current = null;
      }
    };
  }, [user?._id, updateUserLocation]);
}

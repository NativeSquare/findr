import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "convex/react";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Crosshair, MapPin } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export const SEARCH_LOCATION_STORAGE_KEY = "search_location";

export default function LocationSearch() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    selectedLat?: string;
    selectedLng?: string;
    selectedAddress?: string;
    selectedName?: string;
    useCurrentLocation?: string;
  }>();
  const user = useQuery(api.users.currentUser);
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState({
    latitude: 37.7749, // Default to San Francisco
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
    name?: string;
  } | null>(null);
  const [isCurrentLocation, setIsCurrentLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle selected location from autocomplete
  useEffect(() => {
    if (params.selectedLat && params.selectedLng) {
      const lat = parseFloat(params.selectedLat);
      const lng = parseFloat(params.selectedLng);

      const newLocation = {
        latitude: lat,
        longitude: lng,
        address: params.selectedAddress,
        name: params.selectedName,
      };

      setIsCurrentLocation(false);
      setSelectedLocation(newLocation);
      setRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Animate to the selected location
      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  }, [params.selectedLat, params.selectedLng]);

  // Handle "use current location" from autocomplete
  useEffect(() => {
    if (params.useCurrentLocation === "true") {
      handleCurrentLocation();
    }
  }, [params.useCurrentLocation]);

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Location permission not granted");
          setIsLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        // Only set location if no selected location from autocomplete
        if (!params.selectedLat && !params.selectedLng) {
          setSelectedLocation(coords);
          setRegion({
            ...coords,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error getting location:", error);
        setIsLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  const handleSetLocation = async () => {
    if (!selectedLocation) return;

    try {
      if (isCurrentLocation) {
        // Clear stored location so home screen shows "My Location"
        await AsyncStorage.removeItem(SEARCH_LOCATION_STORAGE_KEY);
      } else {
        const locationData = {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          name: selectedLocation.name,
          address: selectedLocation.address,
        };
        await AsyncStorage.setItem(
          SEARCH_LOCATION_STORAGE_KEY,
          JSON.stringify(locationData)
        );
      }
    } catch (error) {
      console.error("Error saving location:", error);
    }
    // Use dismissAll to ensure we return to home, even if there are multiple
    // location-search screens in the stack (e.g., after coming from autocomplete)
    router.dismissAll();
  };

  const handleCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setIsCurrentLocation(true);
      setSelectedLocation({ ...coords, name: "My Location" });
      setRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Animate to current location
      mapRef.current?.animateToRegion(
        {
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );

      // Reverse geocode to get address info (but keep "My Location" as name)
      try {
        const [result] = await Location.reverseGeocodeAsync(coords);
        if (result) {
          const addressParts = [
            result.street,
            result.city,
            result.region,
            result.country,
          ].filter(Boolean);
          const address = addressParts.join(", ");

          setSelectedLocation({
            ...coords,
            name: "My Location",
            address: address || undefined,
          });
        }
      } catch (error) {
        console.error("Error reverse geocoding:", error);
      }
    } catch (error) {
      console.error("Error getting current location:", error);
    }
  };

  const handleSearchPress = () => {
    router.push("/(app)/location-search/autocomplete");
  };

  const handleMapLongPress = async (event: {
    nativeEvent: { coordinate: { latitude: number; longitude: number } };
  }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    // Set the selected location from long press with initial coords
    const newLocation: {
      latitude: number;
      longitude: number;
      address?: string;
      name?: string;
    } = {
      latitude,
      longitude,
    };

    setIsCurrentLocation(false);
    setSelectedLocation(newLocation);

    // Animate to the new location
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      300
    );

    // Reverse geocode to get address info
    try {
      const [result] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (result) {
        const name =
          result.name ||
          result.street ||
          result.city ||
          `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        const addressParts = [
          result.street,
          result.city,
          result.region,
          result.country,
        ].filter(Boolean);
        const address = addressParts.join(", ");

        setSelectedLocation({
          latitude,
          longitude,
          name,
          address: address || undefined,
        });
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      // Keep the location without name/address if reverse geocoding fails
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header with back button and search bar */}
      <View className="absolute top-0 left-0 right-0 z-10 pt-safe bg-background/95 backdrop-blur-sm">
        <View className="flex-row items-center gap-2 p-4">
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
            className="rounded-full"
          >
            <Icon as={ArrowLeft} size={20} />
          </Button>
          <Pressable onPress={handleSearchPress} className="flex-1">
            <View className="relative">
              <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <Ionicons
                  name="search-outline"
                  size={20}
                  className="text-muted-foreground"
                />
              </View>
              <Input
                placeholder={selectedLocation?.name || "Search Location..."}
                className="pl-10"
                editable={false}
                pointerEvents="none"
              />
            </View>
          </Pressable>
        </View>
        {/* Selected location info */}
        {selectedLocation?.address && (
          <View className="px-4 pb-3">
            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
              {selectedLocation.address}
            </Text>
          </View>
        )}
      </View>

      {/* Map View */}
      <View className="flex-1">
        {!isLoading && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            initialRegion={region}
            showsUserLocation={false}
            showsMyLocationButton={false}
            mapType="standard"
            onLongPress={handleMapLongPress}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                anchor={{ x: 0.5, y: 1 }}
                flat={false}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.markerIconContainer}>
                    <MapPin size={20} color="#fff" />
                  </View>
                  <View style={styles.markerPointer} />
                </View>
              </Marker>
            )}
          </MapView>
        )}
      </View>

      {/* Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 z-10 pb-safe bg-background/95 backdrop-blur-sm">
        <View className="flex-row items-center justify-between gap-4 p-4">
          {/* Current Location Button */}
          <Button
            variant="outline"
            size="icon"
            onPress={handleCurrentLocation}
            className="rounded-full w-12 h-12"
          >
            <Icon as={Crosshair} size={20} />
          </Button>

          {/* Set Location Button */}
          <Button onPress={handleSetLocation} className="flex-1 bg-primary">
            <Text className="text-primary-foreground font-medium">
              Set Location
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerIconContainer: {
    backgroundColor: "rgb(249, 115, 22)", // orange-500
    borderRadius: 9999,
    padding: 8,
  },
  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgb(249, 115, 22)", // orange-500
  },
});

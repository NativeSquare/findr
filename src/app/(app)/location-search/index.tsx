import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Crosshair, MapPin } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";

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

  const handleSetLocation = () => {
    // TODO: Implement location setting logic with selectedLocation
    console.log("Setting location:", selectedLocation);
    router.back();
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

      setSelectedLocation(coords);
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
    } catch (error) {
      console.error("Error getting current location:", error);
    }
  };

  const handleSearchPress = () => {
    router.push("/(app)/location-search/autocomplete");
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
          >
            {selectedLocation && (
              <>
                {/* Location Pin Marker */}
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

                {/* Radius Circle */}
                <Circle
                  center={selectedLocation}
                  radius={1000} // 1km radius
                  strokeWidth={2}
                  strokeColor="rgb(249, 115, 22)" // orange-500
                  fillColor="rgba(249, 115, 22, 0.1)" // semi-transparent orange
                />
              </>
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

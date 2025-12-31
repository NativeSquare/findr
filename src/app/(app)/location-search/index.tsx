import { SearchInput } from "@/components/custom/search-input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { ArrowLeft, Crosshair, MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function LocationSearch() {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const [region, setRegion] = useState({
    latitude: 37.7749, // Default to San Francisco
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

        setUserLocation(coords);
        setRegion({
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error getting location:", error);
        setIsLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  const handleSetLocation = () => {
    // TODO: Implement location setting logic
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

      setUserLocation(coords);
      setRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error("Error getting current location:", error);
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
          <View className="flex-1">
            <SearchInput placeholder="Search Location..." />
          </View>
        </View>
      </View>

      {/* Map View */}
      <View className="flex-1">
        {!isLoading && (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation={false}
            showsMyLocationButton={false}
            mapType="standard"
          >
            {userLocation && (
              <>
                {/* Location Pin Marker */}
                <Marker
                  coordinate={userLocation}
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
                  center={userLocation}
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

import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import { MapPin } from "lucide-react-native";
import React from "react";
import { Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export type EventLocationMapProps = {
  latitude?: number;
  longitude?: number;
  location: string;
};

const DELTA = 0.005;

export function EventLocationMap({
  latitude,
  longitude,
  location,
}: EventLocationMapProps) {
  if (!latitude || !longitude) {
    return (
      <View className="h-[124px] rounded-[10px] bg-[#1a1a1e] overflow-hidden items-center justify-center">
        <Ionicons name="map-outline" size={40} color="#70707b" />
        <Text className="text-xs text-[#70707b] mt-2">
          Map not available for this event
        </Text>
      </View>
    );
  }

  const handleOpenInMaps = () => {
    const label = encodeURIComponent(location);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
    });
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <Pressable
      onPress={handleOpenInMaps}
      className="h-[160px] rounded-[10px] overflow-hidden active:opacity-90"
    >
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: DELTA,
          longitudeDelta: DELTA,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        mapType="standard"
        pointerEvents="none"
      >
        <Marker coordinate={{ latitude, longitude }}>
          <View className="items-center">
            <View className="bg-[#e56400] rounded-full p-1.5">
              <MapPin size={16} color="#fff" />
            </View>
            <View className="w-2 h-2 bg-[#e56400] rounded-full mt-0.5 opacity-40" />
          </View>
        </Marker>
      </MapView>
      <View className="absolute bottom-2 right-2 bg-black/50 rounded-md px-2 py-1">
        <Text className="text-[10px] text-white">Open in Maps</Text>
      </View>
    </Pressable>
  );
}

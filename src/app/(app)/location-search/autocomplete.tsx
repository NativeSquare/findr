import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useAction } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, MapPin, Navigation } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  View,
} from "react-native";

type PlacePrediction = {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
};

// Small helper: make a session token per typing session
function makeSessionToken() {
  // Good enough for a session token; no need for crypto-level security here
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Small helper: turn "Paris, France" into main/secondary
function splitMainSecondary(description: string) {
  const parts = description
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const main = parts[0] ?? description;
  const secondary = parts.slice(1).join(", ");
  return { main_text: main, secondary_text: secondary };
}

export default function LocationAutocomplete() {
  const router = useRouter();
  const params = useLocalSearchParams<{ callback?: string; storageKey?: string }>();

  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convex actions
  const placesAutocomplete = useAction(api.places.autocomplete);
  const placesDetails = useAction(api.places.details);

  // Keep one session token while the user types; reset when query is cleared or a place is chosen
  const sessionTokenRef = useRef<string>(makeSessionToken());

  useEffect(() => {
    if (searchQuery.length === 0) {
      sessionTokenRef.current = makeSessionToken();
      setPredictions([]);
      setError(null);
    }
  }, [searchQuery.length]);

  useEffect(() => {
    let cancelled = false;

    const fetchPredictions = async () => {
      if (searchQuery.length < 2) {
        setPredictions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data: any = await placesAutocomplete({
          input: searchQuery,
          sessionToken: sessionTokenRef.current,
          // Optional:
          // languageCode: "fr",
          // countryCode: "FR",
        });

        const suggestions = Array.isArray(data?.suggestions)
          ? data.suggestions
          : [];

        const mapped: PlacePrediction[] = suggestions
          .map((s: any) => s?.placePrediction)
          .filter(Boolean)
          .map((pp: any) => {
            const placeId = pp.placeId as string;
            const description = (pp?.text?.text as string) ?? "";
            const sf = splitMainSecondary(description);

            return {
              place_id: placeId,
              description,
              structured_formatting: sf,
            };
          })
          .filter((p: PlacePrediction) => p.place_id && p.description);

        if (!cancelled) {
          setPredictions(mapped);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Autocomplete error:", err?.message ?? err);
          setError(err?.message ?? "Failed to fetch suggestions");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchPredictions, 300);
    return () => {
      cancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [searchQuery, placesAutocomplete]);

  const handleSelectPlace = async (placeId: string) => {
    Keyboard.dismiss();
    setIsLoading(true);
    setError(null);

    try {
      const place: any = await placesDetails({
        placeId,
        // Optional:
        // languageCode: "fr",
      });

      // Places API (New) returns:
      // place.location.latitude / place.location.longitude
      // place.formattedAddress
      // place.displayName.text
      const lat = place?.location?.latitude;
      const lng = place?.location?.longitude;

      if (typeof lat !== "number" || typeof lng !== "number") {
        throw new Error("Missing place coordinates");
      }

      const formattedAddress = (place?.formattedAddress as string) ?? "";
      const name =
        (place?.displayName?.text as string) ??
        formattedAddress.split(",")[0] ??
        "Selected place";

      // Reset token once a place is chosen (new typing session next time)
      sessionTokenRef.current = makeSessionToken();

      router.replace({
        pathname: "/(app)/location-search",
        params: {
          selectedLat: String(lat),
          selectedLng: String(lng),
          selectedAddress: formattedAddress,
          selectedName: name,
          ...(params.storageKey ? { storageKey: params.storageKey } : {}),
        },
      });
    } catch (err: any) {
      console.error("Details error:", err?.message ?? err);
      setError(err?.message ?? "Failed to get location details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    router.replace({
      pathname: "/(app)/location-search",
      params: {
        useCurrentLocation: "true",
        ...(params.storageKey ? { storageKey: params.storageKey } : {}),
      },
    });
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header with search input */}
      <View className="pt-safe bg-background border-b border-border">
        <View className="flex-row items-center gap-2 p-4">
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
            className="rounded-full"
          >
            <Icon as={ArrowLeft} size={20} />
          </Button>

          <View className="flex-1 relative">
            <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <Ionicons
                name="search-outline"
                size={20}
                className="text-muted-foreground"
              />
            </View>

            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for a location..."
              className="pl-10"
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />

            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  className="text-muted-foreground"
                />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Results */}
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-safe"
      >
        {/* Use Current Location Option */}
        <Pressable
          onPress={handleUseCurrentLocation}
          className="flex-row items-center gap-4 px-4 py-4 border-b border-border active:bg-muted"
        >
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
            <Icon as={Navigation} size={20} className="text-primary" />
          </View>
          <View className="flex-1">
            <Text className="font-medium">Use current location</Text>
            <Text className="text-sm text-muted-foreground">
              Set your location based on GPS
            </Text>
          </View>
        </Pressable>

        {/* Loading State */}
        {isLoading && searchQuery.length >= 2 && (
          <View className="py-8 items-center">
            <ActivityIndicator size="small" />
          </View>
        )}

        {/* Error State */}
        {error && (
          <View className="py-8 items-center px-4">
            <Text className="text-destructive text-center">{error}</Text>
          </View>
        )}

        {/* Predictions List */}
        {!isLoading && predictions.length > 0 && (
          <View>
            <Text className="px-4 py-2 text-sm text-muted-foreground font-medium uppercase tracking-wide">
              Suggestions
            </Text>

            {predictions.map((prediction) => (
              <Pressable
                key={prediction.place_id}
                onPress={() => handleSelectPlace(prediction.place_id)}
                className="flex-row items-center gap-4 px-4 py-3 border-b border-border active:bg-muted"
              >
                <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
                  <Icon
                    as={MapPin}
                    size={18}
                    className="text-muted-foreground"
                  />
                </View>

                <View className="flex-1">
                  <Text className="font-medium" numberOfLines={1}>
                    {prediction.structured_formatting.main_text}
                  </Text>
                  <Text
                    className="text-sm text-muted-foreground"
                    numberOfLines={1}
                  >
                    {prediction.structured_formatting.secondary_text}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!isLoading &&
          searchQuery.length >= 2 &&
          predictions.length === 0 &&
          !error && (
            <View className="py-8 items-center px-4">
              <Text className="text-muted-foreground text-center">
                No locations found for "{searchQuery}"
              </Text>
            </View>
          )}

        {/* Initial State */}
        {searchQuery.length < 2 && (
          <View className="py-8 items-center px-4">
            <Text className="text-muted-foreground text-center">
              Type at least 2 characters to search
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

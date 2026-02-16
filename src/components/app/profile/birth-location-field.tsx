import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { useAction } from "convex/react";
import { MapPin } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, Pressable, View } from "react-native";

type PlacePrediction = {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
};

function makeSessionToken() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function splitMainSecondary(description: string) {
  const parts = description
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const main = parts[0] ?? description;
  const secondary = parts.slice(1).join(", ");
  return { main_text: main, secondary_text: secondary };
}

export type BirthLocationFieldProps = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
};

export function BirthLocationField({
  label = "Birth Location",
  value = "",
  onChange,
  error = false,
  errorMessage,
  required = false,
}: BirthLocationFieldProps) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const autocompleteCities = useAction(api.places.autocompleteCities);
  const sessionTokenRef = useRef<string>(makeSessionToken());
  const isSelectingRef = useRef(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue.length === 0) {
      sessionTokenRef.current = makeSessionToken();
      setPredictions([]);
      setShowDropdown(false);
    }
  }, [inputValue.length]);

  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    let cancelled = false;

    const fetchPredictions = async () => {
      if (inputValue.length < 2) {
        setPredictions([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);

      try {
        const data: any = await autocompleteCities({
          input: inputValue,
          sessionToken: sessionTokenRef.current,
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
          setShowDropdown(mapped.length > 0);
        }
      } catch (err: any) {
        console.error("Cities autocomplete error:", err?.message ?? err);
        if (!cancelled) {
          setPredictions([]);
          setShowDropdown(false);
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
  }, [inputValue, autocompleteCities]);

  const handleSelect = (prediction: PlacePrediction) => {
    isSelectingRef.current = true;
    sessionTokenRef.current = makeSessionToken();
    setPredictions([]);
    setShowDropdown(false);
    setInputValue(prediction.description);
    onChange?.(prediction.description);
    Keyboard.dismiss();
  };

  return (
    <View className="gap-2">
      <Text className="text-sm text-muted-foreground">
        {label}
        {required && <Text className="text-destructive"> *</Text>}
      </Text>
      <View>
        <View className="relative">
          <Input
            value={inputValue}
            onChangeText={(text) => {
              setInputValue(text);
              if (text !== value) {
                onChange?.(text);
              }
            }}
            placeholder="Search for a city..."
            autoCapitalize="words"
            autoCorrect={false}
            className={error ? "border-destructive" : ""}
            onFocus={() => {
              if (predictions.length > 0) setShowDropdown(true);
            }}
          />
          {isLoading && (
            <View className="absolute right-3 top-1/2 -translate-y-1/2">
              <ActivityIndicator size="small" />
            </View>
          )}
        </View>

        {showDropdown && predictions.length > 0 && (
          <View className="border border-border bg-card rounded-md mt-1 overflow-hidden">
            {predictions.map((prediction) => (
              <Pressable
                key={prediction.place_id}
                onPress={() => handleSelect(prediction)}
                className="flex-row items-center gap-3 px-3 py-2.5 border-b border-border last:border-b-0 active:bg-muted"
              >
                <Icon as={MapPin} size={16} className="text-muted-foreground" />
                <View className="flex-1">
                  <Text className="text-sm font-medium" numberOfLines={1}>
                    {prediction.structured_formatting.main_text}
                  </Text>
                  {prediction.structured_formatting.secondary_text ? (
                    <Text
                      className="text-xs text-muted-foreground"
                      numberOfLines={1}
                    >
                      {prediction.structured_formatting.secondary_text}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
      {error && errorMessage && (
        <Text className="text-sm text-destructive">{errorMessage}</Text>
      )}
    </View>
  );
}

import { BodyTypesField } from "@/components/app/profile/body-types-field";
import { EthnicityField } from "@/components/app/profile/ethnicity-field";
import { LookingForField } from "@/components/app/profile/looking-for-field";
import { PositionField } from "@/components/app/profile/position-field";
import { SexualOrientationField } from "@/components/app/profile/sexual-orientation-field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";

export type FilterData = {
  maxDistance: number;
  bodyTypes: string[];
  ethnicity: string[];
  lookingFor: string[];
  position: string[];
  orientation: string;
};

const FILTERS_STORAGE_KEY = "filters";
const DEFAULT_MAX_DISTANCE = 10000; // meters (10km)

export default function Filters() {
  const [filters, setFilters] = React.useState<FilterData>({
    maxDistance: DEFAULT_MAX_DISTANCE,
    bodyTypes: [],
    ethnicity: [],
    lookingFor: [],
    position: [],
    orientation: "",
  });

  React.useEffect(() => {
    // Load saved filters on mount
    const loadFilters = async () => {
      try {
        const savedFilters = await AsyncStorage.getItem(FILTERS_STORAGE_KEY);
        if (savedFilters) {
          const parsed = JSON.parse(savedFilters);
          setFilters({
            maxDistance: parsed.maxDistance ?? DEFAULT_MAX_DISTANCE,
            bodyTypes: parsed.bodyTypes ?? [],
            ethnicity: parsed.ethnicity ?? [],
            lookingFor: parsed.lookingFor ?? [],
            position: parsed.position ?? [],
            orientation: parsed.orientation ?? "",
          });
        }
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    };
    loadFilters();
  }, []);

  const renderHeader = () => {
    return (
      <View className="flex-row items-center justify-between px-5 py-6">
        <Pressable onPress={() => router.back()} className="size-6">
          <Icon as={ChevronLeft} size={24} className="text-white" />
        </Pressable>
        <Text className="text-xl font-medium text-white">Filters</Text>
        <View className="size-6" />
      </View>
    );
  };

  const handleClear = () => {
    const clearedFilters = {
      maxDistance: DEFAULT_MAX_DISTANCE,
      bodyTypes: [],
      ethnicity: [],
      lookingFor: [],
      position: [],
      orientation: "",
    };
    setFilters(clearedFilters);
    AsyncStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(clearedFilters));
  };

  const handleApply = async () => {
    try {
      await AsyncStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error("Error saving filters:", error);
    }
    router.back();
  };

  return (
    <View className="flex-1 mt-safe">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        contentContainerClassName="px-4 pb-6"
      >
        <View className="w-full max-w-md self-center flex-1">
          {renderHeader()}

          <View className="gap-6">
            <View className="gap-2">
              <Text className="text-sm text-muted-foreground">
                Max Distance: {Math.round(filters.maxDistance / 1000)}km
              </Text>
              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={1000}
                maximumValue={50000}
                step={1000}
                value={filters.maxDistance}
                onValueChange={(value) =>
                  setFilters({ ...filters, maxDistance: value })
                }
                minimumTrackTintColor="#ffffff"
                maximumTrackTintColor="#666666"
                thumbTintColor="#ffffff"
              />
            </View>

            <BodyTypesField
              onSelect={(option) =>
                setFilters({
                  ...filters,
                  bodyTypes: filters.bodyTypes.includes(option)
                    ? filters.bodyTypes.filter((type) => type !== option)
                    : [...filters.bodyTypes, option],
                })
              }
              isSelected={(option) => filters.bodyTypes.includes(option)}
            />

            <SexualOrientationField
              onSelect={(option) =>
                setFilters({
                  ...filters,
                  orientation: filters.orientation === option ? "" : option,
                })
              }
              isSelected={(option) => filters.orientation === option}
            />

            <PositionField
              onSelect={(option) =>
                setFilters({
                  ...filters,
                  position: filters.position.includes(option)
                    ? filters.position.filter((type) => type !== option)
                    : [...filters.position, option],
                })
              }
              isSelected={(option) => filters.position.includes(option)}
            />

            <EthnicityField
              onSelect={(option) =>
                setFilters({
                  ...filters,
                  ethnicity: filters.ethnicity.includes(option)
                    ? filters.ethnicity.filter((type) => type !== option)
                    : [...filters.ethnicity, option],
                })
              }
              isSelected={(option) => filters.ethnicity.includes(option)}
            />

            <LookingForField
              onSelect={(option) =>
                setFilters({
                  ...filters,
                  lookingFor: filters.lookingFor.includes(option)
                    ? filters.lookingFor.filter((type) => type !== option)
                    : [...filters.lookingFor, option],
                })
              }
              isSelected={(option) => filters.lookingFor.includes(option)}
            />
          </View>
        </View>
      </ScrollView>
      <View className="w-full flex-row gap-2 mb-safe">
        <Button variant="outline" className="flex-1" onPress={handleClear}>
          <Text className="text-base font-medium">Clear</Text>
        </Button>
        <Button className="flex-1" onPress={handleApply}>
          <Text className="text-base font-medium text-primary-foreground">
            Apply
          </Text>
        </Button>
      </View>
    </View>
  );
}

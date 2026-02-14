import { PreferenceRow } from "@/components/app/edit-profile/preference-row";
import { PreferenceSectionHeader } from "@/components/app/edit-profile/preference-section-header";
import { PreferenceSelectionSheet } from "@/components/app/edit-profile/preference-selection-sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  DATE_RANGES,
  EVENT_FILTERS_STORAGE_KEY,
  EVENT_TYPES,
  IMPERIAL_DISTANCES,
  METRIC_DISTANCES,
} from "@/constants/events";
import { api } from "@convex/_generated/api";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import { Calendar, ChevronLeft, MapPin, Tag } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";

export type EventFilterData = {
  eventType: string[];
  dateRange: string;
  distance: string;
};

export default function EventFilters() {
  const user = useQuery(api.users.currentUser);
  const measurementSystem = user?.measurementSystem ?? "imperial";
  const distances =
    measurementSystem === "metric"
      ? [...METRIC_DISTANCES]
      : [...IMPERIAL_DISTANCES];

  const defaultFilters: EventFilterData = {
    eventType: [],
    dateRange: "",
    distance: "",
  };

  const [filters, setFilters] = React.useState<EventFilterData>(defaultFilters);

  const eventTypeSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const dateRangeSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const distanceSheetRef = React.useRef<GorhomBottomSheetModal>(null);

  React.useEffect(() => {
    const loadFilters = async () => {
      try {
        const saved = await AsyncStorage.getItem(EVENT_FILTERS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setFilters({
            eventType: parsed.eventType ?? [],
            dateRange: parsed.dateRange ?? "",
            distance: parsed.distance ?? "",
          });
        }
      } catch (error) {
        console.error("Error loading event filters:", error);
      }
    };
    loadFilters();
  }, []);

  const handleClear = () => {
    setFilters(defaultFilters);
    AsyncStorage.setItem(
      EVENT_FILTERS_STORAGE_KEY,
      JSON.stringify(defaultFilters),
    );
  };

  const handleApply = async () => {
    try {
      await AsyncStorage.setItem(
        EVENT_FILTERS_STORAGE_KEY,
        JSON.stringify(filters),
      );
    } catch (error) {
      console.error("Error saving event filters:", error);
    }
    router.navigate("/(app)/(tabs)/events");
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
          {/* Header */}
          <View className="flex-row items-center justify-between px-1 py-6">
            <Pressable onPress={() => router.back()} className="size-6">
              <Icon as={ChevronLeft} size={24} className="text-white" />
            </Pressable>
            <Text className="text-xl font-medium text-white">
              Event Filters
            </Text>
            <View className="size-6" />
          </View>

          <View className="gap-4">
            {/* Event Type Section */}
            <View>
              <PreferenceSectionHeader icon={Tag} title="Event Type" />
              <View className="rounded-xl overflow-hidden">
                <PreferenceRow
                  label="Category"
                  values={
                    filters.eventType.length > 0 ? filters.eventType : undefined
                  }
                  onPress={() => eventTypeSheetRef.current?.present()}
                  isLast
                />
              </View>
            </View>

            {/* Date Section */}
            <View>
              <PreferenceSectionHeader icon={Calendar} title="Date" />
              <View className="rounded-xl overflow-hidden">
                <PreferenceRow
                  label="When"
                  values={filters.dateRange || undefined}
                  onPress={() => dateRangeSheetRef.current?.present()}
                  isLast
                />
              </View>
            </View>

            {/* Location Section */}
            <View>
              <PreferenceSectionHeader icon={MapPin} title="Location" />
              <View className="rounded-xl overflow-hidden">
                <PreferenceRow
                  label="Distance"
                  values={filters.distance || undefined}
                  onPress={() => distanceSheetRef.current?.present()}
                  isLast
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View className="w-full max-w-md self-center flex-row gap-2 px-4 pb-4 mb-safe">
        <Button variant="outline" className="flex-1" onPress={handleClear}>
          <Text className="text-base font-medium">Clear</Text>
        </Button>
        <Button className="flex-1" onPress={handleApply}>
          <Text className="text-base font-medium text-primary-foreground">
            Apply
          </Text>
        </Button>
      </View>

      {/* Selection Sheets */}
      <PreferenceSelectionSheet
        bottomSheetRef={eventTypeSheetRef}
        title="Event Category"
        options={[...EVENT_TYPES]}
        selectedValues={filters.eventType}
        multiSelect
        onSelect={(option) =>
          setFilters({
            ...filters,
            eventType: filters.eventType.includes(option)
              ? filters.eventType.filter((t) => t !== option)
              : [...filters.eventType, option],
          })
        }
      />

      <PreferenceSelectionSheet
        bottomSheetRef={dateRangeSheetRef}
        title="Date Range"
        options={[...DATE_RANGES]}
        selectedValues={filters.dateRange || undefined}
        onSelect={(option) =>
          setFilters({
            ...filters,
            dateRange: filters.dateRange === option ? "" : option,
          })
        }
      />

      <PreferenceSelectionSheet
        bottomSheetRef={distanceSheetRef}
        title="Distance"
        options={distances}
        selectedValues={filters.distance || undefined}
        onSelect={(option) =>
          setFilters({
            ...filters,
            distance: filters.distance === option ? "" : option,
          })
        }
      />
    </View>
  );
}

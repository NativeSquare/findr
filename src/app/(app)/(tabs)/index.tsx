import { FiltersBottomSheet } from "@/components/app/filters/filters-bottom-sheet";
import { NearestUsersGridItem } from "@/components/app/home/nearest-users-grid-item";
import { NearestUsersGridItemSkeleton } from "@/components/app/home/nearest-users-grid-item-skeleton";
import { SearchInput } from "@/components/custom/search-input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { usePresence } from "@convex-dev/presence/react-native";
import { api } from "@convex/_generated/api";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "convex/react";
import { Filter } from "lucide-react-native";
import React, { useMemo } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { FilterData } from "../filters";

const FILTERS_STORAGE_KEY = "filters";
const DEFAULT_MAX_DISTANCE = 10000; // meters (10km)
const DEFAULT_MIN_AGE = 25;
const DEFAULT_MAX_AGE = 70;

export default function Home() {
  const user = useQuery(api.users.currentUser);
  const filtersBottomSheetRef = React.useRef<BottomSheetModal>(null);
  const defaultFilters = {
    maxDistance: DEFAULT_MAX_DISTANCE,
    minAge: DEFAULT_MIN_AGE,
    maxAge: DEFAULT_MAX_AGE,
    lookingFor: [],
    orientation: "",
  };
  const [filters, setFilters] = React.useState<FilterData>(defaultFilters);

  const loadFilters = React.useCallback(async () => {
    try {
      const savedFilters = await AsyncStorage.getItem(FILTERS_STORAGE_KEY);
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        setFilters({
          maxDistance: parsed.maxDistance ?? DEFAULT_MAX_DISTANCE,
          minAge: parsed.minAge ?? DEFAULT_MIN_AGE,
          maxAge: parsed.maxAge ?? DEFAULT_MAX_AGE,
          lookingFor: parsed.lookingFor ?? [],
          orientation: parsed.orientation ?? "",
        });
      }
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  }, []);

  // Load filters on mount and when screen comes into focus
  React.useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useFocusEffect(
    React.useCallback(() => {
      loadFilters();
    }, [loadFilters])
  );

  // Check if filters are active (non-default)
  const hasActiveFilters = useMemo(() => {
    return (
      filters.maxDistance !== DEFAULT_MAX_DISTANCE ||
      filters.minAge !== DEFAULT_MIN_AGE ||
      filters.maxAge !== DEFAULT_MAX_AGE ||
      filters.lookingFor.length > 0 ||
      filters.orientation !== ""
    );
  }, [filters]);

  // Get active filter labels
  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];

    if (filters.maxDistance !== DEFAULT_MAX_DISTANCE) {
      labels.push(`${Math.round(filters.maxDistance / 1000)}km`);
    }

    if (
      filters.minAge !== DEFAULT_MIN_AGE ||
      filters.maxAge !== DEFAULT_MAX_AGE
    ) {
      labels.push(
        `${filters.minAge ?? DEFAULT_MIN_AGE}-${filters.maxAge ?? DEFAULT_MAX_AGE} years`
      );
    }

    if (filters.lookingFor.length > 0) {
      labels.push(...filters.lookingFor);
    }

    if (filters.orientation) {
      labels.push(filters.orientation);
    }

    return labels;
  }, [filters]);

  const handleClearAll = async () => {
    setFilters(defaultFilters);
    try {
      await AsyncStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify(defaultFilters)
      );
    } catch (error) {
      console.error("Error clearing filters:", error);
    }
  };

  if (!user?._id) return null;
  const presenceState = usePresence(api.presence, "public", user._id);
  const nearestUsers = useQuery(api.geospatial.getNearestUsers, {
    id: user._id,
    filters: filters,
  });

  const userRows = useMemo(() => {
    if (!nearestUsers) return [];
    const rows: (typeof nearestUsers)[] = [];
    const columnsPerRow = 2;
    for (let i = 0; i < nearestUsers.length; i += columnsPerRow) {
      rows.push(nearestUsers.slice(i, i + columnsPerRow));
    }
    return rows;
  }, [nearestUsers]);

  const screenWidth = Dimensions.get("window").width;
  const maxWidth = 384; // max-w-sm (384px)
  const containerWidth = Math.min(screenWidth, maxWidth);
  const padding = 32; // px-4 on each side (16px * 2)
  const gap = 6; // gap-1.5 (6px)
  const gapsTotal = (2 - 1) * gap; // 1 gap for 2 items
  const itemWidth = (containerWidth - padding - gapsTotal) / 2;

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive"
    >
      <View className="w-full max-w-sm gap-4">
        <View className="flex-row gap-2">
          <View className="flex-1">
            <SearchInput placeholder="Browse location" />
          </View>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="icon"
            onPress={() => filtersBottomSheetRef.current?.present()}
          >
            <Icon as={Filter} size={20} />
          </Button>
        </View>
        {hasActiveFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          >
            {activeFilterLabels.map((label, index) => (
              <View key={index} className="bg-white rounded-md px-3 py-1.5">
                <Text className="text-sm font-medium text-black">{label}</Text>
              </View>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onPress={handleClearAll}
              className="shrink-0"
            >
              <Text className="text-sm text-muted-foreground">Clear All</Text>
            </Button>
          </ScrollView>
        )}
        <Text className="text-lg font-medium">Who&apos;s nearby ?</Text>
        <View className="gap-1.5">
          {nearestUsers === undefined
            ? // Show skeleton loading state (3 rows, 2 items per row)
              Array.from({ length: 3 }).map((_, rowIndex) => (
                <View key={rowIndex} className="flex-row gap-1.5">
                  {Array.from({ length: 2 }).map((_, colIndex) => (
                    <View key={colIndex} style={{ width: itemWidth }}>
                      <NearestUsersGridItemSkeleton />
                    </View>
                  ))}
                </View>
              ))
            : userRows.map((row, rowIndex) => (
                <View key={rowIndex} className="flex-row gap-1.5">
                  {row.map((userItem, index) => (
                    <View key={index} style={{ width: itemWidth }}>
                      <NearestUsersGridItem
                        userItem={userItem}
                        presenceState={presenceState}
                      />
                    </View>
                  ))}
                </View>
              ))}
        </View>
      </View>
      <FiltersBottomSheet
        bottomSheetModalRef={filtersBottomSheetRef}
        filters={filters}
        setFilters={setFilters}
        defaultFilters={defaultFilters}
      />
    </ScrollView>
  );
}

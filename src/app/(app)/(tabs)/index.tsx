import { HomeFiltersRow } from "@/components/app/home/home-filters-row";
import { HomeHeader } from "@/components/app/home/home-header";
import { NearestUsersGridItem } from "@/components/app/home/nearest-users-grid-item";
import { NearestUsersGridItemSkeleton } from "@/components/app/home/nearest-users-grid-item-skeleton";
import { cmToFeetInches, kgToLbs } from "@/utils/measurements";
import { usePresence } from "@convex-dev/presence/react-native";
import { api } from "@convex/_generated/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { FilterData } from "../filters";
import { SEARCH_LOCATION_STORAGE_KEY } from "../location-search";

const FILTERS_STORAGE_KEY = "filters";

type SearchLocation = {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
};
const DEFAULT_MIN_AGE = 18;
const DEFAULT_MAX_AGE = 99;
const DEFAULT_MIN_HEIGHT = 120;
const DEFAULT_MAX_HEIGHT = 220;
const DEFAULT_MIN_WEIGHT = 40;
const DEFAULT_MAX_WEIGHT = 150;

export default function Home() {
  const user = useQuery(api.users.currentUser);
  const defaultFilters: FilterData = {
    minAge: DEFAULT_MIN_AGE,
    maxAge: DEFAULT_MAX_AGE,
    minHeight: DEFAULT_MIN_HEIGHT,
    maxHeight: DEFAULT_MAX_HEIGHT,
    minWeight: DEFAULT_MIN_WEIGHT,
    maxWeight: DEFAULT_MAX_WEIGHT,
    lookingFor: [],
    orientation: "",
    position: "",
    bodyType: "",
    ethnicity: "",
    relationshipStatus: "",
  };
  const [filters, setFilters] = React.useState<FilterData>(defaultFilters);
  const [searchLocation, setSearchLocation] =
    React.useState<SearchLocation | null>(null);

  const loadFilters = React.useCallback(async () => {
    try {
      const savedFilters = await AsyncStorage.getItem(FILTERS_STORAGE_KEY);
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        setFilters({
          minAge: parsed.minAge ?? DEFAULT_MIN_AGE,
          maxAge: parsed.maxAge ?? DEFAULT_MAX_AGE,
          minHeight: parsed.minHeight ?? DEFAULT_MIN_HEIGHT,
          maxHeight: parsed.maxHeight ?? DEFAULT_MAX_HEIGHT,
          minWeight: parsed.minWeight ?? DEFAULT_MIN_WEIGHT,
          maxWeight: parsed.maxWeight ?? DEFAULT_MAX_WEIGHT,
          lookingFor: parsed.lookingFor ?? [],
          orientation: parsed.orientation ?? "",
          position: parsed.position ?? "",
          bodyType: parsed.bodyType ?? "",
          ethnicity: parsed.ethnicity ?? "",
          relationshipStatus: parsed.relationshipStatus ?? "",
        });
      }
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  }, []);

  const loadSearchLocation = React.useCallback(async () => {
    try {
      const savedLocation = await AsyncStorage.getItem(
        SEARCH_LOCATION_STORAGE_KEY
      );
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        setSearchLocation(parsed);
      }
    } catch (error) {
      console.error("Error loading search location:", error);
    }
  }, []);

  // Load filters and location on mount and when screen comes into focus
  React.useEffect(() => {
    loadFilters();
    loadSearchLocation();
  }, [loadFilters, loadSearchLocation]);

  useFocusEffect(
    React.useCallback(() => {
      loadFilters();
      loadSearchLocation();
    }, [loadFilters, loadSearchLocation])
  );

  // Check if filters are active (non-default)
  const hasActiveFilters = useMemo(() => {
    return (
      filters.minAge !== DEFAULT_MIN_AGE ||
      filters.maxAge !== DEFAULT_MAX_AGE ||
      filters.minHeight !== DEFAULT_MIN_HEIGHT ||
      filters.maxHeight !== DEFAULT_MAX_HEIGHT ||
      filters.minWeight !== DEFAULT_MIN_WEIGHT ||
      filters.maxWeight !== DEFAULT_MAX_WEIGHT ||
      filters.lookingFor.length > 0 ||
      filters.orientation !== "" ||
      filters.position !== "" ||
      filters.bodyType !== "" ||
      filters.ethnicity !== "" ||
      filters.relationshipStatus !== ""
    );
  }, [filters]);

  // Get active filter labels
  const measurementSystem = user?.measurementSystem ?? "metric";
  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];

    if (
      filters.minAge !== DEFAULT_MIN_AGE ||
      filters.maxAge !== DEFAULT_MAX_AGE
    ) {
      labels.push(`${filters.minAge}-${filters.maxAge} yrs`);
    }

    if (
      filters.minHeight !== DEFAULT_MIN_HEIGHT ||
      filters.maxHeight !== DEFAULT_MAX_HEIGHT
    ) {
      const minH = filters.minHeight ?? DEFAULT_MIN_HEIGHT;
      const maxH = filters.maxHeight ?? DEFAULT_MAX_HEIGHT;
      if (measurementSystem === "imperial") {
        const minFt = cmToFeetInches(minH);
        const maxFt = cmToFeetInches(maxH);
        labels.push(`${minFt.feet}'${minFt.inches}"-${maxFt.feet}'${maxFt.inches}"`);
      } else {
        labels.push(`${minH}-${maxH}cm`);
      }
    }

    if (
      filters.minWeight !== DEFAULT_MIN_WEIGHT ||
      filters.maxWeight !== DEFAULT_MAX_WEIGHT
    ) {
      const minW = filters.minWeight ?? DEFAULT_MIN_WEIGHT;
      const maxW = filters.maxWeight ?? DEFAULT_MAX_WEIGHT;
      if (measurementSystem === "imperial") {
        labels.push(`${kgToLbs(minW)}-${kgToLbs(maxW)}lbs`);
      } else {
        labels.push(`${minW}-${maxW}kg`);
      }
    }

    if (filters.lookingFor.length > 0) {
      labels.push(...filters.lookingFor);
    }

    if (filters.orientation) {
      labels.push(filters.orientation);
    }

    if (filters.position) {
      labels.push(filters.position);
    }

    if (filters.bodyType) {
      labels.push(filters.bodyType);
    }

    if (filters.ethnicity) {
      labels.push(filters.ethnicity);
    }

    if (filters.relationshipStatus) {
      labels.push(filters.relationshipStatus);
    }

    return labels;
  }, [filters, measurementSystem]);

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

  // Build filters object with only non-default values
  const activeFiltersForQuery = useMemo(() => {
    const result: Partial<FilterData> = {};

    if (filters.minAge !== DEFAULT_MIN_AGE) result.minAge = filters.minAge;
    if (filters.maxAge !== DEFAULT_MAX_AGE) result.maxAge = filters.maxAge;
    if (filters.minHeight !== DEFAULT_MIN_HEIGHT)
      result.minHeight = filters.minHeight;
    if (filters.maxHeight !== DEFAULT_MAX_HEIGHT)
      result.maxHeight = filters.maxHeight;
    if (filters.minWeight !== DEFAULT_MIN_WEIGHT)
      result.minWeight = filters.minWeight;
    if (filters.maxWeight !== DEFAULT_MAX_WEIGHT)
      result.maxWeight = filters.maxWeight;
    if (filters.lookingFor.length > 0) result.lookingFor = filters.lookingFor;
    if (filters.orientation) result.orientation = filters.orientation;
    if (filters.position) result.position = filters.position;
    if (filters.bodyType) result.bodyType = filters.bodyType;
    if (filters.ethnicity) result.ethnicity = filters.ethnicity;
    if (filters.relationshipStatus)
      result.relationshipStatus = filters.relationshipStatus;

    return Object.keys(result).length > 0 ? result : undefined;
  }, [filters]);

  if (!user?._id) return null;
  const presenceState = usePresence(api.presence, "public", user._id);
  const nearestUsers = useQuery(api.geospatial.getNearestUsers, {
    id: user._id,
    filters: activeFiltersForQuery,
    customLocation: searchLocation
      ? {
          latitude: searchLocation.latitude,
          longitude: searchLocation.longitude,
        }
      : undefined,
  });

  const userRows = useMemo(() => {
    if (!nearestUsers) return [];
    const rows: (typeof nearestUsers)[] = [];
    const columnsPerRow = 3;
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
  const gapsTotal = (3 - 1) * gap; // 2 gaps for 3 items
  const itemWidth = (containerWidth - padding - gapsTotal) / 3;

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive"
    >
      <View className="w-full max-w-sm gap-4">
        <HomeHeader user={user} searchLocation={searchLocation} />
        <HomeFiltersRow
          hasActiveFilters={hasActiveFilters}
          activeFilterLabels={activeFilterLabels}
          onFilterPress={() => router.push("/filters")}
          onClearAll={handleClearAll}
        />
        <View className="gap-1.5">
          {nearestUsers === undefined
            ? // Show skeleton loading state (3 rows, 3 items per row)
              Array.from({ length: 3 }).map((_, rowIndex) => (
                <View key={rowIndex} className="flex-row gap-1.5">
                  {Array.from({ length: 3 }).map((_, colIndex) => (
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
    </ScrollView>
  );
}

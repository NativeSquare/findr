import { NearestUsersGridItem } from "@/components/app/home/nearest-users-grid-item";
import { SearchInput } from "@/components/custom/search-input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { usePresence } from "@convex-dev/presence/react-native";
import { api } from "@convex/_generated/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import { Filter } from "lucide-react-native";
import React, { useMemo } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { FilterData } from "../filters";

const FILTERS_STORAGE_KEY = "filters";
const DEFAULT_MAX_DISTANCE = 10000; // meters (10km)

export default function Home() {
  const user = useQuery(api.users.currentUser);
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
            variant="outline"
            size="icon"
            onPress={() => router.push("/filters")}
          >
            <Icon as={Filter} size={20} />
          </Button>
        </View>
        <Text className="text-lg font-medium">Who&apos;s nearby ?</Text>
        <View className="gap-1.5">
          {userRows.map((row, rowIndex) => (
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

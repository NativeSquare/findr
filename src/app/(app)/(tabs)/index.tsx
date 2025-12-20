import { NearestUsersGridItem } from "@/components/app/home/nearest-users-grid-item";
import { SearchInput } from "@/components/custom/search-input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { usePresence } from "@convex-dev/presence/react-native";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Filter } from "lucide-react-native";
import { useMemo } from "react";
import { Dimensions, ScrollView, View } from "react-native";

export default function Home() {
  const user = useQuery(api.users.currentUser);
  if (!user?._id) return null;
  const presenceState = usePresence(api.presence, "public", user._id);
  const nearestUsers = useQuery(api.geospatial.getNearestUsers, {
    id: user._id,
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
        <View className="flex-row gap-2">
          <View className="flex-1">
            <SearchInput placeholder="Browse location" />
          </View>
          <Button variant="outline" size="icon">
            <Icon as={Filter} size={20} />
          </Button>
        </View>
        <Text className="text-lg font-medium">Nearest Users</Text>
        <View className="gap-1.5">
          {userRows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-1.5">
              {row.map((userItem) => (
                <View key={userItem.key} style={{ width: itemWidth }}>
                  <NearestUsersGridItem
                    userId={userItem.key}
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

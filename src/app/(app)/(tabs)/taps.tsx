import { SearchInput } from "@/components/custom/search-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import { Eye } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabType = "Taps" | "Views" | "Favorites";

export default function Taps() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("Taps");
  const [searchQuery, setSearchQuery] = useState("");
  const taps = useQuery(api.taps.getTapsForUser);
  const views = useQuery(api.views.getViewsForUser);
  const favorites = useQuery(api.users.getFavorites);

  const filteredTaps = React.useMemo(() => {
    if (!taps) return [];
    if (!searchQuery.trim()) return taps;

    const query = searchQuery.toLowerCase();
    return taps.filter(
      (tap) =>
        tap.fromUser?.name?.toLowerCase().includes(query) ||
        tap.emoji.includes(query)
    );
  }, [taps, searchQuery]);

  const filteredViews = React.useMemo(() => {
    if (!views) return [];
    if (!searchQuery.trim()) return views;

    const query = searchQuery.toLowerCase();
    return views.filter((view) =>
      view.fromUser?.name?.toLowerCase().includes(query)
    );
  }, [views, searchQuery]);

  const filteredFavorites = React.useMemo(() => {
    if (!favorites) return [];
    if (!searchQuery.trim()) return favorites;

    const query = searchQuery.toLowerCase();
    return favorites.filter((favorite) =>
      favorite.name?.toLowerCase().includes(query)
    );
  }, [favorites, searchQuery]);

  const tabs: TabType[] = ["Taps", "Views", "Favorites"];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View className="px-5 pt-4" style={{ paddingTop: insets.top + 16 }}>
          {/* Header */}
          <Text className="text-xl font-medium leading-[30px] text-white mb-5">
            Taps
          </Text>

          {/* Tabs */}
          <View className="flex-row mb-5">
            {tabs.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className="flex-1 items-center justify-center rounded-md"
              >
                <View className="py-3 px-4">
                  <Text
                    className={`text-sm font-medium leading-5 ${
                      activeTab === tab ? "text-[#e56400]" : "text-[#70707b]"
                    }`}
                  >
                    {tab}
                  </Text>
                </View>
                <View
                  className={`h-[2px] w-full ${
                    activeTab === tab ? "bg-[#e56400]" : "bg-[#26272b]"
                  }`}
                />
              </Pressable>
            ))}
          </View>

          {/* Search Bar */}
          <View className="mb-5">
            <SearchInput
              placeholder={
                activeTab === "Favorites"
                  ? "Search Favorites"
                  : activeTab === "Views"
                    ? "Search views"
                    : "Search taps"
              }
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="bg-[#131316] border-[#1a1a1e] h-10 rounded-full"
            />
          </View>

          {/* Taps List */}
          {activeTab === "Taps" && (
            <View className="gap-0">
              {filteredTaps.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-muted-foreground">
                    {taps === undefined
                      ? "Loading..."
                      : searchQuery
                        ? "No taps found"
                        : "No taps yet"}
                  </Text>
                </View>
              ) : (
                filteredTaps.map((tap, index) => {
                  const isFirst = index === 0;
                  const isLast = index === filteredTaps.length - 1;
                  const borderRadius = {
                    ...(isFirst && {
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                    }),
                    ...(isLast && {
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                    }),
                  };

                  return (
                    <Pressable
                      key={tap._id}
                      onPress={() => router.push(`/user/${tap.fromUser?._id}`)}
                      className="bg-card border border-border flex-row gap-3 items-start p-4 active:opacity-80"
                      style={borderRadius}
                    >
                      <Avatar
                        className="size-10 rounded-full shrink-0"
                        alt={tap.fromUser?.name ?? "Unknown User"}
                      >
                        <AvatarImage
                          source={{ uri: tap.fromUser?.image ?? undefined }}
                        />
                        <AvatarFallback className="bg-secondary rounded-full">
                          <Text className="text-muted-foreground">
                            {tap.fromUser?.name?.[0]?.toUpperCase() ?? "?"}
                          </Text>
                        </AvatarFallback>
                      </Avatar>
                      <View className="flex-1 gap-0.5">
                        <Text className="text-sm font-medium text-white">
                          {tap.fromUser?.name ?? "Unknown User"}
                        </Text>
                        <Text className="text-xs leading-[18px] text-card-foreground">
                          sent you a tap
                        </Text>
                      </View>
                      <View className="items-end gap-1 shrink-0">
                        <Text className="text-xs leading-[18px] text-muted-foreground">
                          {formatRelativeTime(tap._creationTime)}
                        </Text>
                        <View className="size-6 items-center justify-center">
                          <Text className="text-base">{tap.emoji}</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>
          )}

          {activeTab === "Views" && (
            <View className="gap-0">
              {filteredViews.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-muted-foreground">
                    {views === undefined
                      ? "Loading..."
                      : searchQuery
                        ? "No views found"
                        : "No views yet"}
                  </Text>
                </View>
              ) : (
                filteredViews.map((view, index) => {
                  const isFirst = index === 0;
                  const isLast = index === filteredViews.length - 1;
                  const borderRadius = {
                    ...(isFirst && {
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                    }),
                    ...(isLast && {
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                    }),
                  };

                  return (
                    <Pressable
                      key={view._id}
                      onPress={() => router.push(`/user/${view.fromUser?._id}`)}
                      className="bg-card border border-border flex-row gap-3 items-start p-4 active:opacity-80"
                      style={borderRadius}
                    >
                      <Avatar
                        className="size-10 rounded-full shrink-0"
                        alt={view.fromUser?.name ?? "Unknown User"}
                      >
                        <AvatarImage
                          source={{ uri: view.fromUser?.image ?? undefined }}
                        />
                        <AvatarFallback className="bg-secondary rounded-full">
                          <Text className="text-muted-foreground">
                            {view.fromUser?.name?.[0]?.toUpperCase() ?? "?"}
                          </Text>
                        </AvatarFallback>
                      </Avatar>
                      <View className="flex-1 gap-0.5">
                        <Text className="text-sm font-medium text-white">
                          {view.fromUser?.name ?? "Unknown User"}
                        </Text>
                        <Text className="text-xs leading-[18px] text-card-foreground">
                          Has viewed your profile
                        </Text>
                      </View>
                      <View className="items-end gap-1 shrink-0">
                        <Text className="text-xs leading-[18px] text-muted-foreground">
                          {formatRelativeTime(view._creationTime)}
                        </Text>
                        <View className="size-6 items-center justify-center">
                          <Icon
                            as={Eye}
                            size={16}
                            className="text-muted-foreground"
                          />
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>
          )}

          {activeTab === "Favorites" && (
            <View className="gap-0">
              {filteredFavorites.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-muted-foreground">
                    {favorites === undefined
                      ? "Loading..."
                      : searchQuery
                        ? "No favorites found"
                        : "No favorites yet"}
                  </Text>
                </View>
              ) : (
                filteredFavorites.map((favorite, index) => {
                  const isFirst = index === 0;
                  const isLast = index === filteredFavorites.length - 1;
                  const borderRadius = {
                    ...(isFirst && {
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                    }),
                    ...(isLast && {
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                    }),
                  };

                  return (
                    <Pressable
                      key={favorite._id}
                      onPress={() => router.push(`/user/${favorite._id}`)}
                      className="bg-card border border-border flex-row gap-3 items-start p-4 active:opacity-80"
                      style={borderRadius}
                    >
                      <Avatar
                        className="size-10 rounded-full shrink-0"
                        alt={favorite.name ?? "Unknown User"}
                      >
                        <AvatarImage source={{ uri: favorite.image }} />
                        <AvatarFallback className="bg-secondary rounded-full">
                          <Text className="text-muted-foreground">
                            {favorite.name?.[0]?.toUpperCase() ?? "?"}
                          </Text>
                        </AvatarFallback>
                      </Avatar>
                      <View className="flex-1 gap-0.5">
                        <Text className="text-sm font-medium text-white">
                          {favorite.name ?? "Unknown User"}
                        </Text>
                        <Text className="text-xs leading-[18px] text-card-foreground">
                          in your favorites list
                        </Text>
                      </View>
                      <View className="items-end gap-1 shrink-0">
                        <View className="size-6 items-center justify-center">
                          <Text className="text-base">❤️</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

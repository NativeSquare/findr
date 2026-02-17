import { StoriesGrid } from "@/components/app/taps/stories-grid";
import { SearchInput } from "@/components/custom/search-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Eye, Heart } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabType = "Taps" | "Views" | "Stories" | "Story Likes";

const VALID_TABS: TabType[] = ["Taps", "Views", "Stories", "Story Likes"];

export default function Taps() {
  const insets = useSafeAreaInsets();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("Taps");

  // Sync the tab search param to the active tab state
  React.useEffect(() => {
    if (tab && VALID_TABS.includes(tab as TabType)) {
      setActiveTab(tab as TabType);
    }
  }, [tab]);
  const [searchQuery, setSearchQuery] = useState("");
  const taps = useQuery(api.taps.getTapsForUser);
  const views = useQuery(api.views.getViewsForUser);
  const storyLikes = useQuery(api.storyLikes.getStoryLikesForUser);
  const currentUser = useQuery(api.users.currentUser);

  const filteredTaps = React.useMemo(() => {
    if (!taps) return [];
    if (!searchQuery.trim()) return taps;

    const query = searchQuery.toLowerCase();
    return taps.filter(
      (tap) =>
        tap.fromUser?.name?.toLowerCase().includes(query) ||
        tap.emoji.includes(query),
    );
  }, [taps, searchQuery]);

  const filteredViews = React.useMemo(() => {
    if (!views) return [];
    if (!searchQuery.trim()) return views;

    const query = searchQuery.toLowerCase();
    return views.filter((view) =>
      view.fromUser?.name?.toLowerCase().includes(query),
    );
  }, [views, searchQuery]);

  const filteredStoryLikes = React.useMemo(() => {
    if (!storyLikes) return [];
    if (!searchQuery.trim()) return storyLikes;

    const query = searchQuery.toLowerCase();
    return storyLikes.filter((like) =>
      like.fromUser?.name?.toLowerCase().includes(query),
    );
  }, [storyLikes, searchQuery]);

  const tabs: TabType[] = ["Taps", "Views", "Stories", "Story Likes"];

  const searchPlaceholder =
    activeTab === "Stories"
      ? "Search stories"
      : activeTab === "Story Likes"
        ? "Search story likes"
        : activeTab === "Views"
          ? "Search views"
          : "Search taps";

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
                <View className="py-3 px-2">
                  <Text
                    className={`text-sm font-medium leading-5 ${
                      activeTab === tab ? "text-[#e56400]" : "text-[#70707b]"
                    }`}
                    numberOfLines={1}
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

          {/* Search Bar (not shown for Stories tab) */}
          {activeTab !== "Stories" && (
            <View className="mb-5">
              <SearchInput
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="bg-[#131316] border-[#1a1a1e] h-10 rounded-full"
              />
            </View>
          )}

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

          {/* Views List */}
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

          {/* Stories Grid */}
          {activeTab === "Stories" && currentUser && (
            <StoriesGrid user={currentUser} />
          )}

          {/* Story Likes List */}
          {activeTab === "Story Likes" && (
            <View className="gap-0">
              {filteredStoryLikes.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-muted-foreground">
                    {storyLikes === undefined
                      ? "Loading..."
                      : searchQuery
                        ? "No story likes found"
                        : "No story likes yet"}
                  </Text>
                </View>
              ) : (
                filteredStoryLikes.map((like, index) => {
                  const isFirst = index === 0;
                  const isLast = index === filteredStoryLikes.length - 1;
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
                      key={like._id}
                      onPress={() => router.push(`/user/${like.fromUser?._id}`)}
                      className="bg-card border border-border flex-row gap-3 items-center p-4 active:opacity-80"
                      style={borderRadius}
                    >
                      <Avatar
                        className="size-10 rounded-full shrink-0"
                        alt={like.fromUser?.name ?? "Unknown User"}
                      >
                        <AvatarImage
                          source={{ uri: like.fromUser?.image ?? undefined }}
                        />
                        <AvatarFallback className="bg-secondary rounded-full">
                          <Text className="text-muted-foreground">
                            {like.fromUser?.name?.[0]?.toUpperCase() ?? "?"}
                          </Text>
                        </AvatarFallback>
                      </Avatar>
                      <View className="flex-1 gap-0.5">
                        <Text className="text-sm font-medium text-white">
                          {like.fromUser?.name ?? "Unknown User"}
                        </Text>
                        <Text className="text-xs leading-[18px] text-card-foreground">
                          liked your story
                        </Text>
                        <Text className="text-xs leading-[18px] text-muted-foreground">
                          {formatRelativeTime(like._creationTime)}
                        </Text>
                      </View>
                      {like.storyImageUrl ? (
                        <View className="size-12 shrink-0 overflow-hidden rounded-lg border border-border">
                          <Image
                            source={{ uri: like.storyImageUrl }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                            transition={200}
                          />
                          <View className="absolute bottom-0.5 right-0.5">
                            <Icon
                              as={Heart}
                              size={12}
                              className="text-[#e56400]"
                            />
                          </View>
                        </View>
                      ) : (
                        <View className="size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary">
                          <Icon
                            as={Heart}
                            size={16}
                            className="text-[#e56400]"
                          />
                        </View>
                      )}
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

import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { SearchInput } from "@/components/custom/search-input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { useQuery } from "convex/react";
import { ArrowLeft, Check, X } from "lucide-react-native";
import * as React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type AppAlbum = {
  _id: Id<"albums">;
  title: string;
  photoCount: number;
  coverPhotoUrl?: string;
  thumbnailUrls: string[];
};

// Duration options in milliseconds
const DURATION_OPTIONS = [
  { label: "1 hour", value: 1 * 60 * 60 * 1000 },
  { label: "24 hours", value: 24 * 60 * 60 * 1000 },
  { label: "7 days", value: 7 * 24 * 60 * 60 * 1000 },
  { label: "30 days", value: 30 * 24 * 60 * 60 * 1000 },
];

type ModalStep = "select-album" | "select-duration";

interface SelectAlbumModalProps {
  bottomSheetModalRef: React.RefObject<GorhomBottomSheetModal | null>;
  onAlbumSelected: (album: AppAlbum, durationMs: number) => void;
}

export function SelectAlbumModal({
  bottomSheetModalRef,
  onAlbumSelected,
}: SelectAlbumModalProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = React.useState<ModalStep>("select-album");
  const [selectedAlbumId, setSelectedAlbumId] =
    React.useState<Id<"albums"> | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch albums from Convex
  const albums = useQuery(api.albums.getAlbums);

  // Get selected album for display
  const selectedAlbum = React.useMemo(() => {
    if (!selectedAlbumId || !albums) return null;
    return albums.find((a) => a._id === selectedAlbumId) || null;
  }, [selectedAlbumId, albums]);

  // Filter albums based on search query
  const filteredAlbums = React.useMemo(() => {
    if (!albums) return [];
    if (searchQuery.trim() === "") return albums;

    const query = searchQuery.toLowerCase();
    return albums.filter((album) => album.title.toLowerCase().includes(query));
  }, [albums, searchQuery]);

  const handleAlbumPress = (albumId: Id<"albums">) => {
    setSelectedAlbumId(selectedAlbumId === albumId ? null : albumId);
  };

  const handleNext = () => {
    if (!selectedAlbumId) return;
    setStep("select-duration");
  };

  const handleBack = () => {
    setStep("select-album");
  };

  const handleDurationSelect = (durationMs: number) => {
    if (!selectedAlbum) return;

    onAlbumSelected(selectedAlbum, durationMs);
    bottomSheetModalRef.current?.dismiss();
    // Reset state
    setSelectedAlbumId(null);
    setSearchQuery("");
    setStep("select-album");
  };

  const handleClose = () => {
    bottomSheetModalRef.current?.dismiss();
    setSelectedAlbumId(null);
    setSearchQuery("");
    setStep("select-album");
  };

  const screenWidth = Dimensions.get("window").width;
  const padding = 20;
  const gap = 12;
  const itemWidth = (screenWidth - padding * 2 - gap) / 2;

  const renderAlbumItem = ({ item }: { item: AppAlbum }) => {
    const isSelected = selectedAlbumId === item._id;

    return (
      <Pressable
        onPress={() => handleAlbumPress(item._id)}
        style={{ width: itemWidth }}
        className="bg-[#1a1a1e] border border-[#26272b] rounded-xl p-2 active:opacity-70"
      >
        <View className="flex-col gap-2 relative">
          {/* Selection checkbox */}
          {isSelected && (
            <View className="absolute top-[-6px] right-[-6px] z-10 bg-[#e56400] rounded-full size-4 items-center justify-center">
              <Icon as={Check} size={12} className="text-black" />
            </View>
          )}
          {!isSelected && (
            <View className="absolute top-[-6px] right-[-6px] z-10 bg-[#131316] border border-[#1a1a1e] rounded-full size-4" />
          )}

          {/* Cover photo section */}
          <View className="flex-col gap-1">
            {/* Main cover photo */}
            <View className="bg-[#26272b] rounded-md h-[120px] w-full overflow-hidden">
              {item.coverPhotoUrl ? (
                <Image
                  source={{ uri: item.coverPhotoUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-[#70707b] text-xs">No photos</Text>
                </View>
              )}
            </View>
            {/* Thumbnail row */}
            <View className="flex-row gap-1">
              {[0, 1, 2].map((index) => {
                const thumbnailUrl = item.thumbnailUrls[index];
                return (
                  <View
                    key={index}
                    className="bg-[#26272b] rounded-md h-[50px] flex-1 overflow-hidden"
                  >
                    {thumbnailUrl ? (
                      <Image
                        source={{ uri: thumbnailUrl }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="flex-1" />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
          {/* Title and photo count */}
          <View className="flex-row items-center justify-between">
            <Text
              className="text-sm font-medium text-white flex-1"
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text className="text-xs leading-[18px] text-[#d1d1d6]">
              {item.photoCount}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <BottomSheetModal ref={bottomSheetModalRef} snapPoints={["90%"]}>
      <View className="flex-1">
          {step === "select-album" ? (
            <>
              {/* Header - Album Selection */}
              <View className="flex-row items-center justify-between px-5 py-2 border-b border-[#26272b]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onPress={handleClose}
                >
                  <Icon as={X} size={24} className="text-white" />
                </Button>
                <Text className="text-xl font-medium leading-[30px] text-white">
                  Albums
                </Text>
                <Button
                  variant="ghost"
                  onPress={handleNext}
                  disabled={!selectedAlbumId}
                  className={selectedAlbumId ? "" : "opacity-50"}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedAlbumId ? "text-white" : "text-[#70707b]"
                    }`}
                  >
                    Next
                  </Text>
                </Button>
              </View>

              {/* Search bar */}
              <View className="px-5 pt-5 pb-4">
                <SearchInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search Album"
                />
              </View>

              {/* Albums list */}
              {albums === undefined ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color="#e56400" />
                </View>
              ) : filteredAlbums.length === 0 ? (
                <View className="flex-1 items-center justify-center px-5">
                  <Text className="text-[#d1d1d6] text-center">
                    {searchQuery ? "No albums found" : "No albums available"}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredAlbums}
                  renderItem={renderAlbumItem}
                  keyExtractor={(item) => item._id}
                  numColumns={2}
                  contentContainerStyle={{
                    padding: padding,
                    paddingBottom: insets.bottom + 20,
                    gap: gap,
                  }}
                  columnWrapperStyle={{ gap: gap }}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </>
          ) : (
            <>
              {/* Header - Duration Selection */}
              <View className="flex-row items-center justify-between px-5 py-2 border-b border-[#26272b]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onPress={handleBack}
                >
                  <Icon as={ArrowLeft} size={24} className="text-white" />
                </Button>
                <Text className="text-xl font-medium leading-[30px] text-white">
                  Share Duration
                </Text>
                <View className="size-6" />
              </View>

              {/* Selected album preview */}
              {selectedAlbum && (
                <View className="px-5 pt-5 pb-4">
                  <View className="bg-[#1a1a1e] border border-[#26272b] rounded-xl p-3 flex-row items-center gap-3">
                    <View className="bg-[#26272b] rounded-md h-[60px] w-[60px] overflow-hidden">
                      {selectedAlbum.coverPhotoUrl ? (
                        <Image
                          source={{ uri: selectedAlbum.coverPhotoUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Text className="text-[#70707b] text-xs">No photos</Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-white" numberOfLines={1}>
                        {selectedAlbum.title}
                      </Text>
                      <Text className="text-sm text-[#70707b]">
                        {selectedAlbum.photoCount} photos
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Duration options */}
              <View className="px-5 pt-2">
                <Text className="text-sm text-[#70707b] mb-4">
                  How long should the recipient have access to this album?
                </Text>
                <View className="gap-3">
                  {DURATION_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => handleDurationSelect(option.value)}
                      className="bg-[#1a1a1e] border border-[#26272b] rounded-xl px-4 py-4 active:opacity-70"
                    >
                      <Text className="text-base font-medium text-white text-center">
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
    </BottomSheetModal>
  );
}

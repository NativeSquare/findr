import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetModal as GorhomBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useQuery } from "convex/react";
import { Check, Search, X } from "lucide-react-native";
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

interface SelectAlbumModalProps {
  bottomSheetModalRef: React.RefObject<GorhomBottomSheetModal | null>;
  onAlbumSelected: (album: AppAlbum) => void;
}

export function SelectAlbumModal({
  bottomSheetModalRef,
  onAlbumSelected,
}: SelectAlbumModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedAlbumId, setSelectedAlbumId] =
    React.useState<Id<"albums"> | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch albums from Convex
  const albums = useQuery(api.albums.getAlbums);

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

  const handleSend = () => {
    if (!selectedAlbumId || !albums) return;

    const selectedAlbum = albums.find((a) => a._id === selectedAlbumId);
    if (selectedAlbum) {
      onAlbumSelected(selectedAlbum);
      bottomSheetModalRef.current?.dismiss();
      setSelectedAlbumId(null);
      setSearchQuery("");
    }
  };

  const handleClose = () => {
    bottomSheetModalRef.current?.dismiss();
    setSelectedAlbumId(null);
    setSearchQuery("");
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

  const snapPoints = React.useMemo(() => ["90%"], []);

  return (
    <GorhomBottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: "#000000" }}
      handleIndicatorStyle={{
        backgroundColor: "#26272b",
        width: 40,
        height: 6,
      }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      )}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
          {/* Header */}
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
              onPress={handleSend}
              disabled={!selectedAlbumId}
              className={selectedAlbumId ? "" : "opacity-50"}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedAlbumId ? "text-white" : "text-[#70707b]"
                }`}
              >
                Send
              </Text>
            </Button>
          </View>

          {/* Search bar */}
          <View className="px-5 pt-5 pb-4">
            <View className="bg-[#131316] border border-[#1a1a1e] rounded-full px-3.5 py-2.5 flex-row items-center gap-2">
              <Icon as={Search} size={20} className="text-[#70707b]" />
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search Album"
                placeholderTextColor="#70707b"
                className="flex-1 text-sm text-white border-0 bg-transparent placeholder:text-[#70707b]"
              />
            </View>
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
        </View>
      </BottomSheetView>
    </GorhomBottomSheetModal>
  );
}

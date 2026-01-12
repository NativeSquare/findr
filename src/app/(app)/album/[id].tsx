import { AlbumPhotoItem } from "@/components/app/album/album-photo-item";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { getConvexErrorMessage } from "@/utils/getConvexErrorMessage";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Image as ImageIcon, Plus } from "lucide-react-native";
import { useRef, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AlbumDetail() {
  const { id } = useLocalSearchParams<{ id: Id<"albums"> }>();
  const insets = useSafeAreaInsets();
  const album = useQuery(api.albums.getAlbum, { albumId: id });
  const uploadMediaBottomSheetRef = useRef<GorhomBottomSheetModal>(null);
  const addPhotoToAlbum = useMutation(api.albums.addPhotoToAlbum);
  const deletePhotoFromAlbum = useMutation(api.albums.deletePhotoFromAlbum);
  const setCoverPhoto = useMutation(api.albums.setCoverPhoto);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<
    Set<Id<"albumPhotos">>
  >(new Set());

  const handleImageSelected = async (imageUri: string) => {
    if (!id || isUploading) return;

    setIsUploading(true);
    try {
      await addPhotoToAlbum({
        albumId: id,
        photoUrl: imageUri,
      });
    } catch (error) {
      console.error(
        "Failed to add photo to album:",
        getConvexErrorMessage(error)
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddPhotoPress = () => {
    uploadMediaBottomSheetRef.current?.present();
  };

  const handleLongPress = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setSelectedPhotoIds(new Set());
  };

  const handleSelectPhoto = (photoId: Id<"albumPhotos">) => {
    setSelectedPhotoIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const handleSetAsCover = async () => {
    if (selectedPhotoIds.size !== 1 || !id) return;

    const photoId = Array.from(selectedPhotoIds)[0];
    try {
      await setCoverPhoto({
        albumId: id,
        photoId,
      });
      handleCancelEdit();
    } catch (error) {
      console.error("Failed to set cover photo:", getConvexErrorMessage(error));
    }
  };

  const handleRemovePhotos = async () => {
    if (selectedPhotoIds.size === 0 || !id) return;

    try {
      await Promise.all(
        Array.from(selectedPhotoIds).map((photoId) =>
          deletePhotoFromAlbum({ photoId })
        )
      );
      handleCancelEdit();
    } catch (error) {
      console.error("Failed to remove photos:", getConvexErrorMessage(error));
    }
  };

  const selectedCount = selectedPhotoIds.size;
  const canSetCover = selectedCount === 1;

  if (!album) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View
        className="px-5 pt-4 flex-row items-center justify-between"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Pressable
          onPress={isEditMode ? handleCancelEdit : () => router.back()}
          className="h-6 w-6 items-center justify-center"
        >
          <Icon as={ArrowLeft} size={24} className="text-white" />
        </Pressable>
        <Text className="text-xl font-medium leading-[30px] text-white">
          {isEditMode ? "Edit Album" : "Album"}
        </Text>
        {isEditMode ? (
          <View className="h-6 w-6" />
        ) : (
          <Pressable
            onPress={handleAddPhotoPress}
            className="h-6 w-6 items-center justify-center"
            disabled={isUploading}
          >
            <Icon as={Plus} size={24} className="text-white" />
          </Pressable>
        )}
      </View>

      {/* Album Info */}
      <View className="px-5 pt-5 gap-5">
        <View className="flex-row items-center gap-3">
          <View className="bg-[#1a1a1e] rounded-xl h-[100px] w-[100px] items-center justify-center overflow-hidden">
            {album.coverPhotoId ? (
              <Image
                source={{
                  uri: album.photos.find((p) => p._id === album.coverPhotoId)
                    ?.photoUrl,
                }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Icon as={ImageIcon} size={24} className="text-[#a0a0ab]" />
            )}
          </View>
          <View className="flex-col gap-0.5">
            <Text className="text-lg font-medium leading-[28px] text-white">
              {album.title}
            </Text>
            <Text className="text-xs leading-[18px] text-[#a0a0ab]">
              {album.photoCount} Photos
            </Text>
          </View>
        </View>
        <View className="h-px bg-[#26272b]" />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {album.photoCount === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="h-[52px] w-[52px] items-center justify-center mb-3">
              <Icon as={ImageIcon} size={52} className="text-[#d1d1d6]" />
            </View>
            <Text className="text-sm leading-5 text-[#d1d1d6]">No photos</Text>
          </View>
        ) : (
          <View className="px-5 pt-5">
            <View className="gap-1.5">
              {Array.from({ length: Math.ceil(album.photos.length / 3) }).map(
                (_, rowIndex) => (
                  <View key={rowIndex} className="flex-row gap-1.5">
                    {album.photos
                      .slice(rowIndex * 3, rowIndex * 3 + 3)
                      .map((photo) => (
                        <AlbumPhotoItem
                          key={photo._id}
                          photoId={photo._id}
                          photoUrl={photo.photoUrl}
                          isSelected={selectedPhotoIds.has(photo._id)}
                          isEditMode={isEditMode}
                          onPress={() => {
                            // Handle photo press (e.g., open full screen)
                          }}
                          onLongPress={handleLongPress}
                          onSelect={handleSelectPhoto}
                        />
                      ))}
                  </View>
                )
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Edit Mode Action Buttons */}
      {isEditMode && (
        <View
          className="px-5 pb-5 bg-black border-t border-[#26272b]"
          style={{ paddingBottom: insets.bottom + 20 }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xs leading-[18px] text-white">
              {selectedCount} {selectedCount === 1 ? "Selected" : "Selected"}
            </Text>
            <Pressable onPress={handleCancelEdit}>
              <Text className="text-xs leading-[18px] text-white">Cancel</Text>
            </Pressable>
          </View>
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 border border-[#f04438] rounded-full px-5 py-3"
              onPress={handleRemovePhotos}
              disabled={selectedCount === 0}
            >
              <Text className="text-[#f04438] text-base font-medium leading-6">
                Remove
              </Text>
            </Button>
            <Button
              variant="default"
              className="flex-1 bg-[#e56400] rounded-full px-5 py-3"
              onPress={handleSetAsCover}
              disabled={!canSetCover}
            >
              <Text className="text-black text-base font-medium leading-6">
                Set a cover
              </Text>
            </Button>
          </View>
        </View>
      )}

      {/* <UploadMediaBottomSheetModal
        bottomSheetModalRef={uploadMediaBottomSheetRef}
        onImageSelected={handleImageSelected}
        options={["camera", "gallery"]}
      /> */}
    </View>
  );
}

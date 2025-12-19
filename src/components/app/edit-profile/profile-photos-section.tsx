import type { EditProfileFormData } from "@/app/(app)/edit-profile";
import { PhotoGridItem } from "@/components/shared/photo-grid-item";
import { UploadMediaBottomSheetModal } from "@/components/shared/upload-media-bottom-sheet-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import React from "react";
import { Pressable, View } from "react-native";

type PhotoMode = "main" | "other";

export function ProfilePhotosSection({
  formData,
  setFormData,
}: {
  formData: EditProfileFormData;
  setFormData: (data: EditProfileFormData) => void;
}) {
  const bottomSheetModalRef = React.useRef<GorhomBottomSheetModal>(null);
  const [photoMode, setPhotoMode] = React.useState<PhotoMode>("main");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState<number>(0);

  const MAX_OTHER_PHOTOS = 6;
  const profilePictures = formData.profilePictures ?? [];

  const handleChangeMainImage = () => {
    setPhotoMode("main");
    bottomSheetModalRef.current?.present();
  };

  const handleOpenOtherPhotoModal = (index: number) => {
    setPhotoMode("other");
    setSelectedPhotoIndex(index);
    bottomSheetModalRef.current?.present();
  };

  const handleImageSelected = (image: string) => {
    if (photoMode === "main") {
      setFormData({ ...formData, image });
    } else {
      const updated = [...profilePictures];
      if (selectedPhotoIndex < profilePictures.length) {
        updated[selectedPhotoIndex] = image;
      } else {
        updated.push(image);
      }
      setFormData({ ...formData, profilePictures: updated });
    }
  };

  const handleRemoveOtherPhoto = (index: number) => {
    const updated = [...profilePictures];
    updated.splice(index, 1);
    setFormData({ ...formData, profilePictures: updated });
  };

  const photoRows = React.useMemo(() => {
    const padded = [...profilePictures];
    while (padded.length < MAX_OTHER_PHOTOS) {
      padded.push("");
    }
    const rows: string[][] = [];
    for (let i = 0; i < MAX_OTHER_PHOTOS; i += 3) {
      rows.push(padded.slice(i, i + 3));
    }
    return rows;
  }, [profilePictures]);

  return (
    <View className="gap-6">
      {/* Main Profile Picture */}
      <View className="items-center">
        <Pressable
          onPress={handleChangeMainImage}
          className="items-center gap-2"
        >
          <Avatar
            alt="User's Avatar"
            className="size-[120px] items-center justify-center overflow-hidden rounded-full border-2 border-border/60 bg-secondary/60"
          >
            <AvatarImage source={{ uri: formData.image }} />
            <AvatarFallback className="bg-secondary/60">
              <Ionicons
                name="person"
                size={48}
                className="text-muted-foreground"
              />
            </AvatarFallback>
          </Avatar>
          <Text className="text-sm font-medium text-primary">Change image</Text>
        </Pressable>
      </View>

      {/* Other Profile Pictures */}
      <View className="gap-3">
        <Text className="text-sm font-medium text-white">
          Other Profile Pictures
        </Text>
        <View className="gap-1.5">
          {photoRows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-1.5">
              {row.map((uri, colIndex) => {
                const photoIndex = rowIndex * 3 + colIndex;
                return (
                  <PhotoGridItem
                    key={photoIndex}
                    uri={uri}
                    onPress={() => handleOpenOtherPhotoModal(photoIndex)}
                    onRemove={() => handleRemoveOtherPhoto(photoIndex)}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>

      <UploadMediaBottomSheetModal
        bottomSheetModalRef={bottomSheetModalRef}
        onImageSelected={handleImageSelected}
      />
    </View>
  );
}

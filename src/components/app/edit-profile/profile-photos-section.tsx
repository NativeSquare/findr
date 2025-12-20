import type { EditProfileFormData } from "@/app/(app)/edit-profile";
import { PhotoGrid } from "@/components/shared/photo-grid";
import { UploadMediaBottomSheetModal } from "@/components/shared/upload-media-bottom-sheet-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import React from "react";
import { Pressable, View } from "react-native";

export function ProfilePhotosSection({
  formData,
  setFormData,
}: {
  formData: EditProfileFormData;
  setFormData: (data: EditProfileFormData) => void;
}) {
  const mainImageBottomSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const otherPhotosBottomSheetRef = React.useRef<GorhomBottomSheetModal>(null);

  const handleChangeMainImage = () => {
    mainImageBottomSheetRef.current?.present();
  };

  const handleMainImageSelected = (image: string) => {
    setFormData({ ...formData, image });
  };

  const handleOtherPhotosChange = (photos: string[]) => {
    setFormData({ ...formData, profilePictures: photos });
  };

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
      <PhotoGrid
        photos={formData.profilePictures ?? []}
        onPhotosChange={handleOtherPhotosChange}
        maxPhotos={6}
        columnsPerRow={3}
        label="Other Profile Pictures"
        bottomSheetModalRef={otherPhotosBottomSheetRef}
      />

      <UploadMediaBottomSheetModal
        bottomSheetModalRef={mainImageBottomSheetRef}
        onImageSelected={handleMainImageSelected}
        options={["camera", "gallery"]}
      />
    </View>
  );
}

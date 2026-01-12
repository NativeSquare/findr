import type { EditProfileFormData } from "@/app/(app)/edit-profile";
import { PhotoGrid } from "@/components/shared/photo-grid";
import { Id } from "@convex/_generated/dataModel";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import React from "react";
import { View } from "react-native";

export function ProfilePhotosSection({
  formData,
  setFormData,
}: {
  formData: EditProfileFormData;
  setFormData: (data: EditProfileFormData) => void;
}) {
  const otherPhotosBottomSheetRef = React.useRef<GorhomBottomSheetModal>(null);

  const handleOtherPhotosChange = (photos: Id<"_storage">[]) => {
    setFormData({ ...formData, profilePictures: photos });
  };

  return (
    <View className="gap-6">
      <PhotoGrid
        photos={formData.profilePictures ?? []}
        onPhotosChange={handleOtherPhotosChange}
        maxPhotos={6}
        columnsPerRow={3}
        label="Profile Pictures"
        bottomSheetModalRef={otherPhotosBottomSheetRef}
        uploadOptions={["camera", "gallery"]}
      />
    </View>
  );
}

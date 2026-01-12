import { PhotoGridItem } from "@/components/shared/photo-grid-item";
import { UploadMediaBottomSheetModal } from "@/components/shared/upload-media-bottom-sheet-modal";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { View } from "react-native";

export type PhotoGridProps = {
  photos: Id<"_storage">[];
  onPhotosChange: (photos: Id<"_storage">[]) => void;
  maxPhotos?: number;
  columnsPerRow?: number;
  label?: string;
  bottomSheetModalRef: React.RefObject<GorhomBottomSheetModal | null>;
  uploadOptions?: ("camera" | "gallery")[];
};

export function PhotoGrid({
  photos,
  onPhotosChange,
  maxPhotos = 6,
  columnsPerRow = 3,
  label,
  bottomSheetModalRef,
  uploadOptions,
}: PhotoGridProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState<number>(0);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const handleOpenPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index);
    bottomSheetModalRef.current?.present();
  };

  const handleImageSelected = async (image: ImagePicker.ImagePickerAsset) => {
    try {
      // Read the image file
      const response = await fetch(image.uri);
      const blob = await response.blob();

      // Upload to Convex storage
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });
      const { storageId } = await uploadResult.json();

      const updated = [...photos];
      if (selectedPhotoIndex < photos.length) {
        updated[selectedPhotoIndex] = storageId;
      } else {
        updated.push(storageId);
      }
      onPhotosChange(updated);
    } catch (error) {
      console.error("Error uploading image:", error);
      // You might want to show an error to the user here
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updated = [...photos];
    updated.splice(index, 1);
    onPhotosChange(updated);
  };

  const photoRows = React.useMemo(() => {
    const padded: (Id<"_storage"> | null)[] = [...photos];
    while (padded.length < maxPhotos) {
      padded.push(null);
    }
    const rows: (Id<"_storage"> | null)[][] = [];
    for (let i = 0; i < maxPhotos; i += columnsPerRow) {
      rows.push(padded.slice(i, i + columnsPerRow));
    }
    return rows;
  }, [photos, maxPhotos, columnsPerRow]);

  return (
    <View className="gap-3">
      {label && <Text className="text-sm font-medium text-white">{label}</Text>}
      <View className="gap-1.5">
        {photoRows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-1.5">
            {row.map((storageId, colIndex) => {
              const photoIndex = rowIndex * columnsPerRow + colIndex;
              return (
                <PhotoGridItem
                  key={photoIndex}
                  storageId={storageId}
                  onPress={() => handleOpenPhotoModal(photoIndex)}
                  onRemove={
                    storageId && photoIndex < photos.length
                      ? () => handleRemovePhoto(photoIndex)
                      : undefined
                  }
                />
              );
            })}
          </View>
        ))}
      </View>

      <UploadMediaBottomSheetModal
        bottomSheetModalRef={bottomSheetModalRef}
        onImageSelected={handleImageSelected}
        options={uploadOptions}
      />
    </View>
  );
}

import { PhotoGridItem } from "@/components/shared/photo-grid-item";
import { UploadMediaBottomSheetModal } from "@/components/shared/upload-media-bottom-sheet-modal";
import { Text } from "@/components/ui/text";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import React from "react";
import { View } from "react-native";

export type PhotoGridProps = {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
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

  const handleOpenPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index);
    bottomSheetModalRef.current?.present();
  };

  const handleImageSelected = (image: string) => {
    const updated = [...photos];
    if (selectedPhotoIndex < photos.length) {
      updated[selectedPhotoIndex] = image;
    } else {
      updated.push(image);
    }
    onPhotosChange(updated);
  };

  const handleRemovePhoto = (index: number) => {
    const updated = [...photos];
    updated.splice(index, 1);
    onPhotosChange(updated);
  };

  const photoRows = React.useMemo(() => {
    const padded = [...photos];
    while (padded.length < maxPhotos) {
      padded.push("");
    }
    const rows: string[][] = [];
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
            {row.map((uri, colIndex) => {
              const photoIndex = rowIndex * columnsPerRow + colIndex;
              return (
                <PhotoGridItem
                  key={photoIndex}
                  uri={uri}
                  onPress={() => handleOpenPhotoModal(photoIndex)}
                  onRemove={
                    uri && photoIndex < photos.length
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

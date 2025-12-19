import { OnboardingFormData } from "@/app/(onboarding)";
import { PhotoGridItem } from "@/components/shared/photo-grid-item";
import { UploadMediaBottomSheetModal } from "@/components/shared/upload-media-bottom-sheet-modal";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { Rocket } from "lucide-react-native";
import React from "react";
import { View } from "react-native";

export function AddMorePhotosStep({
  formData,
  setFormData,
}: {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
}) {
  const bottomSheetModalRef = React.useRef<GorhomBottomSheetModal>(null);
  const MAX_PHOTOS = 6;

  const profilePictures = formData.profilePictures ?? [];

  const handleOpenBottomSheetModal = React.useCallback((index: number) => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleRemovePhoto = React.useCallback(
    (index: number) => {
      const updated = [...profilePictures];
      updated.splice(index, 1);
      setFormData({ ...formData, profilePictures: updated });
    },
    [profilePictures, formData, setFormData]
  );

  const photoRows = React.useMemo(() => {
    const padded = [...profilePictures];
    while (padded.length < MAX_PHOTOS) {
      padded.push("");
    }
    const rows: string[][] = [];
    for (let i = 0; i < MAX_PHOTOS; i += 3) {
      rows.push(padded.slice(i, i + 3));
    }
    return rows;
  }, [profilePictures]);

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-lg font-semibold text-foreground">
          Add More Photos
        </Text>
        <Text className="text-sm text-muted-foreground">
          Show different sides of your personality
        </Text>
      </View>

      <View className="flex-row items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-4">
        <View className="size-12 items-center justify-center rounded-full bg-primary">
          <Icon as={Rocket} size={22} className="text-primary-foreground" />
        </View>
        <Text className="flex-1 text-base text-foreground">
          Profiles with 3+ photos get 5× more interactions
        </Text>
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium text-foreground">
          Your photos {profilePictures.length}/{MAX_PHOTOS}
        </Text>
        <View className="gap-3">
          {photoRows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-3">
              {row.map((uri, colIndex) => {
                const photoIndex = rowIndex * 3 + colIndex;
                return (
                  <PhotoGridItem
                    key={photoIndex}
                    uri={uri}
                    onPress={() => handleOpenBottomSheetModal(photoIndex)}
                    onRemove={() => handleRemovePhoto(photoIndex)}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>

      <UploadMediaBottomSheetModal
        bottomSheetModalRef={bottomSheetModalRef}
        onImageSelected={(image) =>
          setFormData({
            ...formData,
            profilePictures: [...(formData.profilePictures ?? []), image],
          })
        }
      />
    </View>
  );
}

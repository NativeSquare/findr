import { CachedPicturesGrid } from "@/components/app/settings/cached-pictures-grid";
import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { CameraModal } from "@/components/shared/camera-modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
    type CachedPicture,
    useCachedPictures,
} from "@/hooks/use-cached-pictures";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import type { CameraCapturedPicture } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image, Images, LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Alert, Dimensions, Keyboard, Linking, View } from "react-native";

interface UploadMediaBottomSheetModalProps {
  bottomSheetModalRef: React.RefObject<GorhomBottomSheetModal | null>;
  onImageSelected?: (image: ImagePicker.ImagePickerAsset) => void;
  onImagesSelected?: (images: ImagePicker.ImagePickerAsset[]) => void;
  onAlbumPress?: () => void;
  options?: ("camera" | "gallery" | "album")[];
  allowsEditing?: boolean;
  allowsMultipleSelection?: boolean;
  aspect?: [number, number];
  /** Show cached pictures section (default: true) */
  showCachedPictures?: boolean;
  /** Cache images when they are selected (default: false) */
  cacheOnSelect?: boolean;
}

export function UploadMediaBottomSheetModal({
  bottomSheetModalRef,
  onImageSelected,
  onImagesSelected,
  onAlbumPress,
  options = ["camera", "gallery", "album"],
  allowsEditing = false,
  allowsMultipleSelection = false,
  aspect,
  showCachedPictures = true,
  cacheOnSelect = false,
}: UploadMediaBottomSheetModalProps) {
  const [showCamera, setShowCamera] = React.useState(false);

  const { cachedPictures, addToCache } = useCachedPictures();

  const handleCachedPictureSelect = (picture: CachedPicture) => {
    const imageAsset: ImagePicker.ImagePickerAsset = {
      uri: picture.localUri,
      width: picture.width ?? 0,
      height: picture.height ?? 0,
      type: "image",
      fileName: `cached_${picture.id}.jpg`,
      assetId: null,
      mimeType: "image/jpeg",
    };
    if (onImagesSelected) {
      onImagesSelected([imageAsset]);
    } else if (onImageSelected) {
      onImageSelected(imageAsset);
    }
    bottomSheetModalRef.current?.dismiss();
  };

  const handleCachedPicturesMultiSelect = (pictures: CachedPicture[]) => {
    const imageAssets: ImagePicker.ImagePickerAsset[] = pictures.map((picture) => ({
      uri: picture.localUri,
      width: picture.width ?? 0,
      height: picture.height ?? 0,
      type: "image",
      fileName: `cached_${picture.id}.jpg`,
      assetId: null,
      mimeType: "image/jpeg",
    }));
    if (onImagesSelected) {
      onImagesSelected(imageAssets);
    } else if (onImageSelected && imageAssets[0]) {
      onImageSelected(imageAssets[0]);
    }
    bottomSheetModalRef.current?.dismiss();
  };

  const cacheImage = async (uri: string, width?: number, height?: number) => {
    if (cacheOnSelect) {
      await addToCache({ uri, width, height });
    }
  };

  const handleTakePicture = () => {
    bottomSheetModalRef.current?.dismiss();
    setShowCamera(true);
  };

  const handlePhotoTaken = async (photo: CameraCapturedPicture) => {
    setShowCamera(false);

    const imageAsset: ImagePicker.ImagePickerAsset = {
      uri: photo.uri,
      width: photo.width,
      height: photo.height,
      type: "image",
      fileName: `photo_${Date.now()}.jpg`,
      assetId: null,
      mimeType: "image/jpeg",
    };
    await cacheImage(photo.uri, photo.width, photo.height);
    if (onImagesSelected) {
      onImagesSelected([imageAsset]);
    } else if (onImageSelected) {
      onImageSelected(imageAsset);
    }
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant access to your photo library to select images.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                Linking.openSettings();
              },
            },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: allowsMultipleSelection,
        allowsEditing: allowsEditing,
        quality: 1.0,
        selectionLimit: allowsMultipleSelection ? 10 : 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        // Cache selected images
        for (const asset of result.assets) {
          await cacheImage(asset.uri, asset.width, asset.height);
        }
        if (onImagesSelected) {
          onImagesSelected(result.assets);
        } else if (onImageSelected && result.assets[0]) {
          onImageSelected(result.assets[0]);
        }
        bottomSheetModalRef.current?.dismiss();
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image from gallery.");
    }
  };

  const optionMap: Record<
    "camera" | "gallery" | "album",
    {
      icon: LucideIcon;
      label: string;
      onPress: () => void;
    }
  > = {
    camera: {
      icon: Camera,
      label: "Camera",
      onPress: handleTakePicture,
    },
    gallery: {
      icon: Image,
      label: "Gallery",
      onPress: handlePickFromGallery,
    },
    album: {
      icon: Images,
      label: "Album",
      onPress: () => {
        Keyboard.dismiss();
        bottomSheetModalRef.current?.dismiss();
        // Small delay to ensure the first bottom sheet is fully dismissed
        setTimeout(() => {
          onAlbumPress?.();
        }, 100);
      },
    },
  };

  const displayOptions = options.map((option) => optionMap[option]);

  const screenWidth = Dimensions.get("window").width;
  const padding = 32; // px-4 on each side (16px * 2)
  const gap = 12; // gap-3
  const gapsTotal = (3 - 1) * gap; // 2 gaps for 3 items
  const itemWidth = (screenWidth - padding - gapsTotal) / 3;

  return (
    <>
      <BottomSheetModal ref={bottomSheetModalRef}>
        <View className="flex-row flex-wrap gap-3 px-4 pb-4 pt-3">
          {displayOptions.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              onPress={option.onPress}
              style={{ width: itemWidth }}
              className="aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-border bg-card/60 px-3 py-4"
            >
              <Icon
                as={option.icon}
                size={26}
                className="text-muted-foreground"
              />
              <Text className="mt-2 text-sm font-normal text-muted-foreground">
                {option.label}
              </Text>
            </Button>
          ))}
        </View>

        {showCachedPictures && cachedPictures.length > 0 && (
          <View className="pb-6">
            <Text className="px-4 pb-3 text-sm font-medium text-muted-foreground">
              Recent
            </Text>
            <CachedPicturesGrid
              pictures={cachedPictures}
              mode="select"
              layout="horizontal"
              thumbnailSize={72}
              onSelect={handleCachedPictureSelect}
              onMultiSelect={allowsMultipleSelection ? handleCachedPicturesMultiSelect : undefined}
              allowMultiSelect={allowsMultipleSelection}
              showEmptyState={false}
            />
          </View>
        )}
      </BottomSheetModal>

      <CameraModal
        visible={showCamera}
        onClose={handleCameraClose}
        onPhotoTaken={handlePhotoTaken}
      />
    </>
  );
}

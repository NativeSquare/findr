import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image, Images, LucideIcon } from "lucide-react-native";
import * as React from "react";
import { Alert, Dimensions, View } from "react-native";

interface UploadMediaBottomSheetModalProps {
  bottomSheetModalRef: React.RefObject<GorhomBottomSheetModal | null>;
  onImageSelected: (image: string) => void;
  options?: ("camera" | "gallery" | "album")[];
}

export function UploadMediaBottomSheetModal({
  bottomSheetModalRef,
  onImageSelected,
  options = ["camera", "gallery", "album"],
}: UploadMediaBottomSheetModalProps) {
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: false,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
      bottomSheetModalRef.current?.dismiss();
    }
  };

  const openCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
      bottomSheetModalRef.current?.dismiss();
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
      onPress: openCamera,
    },
    gallery: {
      icon: Image,
      label: "Gallery",
      onPress: pickImage,
    },
    album: {
      icon: Images,
      label: "Album",
      onPress: () => {},
    },
  };

  const displayOptions = options.map((option) => optionMap[option]);

  const screenWidth = Dimensions.get("window").width;
  const padding = 32; // px-4 on each side (16px * 2)
  const gap = 12; // gap-3
  const gapsTotal = (3 - 1) * gap; // 2 gaps for 3 items
  const itemWidth = (screenWidth - padding - gapsTotal) / 3;

  return (
    <BottomSheetModal ref={bottomSheetModalRef}>
      <View className="flex-row flex-wrap gap-3 px-4 pb-6 pt-3">
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
    </BottomSheetModal>
  );
}

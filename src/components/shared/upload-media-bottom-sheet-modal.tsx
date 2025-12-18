import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image, Images } from "lucide-react-native";
import * as React from "react";
import { Alert, View } from "react-native";

export function UploadMediaBottomSheetModal({
  bottomSheetModalRef,
  onImageSelected,
}: {
  bottomSheetModalRef: React.RefObject<GorhomBottomSheetModal | null>;
  onImageSelected: (image: string) => void;
}) {
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

  return (
    <BottomSheetModal ref={bottomSheetModalRef}>
      <View className="flex-row gap-3 px-4 pb-6 pt-3">
        <Button
          variant="outline"
          onPress={openCamera}
          className="flex-1 aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-border bg-card/60 px-3 py-4"
        >
          <Icon as={Camera} size={26} className="text-muted-foreground" />
          <Text className="mt-2 text-sm font-normal text-muted-foreground">
            Camera
          </Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => pickImage()}
          className="flex-1 aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-border bg-card/60 px-3 py-4"
        >
          <Icon as={Image} size={26} className="text-muted-foreground" />
          <Text className="mt-2 text-sm font-normal text-muted-foreground">
            Gallery
          </Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => {}}
          className="flex-1 aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-border bg-card/60 px-3 py-4"
        >
          <Icon as={Images} size={26} className="text-muted-foreground" />
          <Text className="mt-2 text-sm font-normal text-muted-foreground">
            Album
          </Text>
        </Button>
      </View>
    </BottomSheetModal>
  );
}

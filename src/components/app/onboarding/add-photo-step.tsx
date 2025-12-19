import { OnboardingFormData } from "@/app/(onboarding)";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { Plus } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";
import { UploadMediaBottomSheetModal } from "../../shared/upload-media-bottom-sheet-modal";

export function AddPhotoStep({
  formData,
  setFormData,
}: {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
}) {
  const bottomSheetModalRef = React.useRef<GorhomBottomSheetModal>(null);

  const handleOpenBottomSheetModal = React.useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <View className="flex-1 items-center gap-6 pt-8">
      <Avatar
        alt="User's Avatar"
        className="size-28 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-secondary/60"
      >
        <AvatarImage source={{ uri: formData.image }} />
        <AvatarFallback className="bg-secondary/60">
          <Ionicons name="person" size={48} className="text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <Button variant="outline" onPress={handleOpenBottomSheetModal}>
        <Icon as={Plus} size={18} className="text-primary" />
        <Text className="text-primary text-sm font-medium">Add Photo</Text>
      </Button>
      <UploadMediaBottomSheetModal
        bottomSheetModalRef={bottomSheetModalRef}
        onImageSelected={(image) => setFormData({ ...formData, image: image })}
        options={["camera", "gallery"]}
      />
    </View>
  );
}

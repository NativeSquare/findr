import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import { View } from "react-native";

export type CreateAlbumBottomSheetProps = {
  bottomSheetModalRef: React.RefObject<GorhomBottomSheetModal | null>;
  onAlbumCreated?: () => void;
};

export function CreateAlbumBottomSheet({
  bottomSheetModalRef,
  onAlbumCreated,
}: CreateAlbumBottomSheetProps) {
  const [albumTitle, setAlbumTitle] = useState("");
  const createAlbum = useMutation(api.albums.createAlbum);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!albumTitle.trim() || isCreating) return;

    setIsCreating(true);
    try {
      await createAlbum({ title: albumTitle.trim() });
      setAlbumTitle("");
      bottomSheetModalRef.current?.dismiss();
      onAlbumCreated?.();
    } catch (error) {
      console.error("Failed to create album:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setAlbumTitle("");
    bottomSheetModalRef.current?.dismiss();
  };

  const isTitleValid = albumTitle.trim().length > 0;

  return (
    <BottomSheetModal ref={bottomSheetModalRef}>
      <View className="px-5 pb-6 gap-6">
        <View className="gap-3">
          <Label className="text-sm font-medium text-[#d1d1d6]">
            Album Title
          </Label>
          <View className="bg-[#1a1a1e] border border-[#26272b] rounded-lg px-3.5 py-3">
            <Input
              value={albumTitle}
              onChangeText={setAlbumTitle}
              placeholder="Album name"
              placeholderTextColor="#70707b"
              className="text-base leading-6 text-white p-0 border-0"
              autoFocus
            />
          </View>
        </View>

        <View className="gap-5">
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-full border-[#f04438] bg-transparent"
              onPress={handleCancel}
              disabled={isCreating}
            >
              <Text className="text-base font-medium leading-6 text-[#f04438]">
                Cancel
              </Text>
            </Button>
            <Button
              className={`flex-1 h-12 rounded-full ${
                isTitleValid ? "bg-primary" : "bg-primary opacity-50"
              }`}
              onPress={handleCreate}
              disabled={!isTitleValid || isCreating}
            >
              <Text className="text-base font-medium leading-6 text-black">
                Create Album
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </BottomSheetModal>
  );
}


import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import * as React from "react";
import { View } from "react-native";

export type DeleteAlbumBottomSheetProps = {
  bottomSheetModalRef: React.RefObject<GorhomBottomSheetModal | null>;
  albumTitle: string;
  photoCount: number;
  onConfirm: () => void;
  onCancel?: () => void;
};

export function DeleteAlbumBottomSheet({
  bottomSheetModalRef,
  albumTitle,
  photoCount,
  onConfirm,
  onCancel,
}: DeleteAlbumBottomSheetProps) {
  const handleCancel = React.useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    onCancel?.();
  }, [bottomSheetModalRef, onCancel]);

  const handleConfirm = React.useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    onConfirm();
  }, [bottomSheetModalRef, onConfirm]);

  return (
    <BottomSheetModal ref={bottomSheetModalRef}>
      <View className="gap-5 px-5 pb-6 pt-3">
        <View className="gap-2">
          <Text className="text-base font-medium leading-6 text-[#d1d1d6]">
            Delete Album
          </Text>
          <Text className="text-sm leading-5 text-[#a0a0ab]">
            Delete 1 album ({photoCount} items) ?
          </Text>
        </View>

        <View className="flex-row gap-3">
          <Button
            variant="outline"
            onPress={handleCancel}
            className="flex-1 border border-[#70707b] rounded-full px-5 py-3"
          >
            <Text className="text-base font-medium leading-6 text-white">
              Cancel
            </Text>
          </Button>
          <Button
            onPress={handleConfirm}
            className="flex-1 bg-[#f04438] rounded-full px-5 py-3"
          >
            <Text className="text-base font-medium leading-6 text-white">
              Delete
            </Text>
          </Button>
        </View>
      </View>
    </BottomSheetModal>
  );
}

import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import * as React from "react";
import { View } from "react-native";

interface ConfirmBottomSheetProps {
  bottomSheetModalRef: React.RefObject<GorhomBottomSheetModal | null>;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmBottomSheet({
  bottomSheetModalRef,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmVariant = "destructive",
  onConfirm,
  onCancel,
}: ConfirmBottomSheetProps) {
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
      <View className="gap-6 px-4 pb-6 pt-3">
        <View className="gap-2">
          <Text className="text-xl font-semibold text-foreground">{title}</Text>
          <Text className="text-base font-normal leading-6 text-muted-foreground">
            {description}
          </Text>
        </View>

        <View className="flex-row gap-3">
          <Button variant="outline" onPress={handleCancel} className="flex-1">
            <Text>{cancelLabel}</Text>
          </Button>
          <Button
            variant={confirmVariant}
            onPress={handleConfirm}
            className="flex-1"
          >
            <Text>{confirmLabel}</Text>
          </Button>
        </View>
      </View>
    </BottomSheetModal>
  );
}

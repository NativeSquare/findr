import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useEffect } from "react";
import { View } from "react-native";

interface AddSentenceBottomSheetProps {
  bottomSheetModalRef: React.RefObject<GorhomBottomSheetModal | null>;
  title: string;
  initialValue?: string;
  onSave: (text: string) => void;
  onCancel?: () => void;
}

export function AddSentenceBottomSheet({
  bottomSheetModalRef,
  title,
  initialValue = "",
  onSave,
  onCancel,
}: AddSentenceBottomSheetProps) {
  const [text, setText] = React.useState(initialValue);

  // Reset text when initialValue changes
  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  const handleCancel = React.useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    setText(initialValue);
    onCancel?.();
  }, [bottomSheetModalRef, initialValue, onCancel]);

  const handleSave = React.useCallback(() => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    bottomSheetModalRef.current?.dismiss();
    onSave(trimmedText);
    setText("");
  }, [bottomSheetModalRef, text, onSave]);

  return (
    <BottomSheetModal ref={bottomSheetModalRef}>
      <View className="gap-6 px-4 pb-6 pt-3">
        <Text className="text-xl font-semibold text-foreground">{title}</Text>

        <Input
          value={text}
          onChangeText={setText}
          placeholder="Enter a sentence..."
          placeholderTextColor="#d1d1d6"
          className="text-base text-foreground"
          autoFocus
          onSubmitEditing={handleSave}
        />

        <View className="flex-row gap-3">
          <Button variant="outline" onPress={handleCancel} className="flex-1">
            <Text>Cancel</Text>
          </Button>
          <Button variant="default" onPress={handleSave} className="flex-1">
            <Text>Save</Text>
          </Button>
        </View>
      </View>
    </BottomSheetModal>
  );
}

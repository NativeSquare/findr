import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import React, { useEffect, useRef } from "react";
import { TextInput, View } from "react-native";

export type SentenceInputCardProps = {
  title: string;
  initialValue?: string;
  onSave: (text: string) => void;
  onCancel: () => void;
};

export function SentenceInputCard({
  title,
  initialValue = "",
  onSave,
  onCancel,
}: SentenceInputCardProps) {
  const [text, setText] = React.useState(initialValue);
  const inputRef = useRef<TextInput>(null);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Reset text when initialValue changes
  useEffect(() => {
    setText(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    onSave(trimmedText);
  };

  const isSaveDisabled = !text.trim();

  return (
    <View className="bg-[#1a1a1e] rounded-xl p-4 gap-4 border border-[#26272b]">
      <Text className="text-base font-semibold text-white">{title}</Text>

      <Input
        ref={inputRef}
        value={text}
        onChangeText={setText}
        placeholder="Enter a sentence..."
        placeholderTextColor="#70707b"
        className="text-base text-white"
        onSubmitEditing={handleSave}
        returnKeyType="done"
      />

      <View className="flex-row gap-3">
        <Button variant="outline" onPress={onCancel} className="flex-1">
          <Text>Cancel</Text>
        </Button>
        <Button
          variant="default"
          onPress={handleSave}
          className="flex-1"
          disabled={isSaveDisabled}
        >
          <Text>Save</Text>
        </Button>
      </View>
    </View>
  );
}

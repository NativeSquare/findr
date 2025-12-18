import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { usePlacement } from "expo-superwall";
import * as React from "react";
import { ScrollView, View } from "react-native";

export default function Pro() {
  const { registerPlacement, state: placementState } = usePlacement({
    onError: (err) => console.error("Placement Error:", err),
    onPresent: (info) => console.log("Paywall Presented:", info),
    onDismiss: (info, result) =>
      console.log("Paywall Dismissed:", info, "Result:", result),
  });
  const handleTriggerPlacement = async () => {
    await registerPlacement({
      placement: "campaign_trigger",
    });
  };
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive"
    >
      <View className="w-full max-w-sm">
        <View className="p-4">
          <Button onPress={handleTriggerPlacement}>
            <Text>Show Paywall</Text>
          </Button>
          {placementState && (
            <Text>Last Paywall Result: {JSON.stringify(placementState)}</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

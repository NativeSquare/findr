import { OnboardingFormData } from "@/app/(onboarding)";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { View } from "react-native";

export function PersonalInfoStep({
  formData,
  setFormData,
}: {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
}) {
  const BODY_TYPES = ["Slim", "Average", "Athletic", "Muscular", "Stocky"];
  const ORIENTATIONS = [
    "Straight",
    "Gay",
    "Bisexual",
    "Queer",
    "Pansexual",
    "Asexual",
    "Demisexual",
    "Ask Me",
  ];
  const LOOKING_FOR = ["Connections", "Friends", "Dating"];
  return (
    <View className="gap-5">
      <View className="gap-2">
        <Text className="text-sm text-muted-foreground">Age</Text>
        <Input
          keyboardType="number-pad"
          value={formData.age?.toString()}
          onChangeText={(value) =>
            setFormData({ ...formData, age: Number(value) })
          }
          placeholder="18"
          maxLength={3}
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm text-muted-foreground">Height</Text>
        <View className="relative">
          <Input
            value={formData.height}
            onChangeText={(value) =>
              setFormData({ ...formData, height: value })
            }
            placeholder="7.03 ft"
            returnKeyType="done"
          />
          <Ionicons
            name="chevron-down"
            size={16}
            className="text-muted-foreground"
            style={{
              position: "absolute",
              right: 12,
              top: 12,
              opacity: 0.8,
            }}
            pointerEvents="none"
          />
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-sm text-muted-foreground">Body Types</Text>
        <View className="flex-row flex-wrap gap-2">
          {BODY_TYPES.map((option, index) => (
            <Button
              key={index}
              variant={
                formData.bodyTypes?.includes(option) ? "default" : "outline"
              }
              onPress={() =>
                setFormData({
                  ...formData,
                  bodyTypes: formData.bodyTypes?.includes(option)
                    ? formData.bodyTypes?.filter((type) => type !== option)
                    : [...(formData.bodyTypes || []), option],
                })
              }
            >
              <Text>{option}</Text>
            </Button>
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-sm text-muted-foreground">
          Sexual Orientation
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {ORIENTATIONS.map((option, index) => (
            <Button
              key={index}
              variant={formData.orientation === option ? "default" : "outline"}
              onPress={() =>
                setFormData({
                  ...formData,
                  orientation: option,
                })
              }
            >
              <Text>{option}</Text>
            </Button>
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-sm text-muted-foreground">Looking for</Text>
        <View className="flex-row flex-wrap gap-2">
          {LOOKING_FOR.map((option, index) => (
            <Button
              key={index}
              variant={
                formData.lookingFor?.includes(option) ? "default" : "outline"
              }
              onPress={() =>
                setFormData({
                  ...formData,
                  lookingFor: formData.lookingFor?.includes(option)
                    ? formData.lookingFor?.filter((type) => type !== option)
                    : [...(formData.lookingFor || []), option],
                })
              }
            >
              <Text>{option}</Text>
            </Button>
          ))}
        </View>
      </View>
    </View>
  );
}

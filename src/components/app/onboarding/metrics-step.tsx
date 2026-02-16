import { OnboardingFormData } from "@/app/(onboarding)";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { MeasurementSystem } from "@/utils/measurements";
import { Check, Ruler } from "lucide-react-native";
import * as React from "react";
import { Pressable, View } from "react-native";

const MEASUREMENT_OPTIONS: {
  value: MeasurementSystem;
  label: string;
  description: string;
}[] = [
  {
    value: "metric",
    label: "Metric",
    description: "Centimeters, Kilograms, Kilometers",
  },
  {
    value: "imperial",
    label: "Imperial",
    description: "Feet/Inches, Pounds, Miles",
  },
];

export function MetricsStep({
  formData,
  setFormData,
}: {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
  showErrors?: boolean;
}) {
  const currentSystem = formData.measurementSystem ?? "metric";

  return (
    <View className="gap-6">
      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <Icon as={Ruler} size={20} className="text-primary" />
          <Text className="text-lg font-semibold text-foreground">
            Preferred Measurement System
          </Text>
        </View>
        <Text className="text-sm text-muted-foreground">
          Choose how you'd like to see height, weight, and distance displayed.
        </Text>
      </View>

      <View className="gap-3">
        {MEASUREMENT_OPTIONS.map((option) => {
          const isSelected = currentSystem === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() =>
                setFormData({ ...formData, measurementSystem: option.value })
              }
              className={`flex-row items-center justify-between py-4 px-4 rounded-xl active:opacity-70 ${
                isSelected
                  ? "bg-primary/10 border border-primary"
                  : "bg-secondary/30 border border-transparent"
              }`}
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-foreground">
                  {option.label}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {option.description}
                </Text>
              </View>
              {isSelected && (
                <Icon as={Check} size={20} className="text-primary" />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

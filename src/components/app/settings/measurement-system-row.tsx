import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { MeasurementSystem } from "@/utils/measurements";
import { ChevronRight, Ruler } from "lucide-react-native";
import { Pressable, View } from "react-native";

export type MeasurementSystemRowProps = {
  value: MeasurementSystem;
  onPress: () => void;
};

export function MeasurementSystemRow({ value, onPress }: MeasurementSystemRowProps) {
  const displayValue = value === "imperial" ? "Imperial (ft, lbs, mi)" : "Metric (cm, kg, km)";

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-4 border-b border-[#1a1a1e] active:opacity-70"
    >
      <View className="flex-row items-center gap-4">
        <Icon as={Ruler} size={20} className="text-[#d1d1d6]" />
        <Text className="text-sm font-medium text-[#d1d1d6]">
          Measurement System
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Text className="text-sm text-[#70707b]">{displayValue}</Text>
        <Icon as={ChevronRight} size={16} className="text-[#70707b]" />
      </View>
    </Pressable>
  );
}

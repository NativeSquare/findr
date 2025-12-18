import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { View } from "react-native";

export function OptionSwitch({
  nativeID,
  label,
  isChecked,
  onCheckedChange,
}: {
  nativeID: string;
  label: string;
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Label nativeID={nativeID} htmlFor={nativeID}>
        {label}
      </Label>
      <Switch
        checked={isChecked}
        onCheckedChange={onCheckedChange}
        id={nativeID}
        nativeID={nativeID}
      />
    </View>
  );
}

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export function OptionButton({
  option,
  isSelected,
  onPress,
}: {
  option: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      variant={"outline"}
      onPress={onPress}
      className={isSelected ? "border-primary dark:border-primary" : ""}
    >
      <Text
        className={isSelected ? "text-primary group-active:text-primary" : ""}
      >
        {option}
      </Text>
    </Button>
  );
}

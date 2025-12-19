import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { View } from "react-native";

export type TabBarProps = {
  value: string;
  onValueChange: (value: string) => void;
  tabs: Array<{ value: string; label: string }>;
};

export function TabBar({ value, onValueChange, tabs }: TabBarProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      {/* <View className="flex-row border-b-2 border-gray-600"> */}
      <TabsList className="flex-row w-full border-0 bg-transparent p-0 h-auto rounded-none">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex-1 items-center justify-center border-0 border-b-2 border-gray-600 focus-visible:border-primary bg-transparent dark:bg-transparent rounded-none shadow-none data-[state=active]:bg-transparent px-0 py-0"
          >
            <View className="flex-1 items-center py-3 relative w-full">
              <Text
                className={`text-sm font-medium ${
                  value === tab.value ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </Text>
              {/* <View
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                  value === tab.value ? "bg-primary" : "bg-transparent"
                }`}
              /> */}
            </View>
          </TabsTrigger>
        ))}
      </TabsList>
      {/* </View> */}
    </Tabs>
  );
}

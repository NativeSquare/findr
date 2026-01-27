import { cn } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { Input } from "../ui/input";

export function SearchInput({
  className,
  placeholderClassName,
  ...props
}: TextInputProps & React.RefAttributes<TextInput>) {
  return (
    <View className="relative">
      <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <Ionicons
          name="search-outline"
          size={20}
          className="text-muted-foreground"
        />
      </View>
      <Input
        placeholder={props.placeholder ?? "Search"}
        className={cn("pl-12 rounded-full", className)}
        placeholderClassName={placeholderClassName}
        {...props}
      />
    </View>
  );
}

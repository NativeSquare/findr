import { OnboardingFormData } from "@/app/(onboarding)";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";
import { OptionButton } from "./option-button";

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
          keyboardType="numeric"
          value={formData.age ? formData.age.toString() : ""}
          onChangeText={(value) =>
            setFormData({ ...formData, age: Number(value) })
          }
          placeholder="18"
          maxLength={3}
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm text-muted-foreground">Height</Text>
        <View className="flex flex-row items-center gap-2">
          <Input
            keyboardType="numeric"
            value={
              formData.height?.value ? formData.height?.value.toString() : ""
            }
            onChangeText={(value) =>
              setFormData({
                ...formData,
                height: {
                  value: Number(value),
                  unit: formData.height?.unit || "cm",
                },
              })
            }
            placeholder="175"
            maxLength={3}
            className="flex-1"
          />
          <Select
            defaultValue={{ label: "cm", value: "cm" }}
            onValueChange={(option) =>
              setFormData({
                ...formData,
                height: {
                  value: formData.height?.value ?? 0,
                  unit: option?.value ?? "cm",
                },
              })
            }
          >
            <SelectTrigger className="w-[64px]" disabled={true}>
              <SelectValue placeholder="cm" />
            </SelectTrigger>
            <SelectContent className="w-[64px]">
              <SelectGroup>
                <SelectLabel>Height Unit</SelectLabel>
                <SelectItem label="cm" value="cm">
                  cm
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-sm text-muted-foreground">Body Types</Text>
        <View className="flex-row flex-wrap gap-2">
          {BODY_TYPES.map((option, index) => (
            <OptionButton
              key={index}
              option={option}
              onPress={() =>
                setFormData({
                  ...formData,
                  lookingFor: formData.lookingFor?.includes(option)
                    ? formData.lookingFor?.filter((type) => type !== option)
                    : [...(formData.lookingFor || []), option],
                })
              }
              isSelected={formData.lookingFor?.includes(option) ?? false}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-sm text-muted-foreground">
          Sexual Orientation
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {ORIENTATIONS.map((option, index) => (
            <OptionButton
              key={index}
              option={option}
              onPress={() =>
                setFormData({
                  ...formData,
                  orientation: option,
                })
              }
              isSelected={formData.orientation === option}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-sm text-muted-foreground">Looking for</Text>
        <View className="flex-row flex-wrap gap-2">
          {LOOKING_FOR.map((option, index) => (
            <OptionButton
              key={index}
              option={option}
              onPress={() =>
                setFormData({
                  ...formData,
                  lookingFor: formData.lookingFor?.includes(option)
                    ? formData.lookingFor?.filter((type) => type !== option)
                    : [...(formData.lookingFor || []), option],
                })
              }
              isSelected={formData.lookingFor?.includes(option) ?? false}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

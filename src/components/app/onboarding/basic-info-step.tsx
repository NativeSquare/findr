import { OnboardingFormData } from "@/app/(onboarding)";
import * as React from "react";
import { View } from "react-native";
import { BioField } from "../profile/bio-field";
import { NameField } from "../profile/name-field";

export function BasicInfoStep({
  formData,
  setFormData,
}: {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
}) {
  return (
    <View className="gap-5">
      <NameField
        value={formData.name}
        onChange={(value) => setFormData({ ...formData, name: value })}
      />
      <BioField
        value={formData.bio}
        onChange={(value) => setFormData({ ...formData, bio: value })}
      />
    </View>
  );
}

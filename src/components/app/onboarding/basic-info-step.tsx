import { OnboardingFormData } from "@/app/(onboarding)";
import * as React from "react";
import { View } from "react-native";
import { BioField } from "../profile/bio-field";
import { NameField } from "../profile/name-field";

export function BasicInfoStep({
  formData,
  setFormData,
  showErrors = false,
}: {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
  showErrors?: boolean;
}) {
  const isNameInvalid = showErrors && !formData.name?.trim();
  
  return (
    <View className="gap-5">
      <NameField
        value={formData.name}
        onChange={(value) => setFormData({ ...formData, name: value })}
        error={isNameInvalid}
        errorMessage={isNameInvalid ? "Name is required" : undefined}
      />
      <BioField
        value={formData.bio}
        onChange={(value) => setFormData({ ...formData, bio: value })}
      />
    </View>
  );
}

import { OnboardingFormData } from "@/app/(onboarding)";
import * as React from "react";
import { View } from "react-native";
import { BirthDateField } from "../profile/birth-date-field";
import { HeightField } from "../profile/height-field";
import { WeightField } from "../profile/weight-field";

export function PersonalInfoStep({
  formData,
  setFormData,
  showErrors = false,
}: {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
  showErrors?: boolean;
}) {
  const isBirthDateInvalid = showErrors && !formData.birthDate;
  
  return (
    <View className="gap-5">
      <BirthDateField
        value={formData.birthDate}
        onChange={(value) => setFormData({ ...formData, birthDate: value })}
        error={isBirthDateInvalid}
        errorMessage={
          isBirthDateInvalid ? "Date of birth is required" : undefined
        }
      />

      <HeightField
        value={formData.height?.value ? formData.height?.value.toString() : ""}
        onChangeHeight={(value) =>
          setFormData({
            ...formData,
            height: {
              value: Number(value),
              unit: formData.height?.unit || "cm",
            },
          })
        }
        onChangeUnit={(option) =>
          setFormData({
            ...formData,
            height: {
              value: formData.height?.value ?? 0,
              unit: option?.value ?? "cm",
            },
          })
        }
      />

      <WeightField
        value={formData.weight?.value ? formData.weight?.value.toString() : ""}
        onChangeWeight={(value) =>
          setFormData({
            ...formData,
            weight: {
              value: Number(value),
              unit: formData.weight?.unit || "kg",
            },
          })
        }
        onChangeUnit={(option) =>
          setFormData({
            ...formData,
            weight: {
              value: formData.weight?.value ?? 0,
              unit: option?.value ?? "kg",
            },
          })
        }
      />
    </View>
  );
}

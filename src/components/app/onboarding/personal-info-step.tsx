import { OnboardingFormData } from "@/app/(onboarding)";
import { calculateAge } from "@/utils/calculateAge";
import * as React from "react";
import { View } from "react-native";
import { BirthDateField } from "../profile/birth-date-field";
import { HeightField } from "../profile/height-field";
import { WeightField } from "../profile/weight-field";

const MIN_AGE = 16;

export function PersonalInfoStep({
  formData,
  setFormData,
  showErrors = false,
}: {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
  showErrors?: boolean;
}) {
  const age = formData.birthDate ? calculateAge(formData.birthDate) : null;
  const isBirthDateMissing = showErrors && !formData.birthDate;
  const isUnderAge =
    showErrors && formData.birthDate && (age === null || age < MIN_AGE);
  const isBirthDateInvalid = !!(isBirthDateMissing || isUnderAge);

  let errorMessage: string | undefined;
  if (isBirthDateMissing) {
    errorMessage = "Date of birth is required";
  } else if (isUnderAge) {
    errorMessage = `You must be at least ${MIN_AGE} years old to use this app`;
  }

  return (
    <View className="gap-5">
      <BirthDateField
        value={formData.birthDate}
        onChange={(value) => setFormData({ ...formData, birthDate: value })}
        error={isBirthDateInvalid}
        errorMessage={errorMessage}
        minAge={MIN_AGE}
        required
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

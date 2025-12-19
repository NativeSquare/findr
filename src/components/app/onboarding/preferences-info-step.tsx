import { OnboardingFormData } from "@/app/(onboarding)";
import * as React from "react";
import { View } from "react-native";
import { BodyTypesField } from "../profile/body-types-field";
import { EthnicityField } from "../profile/ethnicity-field";
import { LookingForField } from "../profile/looking-for-field";
import { PositionField } from "../profile/position-field";
import { SexualOrientationField } from "../profile/sexual-orientation-field";

export function PreferencesInfoStep({
  formData,
  setFormData,
}: {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
}) {
  return (
    <View className="gap-5">
      <BodyTypesField
        onSelect={(option) =>
          setFormData({
            ...formData,
            bodyTypes: formData.bodyTypes?.includes(option)
              ? formData.bodyTypes?.filter((type) => type !== option)
              : [...(formData.bodyTypes || []), option],
          })
        }
        isSelected={(option) => formData.bodyTypes?.includes(option) ?? false}
      />

      <SexualOrientationField
        onSelect={(option) =>
          setFormData({
            ...formData,
            orientation: option,
          })
        }
        isSelected={(option) => formData.orientation === option}
      />

      <PositionField
        onSelect={(option) =>
          setFormData({
            ...formData,
            position: formData.position?.includes(option)
              ? formData.position?.filter((type) => type !== option)
              : [...(formData.position || []), option],
          })
        }
        isSelected={(option) => formData.position?.includes(option) ?? false}
      />

      <EthnicityField
        onSelect={(option) =>
          setFormData({
            ...formData,
            ethnicity: formData.ethnicity?.includes(option)
              ? formData.ethnicity?.filter((type) => type !== option)
              : [...(formData.ethnicity || []), option],
          })
        }
        isSelected={(option) => formData.ethnicity?.includes(option) ?? false}
      />

      <LookingForField
        onSelect={(option) =>
          setFormData({
            ...formData,
            lookingFor: formData.lookingFor?.includes(option)
              ? formData.lookingFor?.filter((type) => type !== option)
              : [...(formData.lookingFor || []), option],
          })
        }
        isSelected={(option) => formData.lookingFor?.includes(option) ?? false}
      />
    </View>
  );
}

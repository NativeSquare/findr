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
  showErrors,
}: {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
  showErrors?: boolean;
}) {
  return (
    <View className="gap-5">
      <BodyTypesField
        onSelect={(option) =>
          setFormData({
            ...formData,
            bodyTypes: formData.bodyTypes === option ? undefined : option,
          })
        }
        isSelected={(option) => formData.bodyTypes === option}
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
            position: formData.position === option ? undefined : option,
          })
        }
        isSelected={(option) => formData.position === option}
      />

      <EthnicityField
        onSelect={(option) =>
          setFormData({
            ...formData,
            ethnicity: formData.ethnicity === option ? undefined : option,
          })
        }
        isSelected={(option) => formData.ethnicity === option}
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

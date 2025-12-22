import { EditProfileFormData } from "@/app/(app)/edit-profile";
import React from "react";
import { View } from "react-native";
import { BirthDateField } from "../profile/birth-date-field";
import { BioField } from "../profile/bio-field";
import { HeightField } from "../profile/height-field";
import { NameField } from "../profile/name-field";
import { WeightField } from "../profile/weight-field";

export function PersonalInfoTab({
  formData,
  setFormData,
}: {
  formData: EditProfileFormData;
  setFormData: (data: EditProfileFormData) => void;
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

      <BirthDateField
        value={formData.birthDate}
        onChange={(value) => setFormData({ ...formData, birthDate: value })}
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

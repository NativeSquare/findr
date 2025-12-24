import { OnboardingFormData } from "@/app/(onboarding)";
import { OptionSwitch } from "@/components/shared/option-switch";
import { Separator } from "@/components/ui/separator";
import * as React from "react";
import { View } from "react-native";

export function PrivacyInfoStep({
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
      <View className="gap-3">
        <View className="flex-col flex-wrap gap-4">
          <OptionSwitch
            nativeID="hideProfileFromDiscovery"
            label="Hide my profile from research"
            isChecked={formData.privacy?.hideProfileFromDiscovery ?? false}
            onCheckedChange={() =>
              setFormData({
                ...formData,
                privacy: {
                  ...formData.privacy,
                  hideProfileFromDiscovery:
                    !formData.privacy?.hideProfileFromDiscovery,
                },
              })
            }
          />
          <Separator />
          <OptionSwitch
            nativeID="hideAge"
            label="Hide age"
            isChecked={formData.privacy?.hideAge ?? false}
            onCheckedChange={() =>
              setFormData({
                ...formData,
                privacy: {
                  ...formData.privacy,
                  hideAge: !formData.privacy?.hideAge,
                },
              })
            }
          />
          <Separator />
          <OptionSwitch
            nativeID="hideDistance"
            label="Hide distance"
            isChecked={formData.privacy?.hideDistance ?? false}
            onCheckedChange={() =>
              setFormData({
                ...formData,
                privacy: {
                  ...formData.privacy,
                  hideDistance: !formData.privacy?.hideDistance,
                },
              })
            }
          />
          <Separator />
          <OptionSwitch
            nativeID="hideOnlineStatus"
            label="Hide online status"
            isChecked={formData.privacy?.hideOnlineStatus ?? false}
            onCheckedChange={() =>
              setFormData({
                ...formData,
                privacy: {
                  ...formData.privacy,
                  hideOnlineStatus: !formData.privacy?.hideOnlineStatus,
                },
              })
            }
          />
        </View>
      </View>
    </View>
  );
}

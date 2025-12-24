import { AddMorePhotosStep } from "@/components/app/onboarding/add-more-photos-step";
import { AddPhotoStep } from "@/components/app/onboarding/add-photo-step";
import { BasicInfoStep } from "@/components/app/onboarding/basic-info-step";
import { PersonalInfoStep } from "@/components/app/onboarding/personal-info-step";
import { PreferencesInfoStep } from "@/components/app/onboarding/preferences-info-step";
import { PrivacyInfoStep } from "@/components/app/onboarding/privacy-info-step";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "expo-superwall";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { ScrollView, View } from "react-native";

export type OnboardingFormData = Partial<
  Pick<
    Doc<"users">,
    | "image"
    | "name"
    | "bio"
    | "birthDate"
    | "height"
    | "weight"
    | "bodyTypes"
    | "orientation"
    | "position"
    | "ethnicity"
    | "lookingFor"
    | "privacy"
    | "profilePictures"
  >
>;

export default function Onboarding() {
  const { signOut } = useAuthActions();
  const { signOut: signOutSuperwall } = useUser();
  const user = useQuery(api.users.currentUser);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [showErrors, setShowErrors] = React.useState(false);
  const [formData, setFormData] = React.useState<OnboardingFormData>({
    image: user?.image,
    name: user?.name,
    bio: user?.bio,
    birthDate: user?.birthDate,
    height: user?.height,
    weight: user?.weight,
    bodyTypes: user?.bodyTypes,
    orientation: user?.orientation,
    position: user?.position,
    ethnicity: user?.ethnicity,
    lookingFor: user?.lookingFor,
    privacy: user?.privacy,
    profilePictures: user?.profilePictures,
  });
  const patchUser = useMutation(api.users.patch);

  const steps = [
    { component: AddPhotoStep, id: "photos", canSkip: true },
    { component: BasicInfoStep, id: "basic", canSkip: true },
    { component: PersonalInfoStep, id: "personal", canSkip: true },
    { component: PreferencesInfoStep, id: "preferences", canSkip: true },
    { component: PrivacyInfoStep, id: "privacy", canSkip: true },
    { component: AddMorePhotosStep, id: "more-photos", canSkip: true },
  ];
  const CurrentStepComponent = steps[currentStep].component;

  const goBack = () => {
    if (currentStep > 0) {
      setShowErrors(false);
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    } else {
      signOut();
      signOutSuperwall();
    }
  };

  const validateCurrentStep = (data?: OnboardingFormData): boolean => {
    const step = steps[currentStep];
    const dataToValidate = data ?? formData;

    // Validate BasicInfoStep - name is required
    if (step.id === "basic") {
      return !!dataToValidate.name?.trim();
    }

    // Validate PersonalInfoStep - birthDate is required
    if (step.id === "personal") {
      return !!dataToValidate.birthDate;
    }

    // Other steps can be skipped
    return true;
  };

  const goNext = () => {
    if (!validateCurrentStep()) {
      setShowErrors(true);
      return; // Don't proceed if validation fails
    }

    setShowErrors(false);
    if (currentStep === steps.length - 1) {
      handleComplete();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleSkip = () => {
    if (!user?._id) return;
    patchUser({ id: user._id, data: { hasCompletedOnboarding: true } });
  };

  const handleComplete = () => {
    if (!user?._id) return;
    patchUser({ id: user._id, data: formData });
    patchUser({ id: user._id, data: { hasCompletedOnboarding: true } });
  };

  const renderHeader = () => {
    const progress = ((currentStep + 1) / steps.length) * 100;
    return (
      <View className="gap-3 pt-2">
        <View className="flex-row items-center justify-between">
          <Button variant="ghost" onPress={goBack}>
            <Icon as={ChevronLeft} size={24} />
          </Button>

          <Button variant="ghost" onPress={handleSkip}>
            <Text className="text-sm font-medium text-foreground">Skip</Text>
          </Button>
        </View>
        <Progress
          value={progress}
          className="h-[3px] bg-primary/20"
          indicatorClassName="bg-primary"
        />
      </View>
    );
  };

  const renderFooter = () => {
    return (
      <View className="flex-row gap-3">
        {currentStep > 0 && (
          <Button
            variant="outline"
            className="flex-1 border-primary/80"
            onPress={goBack}
          >
            <Text className="text-primary">Back</Text>
          </Button>
        )}
        <Button
          className="flex-1"
          onPress={goNext}
          disabled={!validateCurrentStep()}
        >
          <Text className="text-primary-foreground">Continue</Text>
        </Button>
      </View>
    );
  };

  return (
    <View className="flex-1 mt-safe">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        contentContainerClassName="px-4 pb-6"
      >
        <View className="w-full max-w-md self-center flex-1 gap-8">
          {renderHeader()}
          <View className="flex-1">
            <CurrentStepComponent
              formData={formData}
              setFormData={(data) => {
                setFormData(data);
                // Clear errors when form data changes and validation passes
                if (showErrors && validateCurrentStep(data)) {
                  setShowErrors(false);
                }
              }}
              showErrors={showErrors}
            />
          </View>
        </View>
      </ScrollView>
      <View className="w-full max-w-md self-center px-4 pb-4 mb-safe">
        {renderFooter()}
      </View>
    </View>
  );
}

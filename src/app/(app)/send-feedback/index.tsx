import { DescribeFeedbackField } from "@/components/app/feedback/describe-feedback";
import { FeedbackTypeField } from "@/components/app/feedback/feedback-type";
import { PhotoGrid } from "@/components/shared/photo-grid";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";

export type FeedbackFormData = {
  type?: string;
  feedbackText?: string;
  feedbackImages?: string[];
};

export default function SendFeedback() {
  const bottomSheetModalRef = React.useRef<GorhomBottomSheetModal>(null);
  const [formData, setFormData] = React.useState<FeedbackFormData>();

  const handleSubmit = () => {
    // TODO: Implement feedback submission
    console.log("Feedback submitted:", {
      type: formData?.type,
      text: formData?.feedbackText,
      images: formData?.feedbackImages,
    });
    router.dismissTo("/profile");
  };

  const handleFeedbackImagesChange = (images: string[]) => {
    setFormData({
      ...formData,
      feedbackImages: images,
    });
  };

  const renderHeader = () => {
    return (
      <View className="flex-row items-center justify-between px-5 pt-6">
        <Pressable
          onPress={() => router.dismissTo("/profile")}
          className="size-6"
        >
          <Icon as={ChevronLeft} size={24} className="text-white" />
        </Pressable>
        <Text className="text-xl font-medium text-white">Send Feedback</Text>
        <View className="size-6" />
      </View>
    );
  };

  const renderFooter = () => {
    return (
      <Button className="w-full" onPress={handleSubmit}>
        <Text className="text-base font-medium text-primary-foreground">
          Submit
        </Text>
      </Button>
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
        <View className="w-full max-w-md self-center flex flex-1 gap-6">
          {renderHeader()}

          <Text className="text-sm font-normal leading-[20px] text-[#d1d1d6]">
            Tell us what you think. Your feedback helps improve the app.
          </Text>

          <FeedbackTypeField
            onSelect={(option) =>
              setFormData({
                ...formData,
                type: option,
              })
            }
            isSelected={(option) => formData?.type === option}
          />

          <DescribeFeedbackField
            value={formData?.feedbackText}
            onChange={(value) =>
              setFormData({
                ...formData,
                feedbackText: value,
              })
            }
          />

          <PhotoGrid
            photos={formData?.feedbackImages ?? []}
            onPhotosChange={handleFeedbackImagesChange}
            maxPhotos={3}
            columnsPerRow={3}
            label="Add Photos"
            bottomSheetModalRef={bottomSheetModalRef}
            uploadOptions={["camera", "gallery"]}
          />
        </View>
      </ScrollView>

      <View className="w-full max-w-md self-center px-4 pb-4 mb-safe">
        {renderFooter()}
      </View>
    </View>
  );
}

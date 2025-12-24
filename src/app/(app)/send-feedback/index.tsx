import { DescribeFeedbackField } from "@/components/app/feedback/describe-feedback";
import { FeedbackTypeField } from "@/components/app/feedback/feedback-type";
import { PhotoGrid } from "@/components/shared/photo-grid";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { getConvexErrorMessage } from "@/utils/getConvexErrorMessage";
import { FeedbackSchema } from "@/validation/feedback";
import { api } from "@convex/_generated/api";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { useAction } from "convex/react";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import z from "zod";

export type FeedbackFormData = {
  type?: string;
  feedbackText?: string;
  feedbackImages?: string[];
};

export default function SendFeedback() {
  const bottomSheetModalRef = React.useRef<GorhomBottomSheetModal>(null);
  const [formData, setFormData] = React.useState<FeedbackFormData>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<{
    type?: string;
    feedbackText?: string;
  }>({});
  const sendFeedback = useAction(api.feedback.sendFeedback);

  const handleSubmit = async () => {
    setError(null);
    setFieldErrors({});

    // Field Validation
    const result = FeedbackSchema.safeParse({
      type: formData?.type ?? "",
      feedbackText: formData?.feedbackText ?? "",
      feedbackImages: formData?.feedbackImages,
    });

    if (!result.success) {
      const tree = z.treeifyError(result.error);

      setFieldErrors({
        type: tree.properties?.type?.errors?.[0],
        feedbackText: tree.properties?.feedbackText?.errors?.[0],
      });
      setError(tree.errors?.[0] ?? null);
      return;
    }

    setIsLoading(true);

    try {
      await sendFeedback({
        type: formData?.type,
        feedbackText: formData?.feedbackText,
        feedbackImages: formData?.feedbackImages,
      });
      router.dismissTo("/profile");
    } catch (err) {
      setError(getConvexErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
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
      <View className="gap-2">
        {error && (
          <Text className="text-sm text-destructive text-center">{error}</Text>
        )}
        <Button className="w-full" onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text>Submit</Text>
          )}
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
            error={fieldErrors.type}
          />

          <DescribeFeedbackField
            value={formData?.feedbackText}
            onChange={(value) =>
              setFormData({
                ...formData,
                feedbackText: value,
              })
            }
            error={fieldErrors.feedbackText}
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

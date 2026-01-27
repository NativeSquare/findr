import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useCachedPictures } from "@/hooks/use-cached-pictures";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { CachedPicturesGrid } from "./cached-pictures-grid";

export const ManageCachedPicturesSheet = forwardRef<GorhomBottomSheetModal>(
  (_, ref) => {
    const { cachedPictures, isLoading, removeFromCache, clearCache } =
      useCachedPictures();

    const handleDelete = (id: string) => {
      Alert.alert(
        "Delete Picture",
        "Are you sure you want to remove this picture from cache?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => removeFromCache(id),
          },
        ]
      );
    };

    const handleClearAll = () => {
      Alert.alert(
        "Clear All Cached Pictures",
        `Are you sure you want to remove all ${cachedPictures.length} cached pictures?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear All",
            style: "destructive",
            onPress: () => clearCache(),
          },
        ]
      );
    };

    return (
      <BottomSheetModal ref={ref} snapPoints={["50%", "80%"]}>
        <View className="flex-1 pb-6">
          <View className="px-4 pb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-semibold text-foreground">
                Cached Pictures
              </Text>
              <Text className="text-sm text-muted-foreground">
                {cachedPictures.length} picture
                {cachedPictures.length !== 1 ? "s" : ""} cached
              </Text>
            </View>
            {cachedPictures.length > 0 && (
              <Button variant="destructive" size="sm" onPress={handleClearAll}>
                <Text className="text-sm font-medium text-destructive-foreground">
                  Clear All
                </Text>
              </Button>
            )}
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <CachedPicturesGrid
                pictures={cachedPictures}
                mode="edit"
                layout="grid"
                thumbnailSize={100}
                onDelete={handleDelete}
                emptyStateMessage="No cached pictures yet. Pictures you send will appear here."
              />
            </ScrollView>
          )}
        </View>
      </BottomSheetModal>
    );
  }
);

ManageCachedPicturesSheet.displayName = "ManageCachedPicturesSheet";

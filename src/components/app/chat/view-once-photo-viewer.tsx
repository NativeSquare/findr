import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { X } from "lucide-react-native";
import * as React from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StatusBar,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ViewOncePhotoViewerProps {
  visible: boolean;
  imageUrl: string | null;
  isLoading?: boolean;
  onClose: () => void;
}

export function ViewOncePhotoViewer({
  visible,
  imageUrl,
  isLoading = false,
  onClose,
}: ViewOncePhotoViewerProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View className="flex-1 bg-black">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#fff" />
            <Text className="text-white mt-4">Loading photo...</Text>
          </View>
        ) : imageUrl ? (
          <>
            {/* Full screen image */}
            <Image
              source={{ uri: imageUrl }}
              style={{ width: screenWidth, height: screenHeight }}
              resizeMode="contain"
              className="absolute inset-0"
            />

            {/* Top controls */}
            <View
              className="absolute left-0 right-0 flex-row items-center justify-between px-5"
              style={{ top: insets.top + 20 }}
            >
              {/* Close button */}
              <Pressable
                onPress={onClose}
                className="h-9 w-9 items-center justify-center rounded-full bg-black/30"
              >
                <Icon as={X} size={24} className="text-white" />
              </Pressable>

              {/* View once indicator */}
              <View className="flex-row items-center gap-2 rounded-full bg-black/30 px-3 py-1.5">
                <ViewOnceIcon />
                <Text className="text-white text-sm">View once</Text>
              </View>
            </View>

            {/* Bottom info */}
            <View
              className="absolute left-0 right-0 items-center px-5"
              style={{ bottom: insets.bottom + 40 }}
            >
              <View className="rounded-full bg-black/50 px-4 py-2">
                <Text className="text-white/80 text-sm text-center">
                  This photo will disappear after you close it
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white">Photo not available</Text>
            <Pressable
              onPress={onClose}
              className="mt-4 rounded-full bg-white/20 px-6 py-2"
            >
              <Text className="text-white">Close</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

function ViewOnceIcon() {
  return (
    <View className="relative h-5 w-5 items-center justify-center">
      {/* Circle outline */}
      <View className="absolute h-5 w-5 rounded-full border-2 border-white" />
      {/* Number 1 in center */}
      <Text className="text-[10px] text-white font-semibold">1</Text>
    </View>
  );
}

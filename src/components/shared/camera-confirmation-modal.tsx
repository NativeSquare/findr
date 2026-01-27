import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { X } from "lucide-react-native";
import * as React from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StatusBar,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface CapturedImage {
  uri: string;
  width?: number;
  height?: number;
}

interface CameraConfirmationModalProps {
  visible: boolean;
  image: CapturedImage | null;
  onConfirm: () => void;
  onRetake: () => void;
  onClose: () => void;
  showViewOnce?: boolean;
  onToggleViewOnce?: () => void;
  isViewOnce?: boolean;
  /** Custom label for the retake/reselect button (default: "Retake") */
  retakeLabel?: string;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function CameraConfirmationModal({
  visible,
  image,
  onConfirm,
  onRetake,
  onClose,
  showViewOnce = false,
  isViewOnce = false,
  onToggleViewOnce,
  retakeLabel = "Retake",
}: CameraConfirmationModalProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    if (visible) {
      setCurrentTime(new Date());
    }
  }, [visible]);

  if (!image) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View className="flex-1 bg-black">
        {/* Full screen image */}
        <Image
          source={{ uri: image.uri }}
          style={{ width: screenWidth, height: screenHeight }}
          resizeMode="cover"
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

          {/* Right side controls */}
          <View className="flex-row items-center gap-2">
            {/* View once toggle */}
            {showViewOnce && (
              <Pressable
                onPress={onToggleViewOnce}
                className="flex-row items-center rounded-full bg-black/30 p-1.5"
              >
                <View className="h-6 w-6 items-center justify-center">
                  <ViewOnceIcon active={isViewOnce} />
                </View>
              </Pressable>
            )}

            {/* Send button */}
            <Button
              onPress={onConfirm}
              className="bg-primary px-5 py-2"
            >
              <Text className="text-sm font-medium text-black">Send</Text>
            </Button>
          </View>
        </View>

        {/* Bottom timestamp */}
        <View
          className="absolute right-5 rounded-full bg-black/30 px-4 py-2"
          style={{ bottom: insets.bottom + 20 }}
        >
          <Text className="text-sm text-white">{formatTime(currentTime)}</Text>
        </View>

        {/* Retake/Reselect button - bottom left */}
        <View
          className="absolute left-5"
          style={{ bottom: insets.bottom + 20 }}
        >
          <Pressable
            onPress={onRetake}
            className="rounded-full bg-black/30 px-4 py-2"
          >
            <Text className="text-sm text-white">{retakeLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ViewOnceIcon({ active }: { active: boolean }) {
  return (
    <View className="relative h-6 w-6 items-center justify-center">
      {/* Circle outline */}
      <View
        className={`absolute h-6 w-6 rounded-full border-2 ${
          active ? "border-white" : "border-white/50"
        }`}
      />
      {/* Number 1 in center */}
      <Text
        className={`text-xs ${active ? "text-white" : "text-white/50"}`}
      >
        1
      </Text>
    </View>
  );
}

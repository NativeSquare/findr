import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { CameraCapturedPicture } from "expo-camera";
import { CameraView, useCameraPermissions } from "expo-camera";
import { RefreshCw, X, Zap, ZapOff } from "lucide-react-native";
import * as React from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  StatusBar,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoTaken: (photo: CameraCapturedPicture) => void;
}

export function CameraModal({
  visible,
  onClose,
  onPhotoTaken,
}: CameraModalProps) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);
  const [cameraReady, setCameraReady] = React.useState(false);
  const [facing, setFacing] = React.useState<"front" | "back">("back");
  const [flash, setFlash] = React.useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = React.useState(false);

  // Request permission when modal opens
  React.useEffect(() => {
    if (visible && permission && !permission.granted) {
      requestPermission();
    }
  }, [visible, permission, requestPermission]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!visible) {
      setCameraReady(false);
      setIsTakingPhoto(false);
    }
  }, [visible]);

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current || !cameraReady || isTakingPhoto) return;

    setIsTakingPhoto(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0,
        skipProcessing: false,
      });

      if (photo) {
        onPhotoTaken(photo);
      }
    } catch (error) {
      console.error("Failed to take picture:", error);
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((prev) => !prev);
  };

  // Permission states
  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide" statusBarTranslucent>
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="white" />
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" statusBarTranslucent>
        <StatusBar barStyle="light-content" />
        <View className="flex-1 items-center justify-center bg-black px-8">
          <Text className="mb-4 text-center text-lg text-white">
            Camera permission is required to take photos
          </Text>
          <View className="flex-row gap-3">
            <Button variant="outline" onPress={onClose}>
              <Text>Cancel</Text>
            </Button>
            <Button onPress={() => Linking.openSettings()}>
              <Text>Open Settings</Text>
            </Button>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <View className="flex-1 bg-black">
        {/* Camera View */}
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
          enableTorch={flash}
          onCameraReady={handleCameraReady}
        />

        {/* Top controls */}
        <View
          className="absolute left-0 right-0 flex-row items-center justify-between px-5"
          style={{ top: insets.top + 12 }}
        >
          {/* Close button */}
          <Pressable
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
          >
            <Icon as={X} size={24} className="text-white" />
          </Pressable>

          {/* Flash toggle */}
          <Pressable
            onPress={toggleFlash}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
          >
            <Icon
              as={flash ? Zap : ZapOff}
              size={24}
              className={flash ? "text-yellow-400" : "text-white"}
            />
          </Pressable>
        </View>

        {/* Bottom controls */}
        <View
          className="absolute bottom-0 left-0 right-0 flex-row items-center justify-center pb-8"
          style={{ paddingBottom: insets.bottom + 32 }}
        >
          {/* Flip camera button */}
          <Pressable
            onPress={toggleFacing}
            className="absolute left-8 h-12 w-12 items-center justify-center rounded-full bg-black/40"
          >
            <Icon as={RefreshCw} size={24} className="text-white" />
          </Pressable>

          {/* Capture button */}
          <Pressable
            onPress={handleTakePhoto}
            disabled={!cameraReady || isTakingPhoto}
            className="h-20 w-20 items-center justify-center rounded-full border-4 border-white"
          >
            <View
              className={`h-16 w-16 rounded-full ${
                isTakingPhoto ? "bg-white/50" : "bg-white"
              }`}
            />
          </Pressable>

          {/* Placeholder for symmetry */}
          <View className="absolute right-8 h-12 w-12" />
        </View>

        {/* Loading overlay when taking photo */}
        {isTakingPhoto && (
          <View className="absolute inset-0 items-center justify-center bg-black/30">
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
      </View>
    </Modal>
  );
}

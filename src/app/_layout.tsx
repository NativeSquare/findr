import "@/lib/nativewind-interop";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { ConvexReactClient, useConvexAuth, useQuery } from "convex/react";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { SuperwallProvider, useUser } from "expo-superwall";
import * as React from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "./global.css";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <ConvexAuthProvider
        client={convex}
        storage={
          Platform.OS === "android" || Platform.OS === "ios"
            ? secureStorage
            : undefined
        }
      >
        <SuperwallProvider
          apiKeys={{
            ios: process.env.EXPO_PUBLIC_SUPERWALL_IOS_API_KEY,
            android: process.env.EXPO_PUBLIC_SUPERWALL_ANDROID_API_KEY,
          }}
        >
          <GestureHandlerRootView>
            <BottomSheetModalProvider>
              <RootStack />
              <PortalHost />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </SuperwallProvider>
      </ConvexAuthProvider>
    </KeyboardProvider>
  );
}

function RootStack() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.functions.currentUser);
  const hasCompletedOnboarding = user?.hasCompletedOnboarding ?? false;
  const { identify } = useUser();

  React.useEffect(() => {
    if (user?._id) {
      identify(user._id);
    }
  }, [user?._id]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "fade_from_bottom" }}
    >
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && !hasCompletedOnboarding}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && hasCompletedOnboarding}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

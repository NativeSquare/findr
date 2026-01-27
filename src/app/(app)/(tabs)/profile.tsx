import { DeleteAccountBottomSheet } from "@/components/app/settings/delete-account-bottom-sheet";
import { ManageCachedPicturesSheet } from "@/components/app/settings/manage-cached-pictures-sheet";
import { MeasurementSystemRow } from "@/components/app/settings/measurement-system-row";
import { MeasurementSystemSheet } from "@/components/app/settings/measurement-system-sheet";
import {
    SettingItem,
    SettingsRow,
} from "@/components/app/settings/settings-row";
import { Text } from "@/components/ui/text";
import type { MeasurementSystem } from "@/utils/measurements";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/_generated/api";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import {
    File,
    FileText,
    Images,
    LockOpen,
    LogOut,
    MessageCircle,
    Pencil,
    ShieldCheck,
    UserMinus,
    XCircle,
} from "lucide-react-native";
import React from "react";
import { Alert, ScrollView, View } from "react-native";

export default function Profile() {
  const { signOut } = useAuthActions();
  const deleteUser = useMutation(api.users.del);
  const patchUser = useMutation(api.users.patch);
  const user = useQuery(api.users.currentUser);
  const deleteAccountBottomSheetRef =
    React.useRef<GorhomBottomSheetModal>(null);
  const measurementSystemSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const cachedPicturesSheetRef = React.useRef<GorhomBottomSheetModal>(null);

  const handleMeasurementSystemChange = React.useCallback(
    async (system: MeasurementSystem) => {
      if (!user?._id) return;
      await patchUser({ id: user._id, data: { measurementSystem: system } });
    },
    [user?._id, patchUser]
  );

  const handleDeleteAccount = React.useCallback(() => {
    deleteAccountBottomSheetRef.current?.present();
  }, []);

  const handleConfirmDeleteAccount = React.useCallback(() => {
    if (!user?._id) return;
    deleteUser({ id: user._id });
  }, []);

  const handleLogout = React.useCallback(() => {
    signOut();
  }, [signOut]);

  const handleCancelSubscription = React.useCallback(() => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your subscription?",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Cancel Subscription",
              "This action will be available soon."
            );
          },
        },
      ]
    );
  }, []);

  const settingsItems: SettingItem[] = [
    {
      label: "Edit Profile",
      icon: Pencil,
      onPress: () => router.push("/edit-profile"),
    },
    {
      label: "Cached Pictures",
      icon: Images,
      onPress: () => cachedPicturesSheetRef.current?.present(),
    },
    {
      label: "Terms & Conditions",
      icon: FileText,
      onPress: () => {},
    },
    {
      label: "Privacy Policy",
      icon: ShieldCheck,
      onPress: () => {},
    },
    {
      label: "Send Feedback",
      icon: MessageCircle,
      onPress: () => router.push("/send-feedback"),
    },
    {
      label: "First Sentence Page",
      icon: File,
      onPress: () => router.push("/first-sentences"),
    },
    {
      label: "Permission Page",
      icon: LockOpen,
      onPress: () => router.push("/permissions"),
    },
    {
      label: "Cancel Subscription",
      icon: XCircle,
      destructive: true,
      onPress: handleCancelSubscription,
    },
    {
      label: "Delete Account",
      icon: UserMinus,
      destructive: true,
      onPress: handleDeleteAccount,
    },
    {
      label: "Log Out",
      icon: LogOut,
      destructive: true,
      onPress: handleLogout,
    },
  ];

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="pt-safe px-5 pb-10"
      keyboardDismissMode="interactive"
      className="flex-1"
    >
      <View className="w-full max-w-2xl self-center gap-5">
        <Text className="text-xl font-medium leading-[30px] text-white mt-5">
          Profile Settings
        </Text>

        <View className="flex-col">
          <MeasurementSystemRow
            value={user?.measurementSystem ?? "metric"}
            onPress={() => measurementSystemSheetRef.current?.present()}
          />
          {settingsItems.map((item) => (
            <SettingsRow key={item.label} {...item} />
          ))}
        </View>
      </View>

      <DeleteAccountBottomSheet
        bottomSheetModalRef={deleteAccountBottomSheetRef}
        onConfirm={handleConfirmDeleteAccount}
      />

      <MeasurementSystemSheet
        ref={measurementSystemSheetRef}
        value={user?.measurementSystem ?? "metric"}
        onChange={handleMeasurementSystemChange}
      />

      <ManageCachedPicturesSheet ref={cachedPicturesSheetRef} />
    </ScrollView>
  );
}

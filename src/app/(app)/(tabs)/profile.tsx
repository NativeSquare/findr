import {
  SettingItem,
  SettingsRow,
} from "@/components/app/settings/settings-row";
import { Text } from "@/components/ui/text";
import { useAuthActions } from "@convex-dev/auth/react";
import { router } from "expo-router";
import { useUser } from "expo-superwall";
import {
  File,
  FileText,
  Key,
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
  const { signOut: signOutSuperwall } = useUser();

  const handleDeleteAccount = React.useCallback(() => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Delete Account",
              "This action will be available soon."
            );
          },
        },
      ]
    );
  }, []);

  const handleLogout = React.useCallback(() => {
    signOut();
    signOutSuperwall();
  }, [signOut, signOutSuperwall]);

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
      label: "Reset Password",
      icon: Key,
      onPress: () => {},
    },
    {
      label: "Send Feedback",
      icon: MessageCircle,
      onPress: () => {},
    },
    {
      label: "First Sentence Page",
      icon: File,
      onPress: () => {},
    },
    {
      label: "Permission Page",
      icon: LockOpen,
      onPress: () => {},
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
      className="flex-1 bg-black"
    >
      <View className="w-full max-w-2xl self-center gap-5">
        <Text className="text-xl font-medium leading-[30px] text-white mt-5">
          Profile Settings
        </Text>

        <View className="flex-col">
          {settingsItems.map((item) => (
            <SettingsRow key={item.label} {...item} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

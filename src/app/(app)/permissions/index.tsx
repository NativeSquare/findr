import { OptionSwitch } from "@/components/shared/option-switch";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";

export type PermissionsFormData = {
  hideProfileFromDiscovery?: boolean;
  hideAge?: boolean;
  hideDistance?: boolean;
  hideOnlineStatus?: boolean;
};

export default function Permissions() {
  const user = useQuery(api.functions.currentUser);
  const updateUserPermissions = useMutation(
    api.functions.updateUserPermissions
  );

  const renderHeader = () => {
    return (
      <View className="flex-row items-center justify-between px-5 pt-6">
        <Pressable
          onPress={() => router.dismissTo("/profile")}
          className="size-6"
        >
          <Icon as={ChevronLeft} size={24} className="text-white" />
        </Pressable>
        <Text className="text-xl font-medium text-white">Permissions</Text>
        <View className="size-6" />
      </View>
    );
  };

  if (!user?._id) return null;

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

          <View className="gap-5">
            <View className="gap-3">
              <View className="flex-col flex-wrap gap-4">
                <OptionSwitch
                  nativeID="hideProfileFromDiscovery"
                  label="Hide my profile from research"
                  isChecked={user?.privacy?.hideProfileFromDiscovery ?? false}
                  onCheckedChange={(checked) =>
                    updateUserPermissions({
                      userId: user?._id,
                      data: {
                        privacy: {
                          ...user?.privacy,
                          hideProfileFromDiscovery: checked,
                        },
                      },
                    })
                  }
                />
                <Separator />
                <OptionSwitch
                  nativeID="hideAge"
                  label="Hide age"
                  isChecked={user?.privacy?.hideAge ?? false}
                  onCheckedChange={(checked) =>
                    updateUserPermissions({
                      userId: user?._id,
                      data: {
                        privacy: {
                          ...user?.privacy,
                          hideAge: checked,
                        },
                      },
                    })
                  }
                />
                <Separator />
                <OptionSwitch
                  nativeID="hideDistance"
                  label="Hide distance"
                  isChecked={user?.privacy?.hideDistance ?? false}
                  onCheckedChange={(checked) =>
                    updateUserPermissions({
                      userId: user?._id,
                      data: {
                        privacy: {
                          ...user?.privacy,
                          hideDistance: checked,
                        },
                      },
                    })
                  }
                />
                <Separator />
                <OptionSwitch
                  nativeID="hideOnlineStatus"
                  label="Hide online status"
                  isChecked={user?.privacy?.hideOnlineStatus ?? false}
                  onCheckedChange={(checked) =>
                    updateUserPermissions({
                      userId: user?._id,
                      data: {
                        privacy: {
                          ...user?.privacy,
                          hideOnlineStatus: checked,
                        },
                      },
                    })
                  }
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

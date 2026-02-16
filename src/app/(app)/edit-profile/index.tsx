import { PersonalInfoTab } from "@/components/app/edit-profile/personal-info-tab";
import { PreferencesTab } from "@/components/app/edit-profile/preferences-tab";
import { ProfilePhotosSection } from "@/components/app/edit-profile/profile-photos-section";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { ChevronLeft, Eye } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";

export type EditProfileFormData = Partial<
  Pick<
    Doc<"users">,
    | "name"
    | "bio"
    | "birthDate"
    | "birthLocation"
    | "height"
    | "weight"
    | "position"
    | "ethnicity"
    | "relationshipStatus"
    | "profilePictures"
    | "bodyTypes"
    | "orientation"
    | "lookingFor"
  >
>;

type TabValue = "personal" | "preferences";

export default function EditProfile() {
  const user = useQuery(api.users.currentUser);
  const patchUser = useMutation(api.users.patch);
  const [activeTab, setActiveTab] = React.useState<TabValue>("personal");
  const [formData, setFormData] = React.useState<EditProfileFormData>({
    name: user?.name,
    bio: user?.bio,
    birthDate: user?.birthDate,
    birthLocation: user?.birthLocation,
    height: user?.height,
    weight: user?.weight,
    position: user?.position,
    ethnicity: user?.ethnicity,
    relationshipStatus: user?.relationshipStatus,
    profilePictures: user?.profilePictures,
    bodyTypes: user?.bodyTypes,
    orientation: user?.orientation,
    lookingFor: user?.lookingFor,
  });

  const renderHeader = () => {
    return (
      <View className="flex-row items-center justify-between px-5 py-6">
        <Pressable
          onPress={() => router.dismissTo("/profile")}
          className="size-6"
        >
          <Icon as={ChevronLeft} size={24} className="text-white" />
        </Pressable>
        <Text className="text-xl font-medium text-white">Edit Profile</Text>
        <Pressable
          onPress={() => router.push("/my-profile")}
          className="size-6"
        >
          <Icon as={Eye} size={24} className="text-white" />
        </Pressable>
      </View>
    );
  };

  const renderFooter = () => {
    return (
      <Button className="w-full" onPress={handleSave}>
        <Text className="text-base font-medium text-primary-foreground">
          Save
        </Text>
      </Button>
    );
  };

  const handleSave = async () => {
    if (!user?._id) return;
    await patchUser({ id: user._id, data: formData });
    router.back();
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
        <View className="w-full max-w-md self-center flex-1">
          {renderHeader()}

          <View className="gap-6">
            <ProfilePhotosSection
              formData={formData}
              setFormData={setFormData}
            />

            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as TabValue)}
            >
              <TabsList>
                {[
                  { value: "personal", label: "Personal info" },
                  { value: "preferences", label: "Preferences" },
                ].map((tab, index) => (
                  <TabsTrigger key={index} value={tab.value}>
                    <Text className="text-sm font-medium">{tab.label}</Text>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {activeTab === "personal" ? (
              <PersonalInfoTab formData={formData} setFormData={setFormData} />
            ) : (
              <PreferencesTab formData={formData} setFormData={setFormData} />
            )}
          </View>
        </View>
      </ScrollView>
      <View className="w-full max-w-md self-center px-4 pb-4 mb-safe">
        {renderFooter()}
      </View>
    </View>
  );
}

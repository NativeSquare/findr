import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { THEME } from "@/lib/theme";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Tabs } from "expo-router";
import { Flame, House, MessageCircle, User } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const totalUnreadCount = useQuery(api.messages.getTotalUnreadCount) ?? 0;

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        animation: "shift",
        sceneStyle: { backgroundColor: "transparent" },
        tabBarInactiveTintColor: THEME[colorScheme ?? "light"].tabbarForeground,
        tabBarActiveTintColor: THEME[colorScheme ?? "light"].tabbarPrimary,
        tabBarStyle: {
          backgroundColor: THEME[colorScheme ?? "light"].tabbar,
          borderTopColor: THEME[colorScheme ?? "light"].tabbarBorder,
          height: 60 + insets.bottom,
          paddingTop: 10,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="taps"
        options={{
          title: "Taps",
          tabBarIcon: ({ color }) => (
            <Icon as={Flame} color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Icon as={House} color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <View style={{ position: "relative" }}>
              <Icon as={MessageCircle} color={color} size={28} />
              {totalUnreadCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                  }}
                >
                  <Badge
                    variant="destructive"
                    className="min-w-[18px] h-[18px] px-1 rounded-full items-center justify-center border-0"
                  >
                    <Text className="text-[10px] font-semibold text-white leading-none">
                      {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                    </Text>
                  </Badge>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Icon as={User} color={color} size={28} />,
        }}
      />
    </Tabs>
  );
}

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Clock, MapPin } from "lucide-react-native";
import { Image, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock data - replace with Convex query
const MOCK_EVENT = {
  id: "1",
  title: "Beach Party",
  date: "Tuesday, 6:00 PM",
  location: "Santa Monica Beach",
  imageUri:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
  description:
    "Join us for a sunset beach party with music, good vibes, and great people. Relax, dance, and make unforgettable memories by the sea.",
  organizer: {
    name: "Phoenix Baker",
    avatarUri:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces",
  },
  mapImageUri:
    "https://maps.googleapis.com/maps/api/staticmap?center=Santa+Monica+Beach&zoom=14&size=700x250&maptype=roadmap&key=placeholder",
};

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  // TODO: Replace with real Convex query using id
  const event = MOCK_EVENT;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        {/* Hero Image */}
        <View className="relative h-[280px]">
          <Image
            source={{ uri: event.imageUri }}
            className="w-full h-full rounded-b-2xl"
            resizeMode="cover"
          />
          <Pressable
            onPress={() => router.back()}
            className="absolute bg-black/30 rounded-full size-9 items-center justify-center active:opacity-70"
            style={{ top: insets.top + 20, left: 20 }}
          >
            <Icon as={ArrowLeft} size={22} className="text-white" />
          </Pressable>
        </View>

        {/* Content */}
        <View className="px-5 gap-5 mt-5">
          {/* Title & Details */}
          <View className="gap-2">
            <Text className="text-lg font-medium text-white">
              {event.title}
            </Text>
            <View className="gap-1.5">
              <View className="flex-row items-center gap-1.5">
                <Icon as={Clock} size={22} className="text-[#d1d1d6]" />
                <Text className="text-base text-[#d1d1d6]">{event.date}</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Icon as={MapPin} size={22} className="text-[#d1d1d6]" />
                <Text className="text-base text-[#d1d1d6] flex-1">
                  {event.location}
                </Text>
              </View>
            </View>
          </View>

          {/* About Event */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-white">
              About Event
            </Text>
            <Text className="text-sm text-[#d1d1d6] leading-5">
              {event.description}
            </Text>
          </View>

          {/* Organizer */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-white">
              Organizer
            </Text>
            <View className="flex-row items-center gap-2">
              <Image
                source={{ uri: event.organizer.avatarUri }}
                className="size-10 rounded-full"
              />
              <Text className="text-sm text-[#d1d1d6]">
                {event.organizer.name}
              </Text>
            </View>
          </View>

          {/* Location Map */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-white">Location</Text>
            <View className="h-[124px] rounded-[10px] bg-[#1a1a1e] overflow-hidden items-center justify-center">
              <Ionicons name="map-outline" size={40} color="#70707b" />
              <Text className="text-xs text-[#70707b] mt-2">
                Map view available soon
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Join Button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-5 pb-2 bg-background"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <Button className="w-full py-3 bg-[#e56400]" onPress={() => {}}>
          <Text className="text-base font-medium text-black text-center">
            Join
          </Text>
        </Button>
      </View>
    </View>
  );
}

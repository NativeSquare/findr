import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { CalendarDays, Clock, MapPin } from "lucide-react-native";
import { Image, Pressable, View } from "react-native";
import { AttendeeAvatars } from "./attendee-avatars";

export type EventCardProps = {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUri: string;
  attendeeAvatars: string[];
  totalAttendees: number;
  hasJoined?: boolean;
  onPress?: () => void;
  onJoinPress?: () => void;
};

export function EventCard({
  title,
  date,
  location,
  imageUri,
  attendeeAvatars,
  totalAttendees,
  hasJoined,
  onPress,
  onJoinPress,
}: EventCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-[#131316] border border-[#1a1a1e] rounded-xl p-3 gap-4 active:opacity-80"
    >
      <View className="flex-row gap-3">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="w-[75px] rounded-lg"
            style={{ aspectRatio: 75 / 85 }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="w-[75px] rounded-lg bg-[#1a1a1e] items-center justify-center"
            style={{ aspectRatio: 75 / 85 }}
          >
            <Icon as={CalendarDays} size={28} className="text-[#70707b]" />
          </View>
        )}
        <View className="flex-1 gap-2">
          <Text className="text-base font-medium text-white">{title}</Text>
          <View className="gap-1">
            <View className="flex-row items-center gap-1">
              <Icon as={Clock} size={18} className="text-[#d1d1d6]" />
              <Text className="text-xs text-[#d1d1d6]">{date}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon as={MapPin} size={18} className="text-[#d1d1d6]" />
              <Text className="flex-1 text-xs text-[#d1d1d6]" numberOfLines={1}>
                {location}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <AttendeeAvatars
          avatars={attendeeAvatars}
          totalCount={totalAttendees}
        />
        <Pressable
          onPress={onJoinPress}
          className={`rounded-full px-5 py-1.5 active:opacity-70 ${
            hasJoined
              ? "bg-[#e56400] border border-[#e56400]"
              : "border border-[#e56400]"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              hasJoined ? "text-black" : "text-[#e56400]"
            }`}
          >
            {hasJoined ? "Joined" : "Join"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

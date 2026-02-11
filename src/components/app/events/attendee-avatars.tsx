import { Text } from "@/components/ui/text";
import { Image, View } from "react-native";

export type AttendeeAvatarsProps = {
  avatars: string[];
  totalCount: number;
  size?: number;
};

export function AttendeeAvatars({
  avatars,
  totalCount,
  size = 30,
}: AttendeeAvatarsProps) {
  const displayedAvatars = avatars.slice(0, 5);
  const remaining = totalCount - displayedAvatars.length;
  const overlap = size * 0.15;

  return (
    <View className="flex-row items-center" style={{ paddingRight: overlap }}>
      {displayedAvatars.map((uri, index) => (
        <View
          key={index}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            marginRight: -overlap,
            zIndex: displayedAvatars.length - index,
          }}
        >
          <Image
            source={{ uri }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
            }}
          />
        </View>
      ))}
      {remaining > 0 && (
        <View
          className="items-center justify-center bg-[#26272b]"
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            marginRight: -overlap,
          }}
        >
          <Text className="text-xs text-white">+{remaining}</Text>
        </View>
      )}
    </View>
  );
}

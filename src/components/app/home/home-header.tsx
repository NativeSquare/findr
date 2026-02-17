import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { ChevronDown, Heart, MapPin, Settings2 } from "lucide-react-native";
import { Pressable, View } from "react-native";

export type SearchLocation = {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
};

export type HomeHeaderProps = {
  user: Doc<"users">;
  searchLocation?: SearchLocation | null;
  hasActiveFilters?: boolean;
  onFilterPress?: () => void;
  showFavoritesOnly?: boolean;
  onFavoritesToggle?: () => void;
};

export function HomeHeader({
  user,
  searchLocation,
  hasActiveFilters,
  onFilterPress,
  showFavoritesOnly,
  onFavoritesToggle,
}: HomeHeaderProps) {
  const router = useRouter();
  const imageUrl = useQuery(
    api.storage.getImageUrl,
    user.profilePictures?.[0] ? { storageId: user.profilePictures[0] } : "skip",
  );

  const handleLocationPress = () => {
    if (searchLocation) {
      router.push({
        pathname: "/location-search",
        params: {
          selectedLat: String(searchLocation.latitude),
          selectedLng: String(searchLocation.longitude),
          selectedAddress: searchLocation.address,
          selectedName: searchLocation.name,
        },
      });
    } else {
      router.push("/location-search");
    }
  };

  return (
    <View className="flex-row items-center gap-3">
      <Pressable onPress={() => router.push("/my-profile")}>
        <Avatar className="size-10" alt="Profile">
          {imageUrl ? (
            <AvatarImage source={{ uri: imageUrl }} />
          ) : (
            <AvatarFallback className="bg-secondary">
              <Ionicons
                name="person"
                size={20}
                className="text-muted-foreground"
              />
            </AvatarFallback>
          )}
        </Avatar>
      </Pressable>
      <Button
        variant="outline"
        className="flex-1 flex-row items-center gap-2"
        onPress={handleLocationPress}
      >
        <Icon as={MapPin} size={20} />
        <View className="flex-1">
          <Text numberOfLines={1}>
            {searchLocation?.address || searchLocation?.name || "My Location"}
          </Text>
        </View>
        <Icon as={ChevronDown} size={16} />
      </Button>
      <Button
        variant={showFavoritesOnly ? "default" : "outline"}
        size="icon"
        onPress={onFavoritesToggle}
        className={showFavoritesOnly ? "bg-[#e56400]" : ""}
      >
        <Heart
          size={20}
          color={showFavoritesOnly ? "#000" : undefined}
          fill={showFavoritesOnly ? "#000" : "transparent"}
        />
      </Button>
      <Button
        variant={hasActiveFilters ? "default" : "outline"}
        size="icon"
        onPress={onFilterPress}
      >
        <Icon as={Settings2} size={20} />
      </Button>
    </View>
  );
}

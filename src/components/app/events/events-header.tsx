import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { EVENT_SEARCH_LOCATION_STORAGE_KEY } from "@/constants/events";
import { useRouter } from "expo-router";
import {
  ChevronDown,
  CirclePlus,
  MapPin,
  SlidersHorizontal,
} from "lucide-react-native";
import { View } from "react-native";

export type SearchLocation = {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
};

export type EventsHeaderProps = {
  searchLocation?: SearchLocation | null;
  hasActiveFilters?: boolean;
  onFilterPress?: () => void;
  onCreatePress?: () => void;
};

export function EventsHeader({
  searchLocation,
  hasActiveFilters,
  onFilterPress,
  onCreatePress,
}: EventsHeaderProps) {
  const router = useRouter();

  const handleLocationPress = () => {
    if (searchLocation) {
      router.push({
        pathname: "/location-search",
        params: {
          selectedLat: String(searchLocation.latitude),
          selectedLng: String(searchLocation.longitude),
          selectedAddress: searchLocation.address,
          selectedName: searchLocation.name,
          storageKey: EVENT_SEARCH_LOCATION_STORAGE_KEY,
        },
      });
    } else {
      router.push({
        pathname: "/location-search",
        params: {
          storageKey: EVENT_SEARCH_LOCATION_STORAGE_KEY,
        },
      });
    }
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-medium text-white">Events</Text>
        <View className="flex-row items-center gap-3">
          <Button
            variant={hasActiveFilters ? "default" : "ghost"}
            size="icon"
            onPress={onFilterPress}
          >
            <Icon as={SlidersHorizontal} size={22} className="text-white" />
          </Button>
          <Button variant="ghost" size="icon" onPress={onCreatePress}>
            <Icon as={CirclePlus} size={22} className="text-white" />
          </Button>
        </View>
      </View>

      {/* Location Override Button */}
      <Button
        variant="outline"
        className="flex-row items-center gap-2"
        onPress={handleLocationPress}
      >
        <Icon as={MapPin} size={18} />
        <View className="flex-1">
          <Text numberOfLines={1} className="text-sm">
            {searchLocation?.address ||
              searchLocation?.name ||
              "Everywhere"}
          </Text>
        </View>
        <Icon as={ChevronDown} size={14} />
      </Button>
    </View>
  );
}

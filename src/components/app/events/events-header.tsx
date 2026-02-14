import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { EVENT_SEARCH_LOCATION_STORAGE_KEY } from "@/constants/events";
import { useRouter } from "expo-router";
import {
  ChevronDown,
  CirclePlus,
  MapPin,
  Settings2,
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
      <Text className="text-xl font-medium text-white">Events</Text>

      {/* Location + Filter + Create row */}
      <View className="flex-row items-center gap-2">
        <Button
          variant="outline"
          className="flex-1 flex-row items-center gap-2"
          onPress={handleLocationPress}
        >
          <Icon as={MapPin} size={18} />
          <View className="flex-1">
            <Text numberOfLines={1} className="text-sm">
              {searchLocation?.address || searchLocation?.name || "Everywhere"}
            </Text>
          </View>
          <Icon as={ChevronDown} size={14} />
        </Button>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="icon"
          onPress={onFilterPress}
        >
          <Icon as={Settings2} size={20} />
        </Button>
        <Button variant="outline" size="icon" onPress={onCreatePress}>
          <Icon as={CirclePlus} size={20} />
        </Button>
      </View>
    </View>
  );
}

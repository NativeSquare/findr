import { EventCard } from "@/components/app/events/event-card";
import {
  EventsHeader,
  SearchLocation,
} from "@/components/app/events/events-header";
import { Text } from "@/components/ui/text";
import {
  EVENT_FILTERS_STORAGE_KEY,
  EVENT_SEARCH_LOCATION_STORAGE_KEY,
} from "@/constants/events";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import React from "react";
import { Alert, ScrollView, View } from "react-native";
import { EventFilterData } from "../event-filters";

function formatEventDate(timestamp: number): string {
  const date = new Date(timestamp);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = days[date.getDay()];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, "0");
  return `${dayName}, ${displayHours}:${displayMinutes} ${ampm}`;
}

const defaultFilters: EventFilterData = {
  eventType: [],
  dateRange: "",
  distance: "",
};

export default function Events() {
  const [filters, setFilters] = React.useState<EventFilterData>(defaultFilters);
  const [searchLocation, setSearchLocation] =
    React.useState<SearchLocation | null>(null);

  const loadFilters = React.useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(EVENT_FILTERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFilters({
          eventType: parsed.eventType ?? [],
          dateRange: parsed.dateRange ?? "",
          distance: parsed.distance ?? "",
        });
      }
    } catch (error) {
      console.error("Error loading event filters:", error);
    }
  }, []);

  const loadSearchLocation = React.useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(
        EVENT_SEARCH_LOCATION_STORAGE_KEY,
      );
      if (saved) {
        setSearchLocation(JSON.parse(saved));
      } else {
        setSearchLocation(null);
      }
    } catch (error) {
      console.error("Error loading event search location:", error);
    }
  }, []);

  React.useEffect(() => {
    loadFilters();
    loadSearchLocation();
  }, [loadFilters, loadSearchLocation]);

  useFocusEffect(
    React.useCallback(() => {
      loadFilters();
      loadSearchLocation();
    }, [loadFilters, loadSearchLocation]),
  );

  // Build query filters for the backend
  const queryFilters: {
    eventType?: string[];
    dateRange?: string;
    city?: string;
  } = {};

  if (filters.eventType.length > 0) {
    queryFilters.eventType = filters.eventType;
  }
  if (filters.dateRange && filters.dateRange !== "Any Time") {
    queryFilters.dateRange = filters.dateRange;
  }
  if (searchLocation?.name && searchLocation.name !== "My Location") {
    queryFilters.city = searchLocation.name;
  } else if (searchLocation?.address) {
    // Extract city from address (first meaningful part)
    const parts = searchLocation.address.split(",").map((s) => s.trim());
    if (parts.length > 0) {
      queryFilters.city = parts[0];
    }
  }

  const hasActiveFilters =
    filters.eventType.length > 0 ||
    (filters.dateRange !== "" && filters.dateRange !== "Any Time") ||
    filters.distance !== "" ||
    searchLocation !== null;

  const events = useQuery(api.events.getEvents, queryFilters);
  const joinEvent = useMutation(api.events.joinEvent);
  const leaveEvent = useMutation(api.events.leaveEvent);

  const handleEventPress = (eventId: string) => {
    router.push({ pathname: "/event-detail", params: { id: eventId } });
  };

  const handleJoinPress = async (eventId: Id<"events">, hasJoined: boolean) => {
    try {
      if (hasJoined) {
        await leaveEvent({ eventId });
      } else {
        await joinEvent({ eventId });
      }
    } catch (error: any) {
      Alert.alert("Error", error.message ?? "Something went wrong");
    }
  };

  const isLoading = events === undefined;

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="items-center p-4 py-8 mt-safe"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-sm gap-5">
        <EventsHeader
          searchLocation={searchLocation}
          hasActiveFilters={hasActiveFilters}
          onFilterPress={() => router.push("/event-filters")}
          onCreatePress={() => router.push("/create-event")}
        />

        {isLoading ? (
          <View className="items-center py-10">
            <Text className="text-sm text-[#70707b]">Loading events...</Text>
          </View>
        ) : events.length === 0 ? (
          <View className="items-center py-10">
            <Text className="text-sm text-[#70707b]">No events found</Text>
          </View>
        ) : (
          <View className="gap-4">
            {events.map((event) => (
              <EventCard
                key={event._id}
                id={event._id}
                title={event.title}
                date={formatEventDate(event.date)}
                location={event.location}
                imageUri={event.imageUrl ?? ""}
                attendeeAvatars={event.attendeeAvatars}
                totalAttendees={event.totalAttendees}
                hasJoined={event.hasJoined}
                onPress={() => handleEventPress(event._id)}
                onJoinPress={() => handleJoinPress(event._id, event.hasJoined)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

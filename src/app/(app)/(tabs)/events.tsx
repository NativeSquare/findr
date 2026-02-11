import { EventCard } from "@/components/app/events/event-card";
import { EventSection } from "@/components/app/events/event-section";
import { EventsHeader } from "@/components/app/events/events-header";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { Alert, ScrollView, View } from "react-native";

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

export default function Events() {
  const events = useQuery(api.events.getEvents);
  const joinEvent = useMutation(api.events.joinEvent);
  const leaveEvent = useMutation(api.events.leaveEvent);

  const handleEventPress = (eventId: string) => {
    router.push({ pathname: "/event-detail", params: { id: eventId } });
  };

  const handleJoinPress = async (
    eventId: Id<"events">,
    hasJoined: boolean
  ) => {
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
          onFilterPress={() => router.push("/event-filters")}
          onCreatePress={() => router.push("/create-event")}
        />

        {isLoading ? (
          <View className="items-center py-10">
            <Text className="text-sm text-[#70707b]">Loading events...</Text>
          </View>
        ) : (
          <>
            <EventSection title="Today's Events" onViewAll={() => {}}>
              {events.today.length === 0 ? (
                <Text className="text-sm text-[#70707b]">
                  No events today
                </Text>
              ) : (
                events.today.map((event) => (
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
                    onJoinPress={() =>
                      handleJoinPress(event._id, event.hasJoined)
                    }
                  />
                ))
              )}
            </EventSection>

            <EventSection title="Upcoming Events" onViewAll={() => {}}>
              {events.upcoming.length === 0 ? (
                <Text className="text-sm text-[#70707b]">
                  No upcoming events
                </Text>
              ) : (
                events.upcoming.map((event) => (
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
                    onJoinPress={() =>
                      handleJoinPress(event._id, event.hasJoined)
                    }
                  />
                ))
              )}
            </EventSection>

            <EventSection title="Previous Events" onViewAll={() => {}}>
              {events.previous.length === 0 ? (
                <Text className="text-sm text-[#70707b]">
                  No previous events
                </Text>
              ) : (
                events.previous.map((event) => (
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
                    onJoinPress={() =>
                      handleJoinPress(event._id, event.hasJoined)
                    }
                  />
                ))
              )}
            </EventSection>
          </>
        )}
      </View>
    </ScrollView>
  );
}

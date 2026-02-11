import { EventCard } from "@/components/app/events/event-card";
import { EventSection } from "@/components/app/events/event-section";
import { EventsHeader } from "@/components/app/events/events-header";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";

// Mock data - replace with Convex queries when backend is ready
const MOCK_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=faces",
];

const MOCK_EVENTS = {
  today: [
    {
      id: "1",
      title: "Beach Party",
      date: "Tuesday, 6:00 PM",
      location: "Santa Monica Beach",
      imageUri:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=250&fit=crop",
      attendeeAvatars: MOCK_AVATARS,
      totalAttendees: 17,
    },
  ],
  upcoming: [
    {
      id: "2",
      title: "Disco Party",
      date: "Tuesday, 6:00 PM",
      location: "Santa Monica Beach",
      imageUri:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=250&fit=crop",
      attendeeAvatars: MOCK_AVATARS,
      totalAttendees: 17,
    },
  ],
  previous: [
    {
      id: "3",
      title: "New Year Party",
      date: "Sunday, 12:00 AM",
      location: "Santa Monica Beach",
      imageUri:
        "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=200&h=250&fit=crop",
      attendeeAvatars: MOCK_AVATARS,
      totalAttendees: 17,
    },
  ],
};

export default function Events() {
  const handleEventPress = (eventId: string) => {
    router.push({ pathname: "/event-detail", params: { id: eventId } });
  };

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

        <EventSection title="Today's Events" onViewAll={() => {}}>
          {MOCK_EVENTS.today.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              onPress={() => handleEventPress(event.id)}
              onJoinPress={() => {}}
            />
          ))}
        </EventSection>

        <EventSection title="Upcoming Events" onViewAll={() => {}}>
          {MOCK_EVENTS.upcoming.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              onPress={() => handleEventPress(event.id)}
              onJoinPress={() => {}}
            />
          ))}
        </EventSection>

        <EventSection title="Previous Events" onViewAll={() => {}}>
          {MOCK_EVENTS.previous.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              onPress={() => handleEventPress(event.id)}
              onJoinPress={() => {}}
            />
          ))}
        </EventSection>
      </View>
    </ScrollView>
  );
}

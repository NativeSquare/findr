import { EventCard } from "@/components/app/events/event-card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from "react-native";

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

export default function MyEvents() {
  const events = useQuery(api.events.getMyOrganizedEvents);
  const deleteEvent = useMutation(api.events.deleteEvent);

  const handleEventPress = (eventId: string) => {
    router.push({ pathname: "/event-detail", params: { id: eventId } });
  };

  const handleDeletePress = (eventId: Id<"events">, title: string) => {
    Alert.alert("Delete Event", `Are you sure you want to delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEvent({ eventId });
          } catch (error: any) {
            Alert.alert("Error", error.message ?? "Failed to delete event");
          }
        },
      },
    ]);
  };

  const isLoading = events === undefined;

  return (
    <ScrollView
      contentContainerClassName="items-center p-4 py-8 mt-safe"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-sm gap-5">
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="size-6 items-center justify-center"
          >
            <Icon as={ArrowLeft} size={24} className="text-white" />
          </Pressable>
          <Text className="text-xl font-medium text-white">My Events</Text>
        </View>

        {/* Content */}
        {isLoading ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color="#e56400" />
          </View>
        ) : events.length === 0 ? (
          <View className="items-center py-10">
            <Text className="text-sm text-[#70707b]">
              You haven't organized any events yet
            </Text>
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
                onJoinPress={() => handleDeletePress(event._id, event.title)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

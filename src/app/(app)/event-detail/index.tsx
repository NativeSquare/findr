import { AttendeeAvatars } from "@/components/app/events/attendee-avatars";
import { EventLocationMap } from "@/components/app/events/event-location-map";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Facebook,
  Globe,
  Instagram,
  MapPin,
  MessageCircle,
  Pencil,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayOfMonth = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, "0");
  return `${dayName}, ${monthName} ${dayOfMonth} · ${displayHours}:${displayMinutes} ${ampm}`;
}

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [isJoining, setIsJoining] = React.useState(false);

  const event = useQuery(
    api.events.getEvent,
    id ? { eventId: id as Id<"events"> } : "skip",
  );
  const joinEvent = useMutation(api.events.joinEvent);
  const leaveEvent = useMutation(api.events.leaveEvent);

  const handleJoinLeave = async () => {
    if (!event || !id) return;

    setIsJoining(true);
    try {
      if (event.hasJoined) {
        await leaveEvent({ eventId: id as Id<"events"> });
      } else {
        await joinEvent({ eventId: id as Id<"events"> });
      }
    } catch (error: any) {
      Alert.alert("Error", error.message ?? "Something went wrong");
    } finally {
      setIsJoining(false);
    }
  };

  if (event === undefined) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#e56400" />
      </View>
    );
  }

  if (event === null) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-5">
        <Text className="text-base text-[#70707b]">Event not found</Text>
        <Button className="mt-4" onPress={() => router.back()}>
          <Text className="text-base font-medium text-primary-foreground">
            Go Back
          </Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        {/* Hero Image */}
        <View className="relative h-[280px]">
          {event.imageUrl ? (
            <Image
              source={{ uri: event.imageUrl }}
              className="w-full h-full rounded-b-2xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full rounded-b-2xl bg-[#1a1a1e] items-center justify-center">
              <Ionicons name="image-outline" size={48} color="#70707b" />
            </View>
          )}
          <Pressable
            onPress={() => router.replace("/(app)/(tabs)/events")}
            className="absolute bg-black/30 rounded-full size-9 items-center justify-center active:opacity-70"
            style={{ top: insets.top + 20, left: 20 }}
          >
            <Icon as={ArrowLeft} size={22} className="text-white" />
          </Pressable>
          {/* Right-side action buttons */}
          <View
            className="absolute flex-row gap-2"
            style={{ top: insets.top + 20, right: 20 }}
          >
            {(event.hasJoined || event.isOrganizer) && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/event-chat/[id]",
                    params: { id: event._id },
                  })
                }
                className="bg-black/30 rounded-full size-9 items-center justify-center active:opacity-70"
              >
                <Icon as={MessageCircle} size={18} className="text-white" />
              </Pressable>
            )}
            {event.isOrganizer && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/edit-event",
                    params: { id: event._id },
                  })
                }
                className="bg-black/30 rounded-full size-9 items-center justify-center active:opacity-70"
              >
                <Icon as={Pencil} size={18} className="text-white" />
              </Pressable>
            )}
          </View>
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
                <Text className="text-base text-[#d1d1d6]">
                  {formatEventDate(event.date)}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Icon as={MapPin} size={22} className="text-[#d1d1d6]" />
                <Text className="text-base text-[#d1d1d6] flex-1">
                  {event.location}
                </Text>
              </View>
            </View>
          </View>

          {/* Attendees */}
          {event.totalAttendees > 0 && (
            <View className="gap-2">
              <Text className="text-base font-semibold text-white">
                Attendees ({event.totalAttendees}
                {event.maxAttendees ? `/${event.maxAttendees}` : ""})
              </Text>
              <AttendeeAvatars
                avatars={event.attendeeAvatars}
                totalCount={event.totalAttendees}
              />
            </View>
          )}

          {/* About Event */}
          {event.description && (
            <View className="gap-2">
              <Text className="text-base font-semibold text-white">
                About Event
              </Text>
              <Text className="text-sm text-[#d1d1d6] leading-5">
                {event.description}
              </Text>
            </View>
          )}

          {/* Links */}
          {(event.website ||
            event.socialLinks?.instagram ||
            event.socialLinks?.tiktok ||
            event.socialLinks?.facebook) && (
            <View className="gap-3">
              <Text className="text-base font-semibold text-white">Links</Text>
              <View className="gap-2">
                {event.website && (
                  <Pressable
                    onPress={() => {
                      const url = event.website!.startsWith("http")
                        ? event.website!
                        : `https://${event.website}`;
                      Linking.openURL(url);
                    }}
                    className="flex-row items-center gap-3 py-2.5 px-3 rounded-xl bg-secondary/30 active:opacity-70"
                  >
                    <Icon as={Globe} size={20} className="text-[#d1d1d6]" />
                    <Text
                      className="text-sm text-[#d1d1d6] flex-1"
                      numberOfLines={1}
                    >
                      {event.website}
                    </Text>
                    <Icon
                      as={ExternalLink}
                      size={16}
                      className="text-[#70707b]"
                    />
                  </Pressable>
                )}
                {event.socialLinks?.instagram && (
                  <Pressable
                    onPress={() =>
                      Linking.openURL(
                        `https://instagram.com/${event.socialLinks!.instagram}`,
                      )
                    }
                    className="flex-row items-center gap-3 py-2.5 px-3 rounded-xl bg-secondary/30 active:opacity-70"
                  >
                    <Icon as={Instagram} size={20} color="#E1306C" />
                    <Text className="text-sm text-[#d1d1d6] flex-1">
                      @{event.socialLinks.instagram}
                    </Text>
                    <Icon
                      as={ExternalLink}
                      size={16}
                      className="text-[#70707b]"
                    />
                  </Pressable>
                )}
                {event.socialLinks?.tiktok && (
                  <Pressable
                    onPress={() =>
                      Linking.openURL(
                        `https://tiktok.com/@${event.socialLinks!.tiktok}`,
                      )
                    }
                    className="flex-row items-center gap-3 py-2.5 px-3 rounded-xl bg-secondary/30 active:opacity-70"
                  >
                    <Ionicons name="logo-tiktok" size={20} color="#ffffff" />
                    <Text className="text-sm text-[#d1d1d6] flex-1">
                      @{event.socialLinks.tiktok}
                    </Text>
                    <Icon
                      as={ExternalLink}
                      size={16}
                      className="text-[#70707b]"
                    />
                  </Pressable>
                )}
                {event.socialLinks?.facebook && (
                  <Pressable
                    onPress={() =>
                      Linking.openURL(
                        `https://facebook.com/${event.socialLinks!.facebook}`,
                      )
                    }
                    className="flex-row items-center gap-3 py-2.5 px-3 rounded-xl bg-secondary/30 active:opacity-70"
                  >
                    <Icon as={Facebook} size={20} color="#1877F2" />
                    <Text className="text-sm text-[#d1d1d6] flex-1">
                      {event.socialLinks.facebook}
                    </Text>
                    <Icon
                      as={ExternalLink}
                      size={16}
                      className="text-[#70707b]"
                    />
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {/* Organizer */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-white">
              Organizer
            </Text>
            <View className="flex-row items-center gap-2">
              {event.organizerAvatarUrl ? (
                <Image
                  source={{ uri: event.organizerAvatarUrl }}
                  className="size-10 rounded-full"
                />
              ) : (
                <View className="size-10 rounded-full bg-[#1a1a1e] items-center justify-center">
                  <Ionicons name="person" size={20} color="#70707b" />
                </View>
              )}
              <Text className="text-sm text-[#d1d1d6]">
                {event.organizerName}
              </Text>
            </View>
          </View>

          {/* Location Map */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-white">Location</Text>
            <EventLocationMap
              latitude={event.latitude}
              longitude={event.longitude}
              location={event.location}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Join/Leave Button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-5 pb-2 bg-background"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        {event.isOrganizer ? (
          <Button className="w-full bg-input" disabled>
            <Text className="text-base font-medium text-[#70707b] text-center">
              You're the organizer
            </Text>
          </Button>
        ) : (
          <Button
            className={`w-full ${event.hasJoined ? "bg-[#1a1a1e] border border-[#e56400]" : "bg-[#e56400]"}`}
            onPress={handleJoinLeave}
            disabled={isJoining}
          >
            {isJoining ? (
              <ActivityIndicator
                size="small"
                color={event.hasJoined ? "#e56400" : "#000"}
              />
            ) : (
              <Text
                className={`text-base font-medium text-center ${event.hasJoined ? "text-[#e56400]" : "text-black"}`}
              >
                {event.hasJoined ? "Leave Event" : "Join"}
              </Text>
            )}
          </Button>
        )}
      </View>
    </View>
  );
}

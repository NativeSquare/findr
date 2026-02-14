import { MessageInput } from "@/components/app/chat/message-input";
import { EventMessageBubble } from "@/components/app/events/event-message-bubble";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatChatTimestamp } from "@/utils/formatChatTimestamp";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, MessageCircle } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EventChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const eventId = id as Id<"events">;

  const event = useQuery(
    api.events.getEvent,
    id ? { eventId } : "skip",
  );

  const messages = useQuery(
    api.eventMessages.getMessages,
    id ? { eventId } : "skip",
  );

  const sendMessage = useMutation(api.eventMessages.sendMessage);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages?.length]);

  const handleSend = async () => {
    if (!message.trim() || !id || isSending) return;

    const text = message.trim();
    setMessage("");
    setIsSending(true);

    try {
      await sendMessage({ eventId, text });
    } catch (error: any) {
      Alert.alert("Error", error.message ?? "Failed to send message");
      setMessage(text); // Restore message on failure
    } finally {
      setIsSending(false);
    }
  };

  if (event === undefined || messages === undefined) {
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
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        className="flex-row items-center px-4 pb-3 border-b border-[#1a1a1e]"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="size-9 items-center justify-center active:opacity-70"
          hitSlop={8}
        >
          <Icon as={ArrowLeft} size={22} className="text-white" />
        </Pressable>
        <View className="flex-1 ml-2">
          <Text className="text-base font-medium text-white" numberOfLines={1}>
            {event.title}
          </Text>
          <Text className="text-xs text-[#70707b]">
            {event.totalAttendees} attendee{event.totalAttendees !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Chat area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Empty state */}
          {messages.length === 0 && (
            <View className="flex-1 items-center justify-center px-5 py-10">
              <View className="size-16 rounded-full bg-[#1a1a1e] items-center justify-center mb-3">
                <Icon as={MessageCircle} size={28} className="text-[#70707b]" />
              </View>
              <Text className="text-base font-medium text-white mb-1">
                Group Chat
              </Text>
              <Text className="text-sm text-[#70707b] text-center">
                Be the first to send a message to the group!
              </Text>
            </View>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <View className="px-5 pt-5">
              {messages.map((msg) => (
                <EventMessageBubble
                  key={msg._id}
                  message={msg.text}
                  timestamp={formatChatTimestamp(msg.timestamp)}
                  isOutgoing={msg.isOutgoing}
                  senderName={msg.senderName}
                  senderAvatarUrl={msg.senderAvatarUrl}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {/* Message input */}
        <View style={{ paddingBottom: insets.bottom }}>
          <MessageInput
            value={message}
            onChangeText={setMessage}
            onSend={handleSend}
            placeholder="Message the group..."
            isLoading={isSending}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

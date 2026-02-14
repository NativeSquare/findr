import { StoryProgressBar } from "@/components/app/stories/story-progress-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  StatusBar,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, { runOnJS, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STORY_DURATION = 5000; // 5 seconds per story
const PROGRESS_INTERVAL = 50; // update progress every 50ms

export default function StoryViewer() {
  const { startUserId, authorIds: authorIdsParam } = useLocalSearchParams<{
    startUserId: string;
    authorIds: string;
  }>();

  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;

  // Parse author IDs from params
  const authorIds: Id<"users">[] = React.useMemo(() => {
    try {
      return JSON.parse(authorIdsParam ?? "[]");
    } catch {
      return [];
    }
  }, [authorIdsParam]);

  // Current user group index
  const [userIndex, setUserIndex] = React.useState(() => {
    const idx = authorIds.indexOf(startUserId as Id<"users">);
    return idx >= 0 ? idx : 0;
  });

  // Current story index within the user's stories
  const [storyIndex, setStoryIndex] = React.useState(0);

  // Progress shared value for the progress bar animation
  const progress = useSharedValue(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = React.useRef(false);

  // Current author ID
  const currentAuthorId = authorIds[userIndex];

  // Fetch current user info
  const currentUser = useQuery(api.users.currentUser);
  const deleteStory = useMutation(api.stories.deleteStory);

  // Fetch stories for the current author
  const storyGroups = useQuery(
    api.geospatial.getNearbyStories,
    currentUser?._id
      ? {
          userId: currentUser._id,
        }
      : "skip",
  );

  // Get the current author's story group
  const currentGroup = storyGroups?.find(
    (group) => group.authorId === currentAuthorId,
  );

  const currentStories = currentGroup?.stories ?? [];
  const currentStory = currentStories[storyIndex];

  // Start / restart the auto-advance timer
  const startTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    progress.value = 0;
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;

      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / STORY_DURATION, 1);
      progress.value = newProgress;

      if (newProgress >= 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        // Auto-advance to next story
        advanceStory();
      }
    }, PROGRESS_INTERVAL);
  }, []);

  // Advance to the next story or next user
  const advanceStory = React.useCallback(() => {
    if (storyIndex < currentStories.length - 1) {
      // Next story from same user
      setStoryIndex((prev) => prev + 1);
    } else if (userIndex < authorIds.length - 1) {
      // Next user
      setUserIndex((prev) => prev + 1);
      setStoryIndex(0);
    } else {
      // End of all stories
      router.back();
    }
  }, [storyIndex, currentStories.length, userIndex, authorIds.length]);

  // Go back to previous story or previous user
  const goBackStory = React.useCallback(() => {
    if (storyIndex > 0) {
      // Previous story from same user
      setStoryIndex((prev) => prev - 1);
    } else if (userIndex > 0) {
      // Previous user's last story — we'll set storyIndex after the group loads
      setUserIndex((prev) => prev - 1);
      setStoryIndex(-1); // sentinel: set to last story of previous user
    }
    // If already at the very first story of the first user, just restart
  }, [storyIndex, userIndex]);

  // Whether the current story belongs to the logged-in user
  const isOwnStory = currentUser?._id === currentAuthorId;

  // Delete the currently displayed story photo
  const handleDeleteStory = React.useCallback(() => {
    if (!currentStory) return;

    // Pause the timer while the alert is visible
    isPausedRef.current = true;

    Alert.alert(
      "Delete Story",
      "Are you sure you want to delete this photo from your story?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            isPausedRef.current = false;
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteStory({ storyId: currentStory._id as Id<"stories"> });

              // If this was the only story, go back
              if (currentStories.length <= 1) {
                // Move to next user or exit
                if (userIndex < authorIds.length - 1) {
                  setUserIndex((prev) => prev + 1);
                  setStoryIndex(0);
                } else {
                  router.back();
                }
              } else if (storyIndex >= currentStories.length - 1) {
                // Was the last photo — go back one index
                setStoryIndex((prev) => Math.max(0, prev - 1));
              }
              // Otherwise stay at same index (next story shifts into place)
            } catch (error: any) {
              Alert.alert("Error", error.message ?? "Failed to delete story");
            } finally {
              isPausedRef.current = false;
            }
          },
        },
      ],
    );
  }, [
    currentStory,
    currentStories.length,
    storyIndex,
    userIndex,
    authorIds.length,
    deleteStory,
  ]);

  // When storyIndex is -1 (sentinel for "go to last story of previous user"), fix it
  React.useEffect(() => {
    if (storyIndex === -1 && currentStories.length > 0) {
      setStoryIndex(currentStories.length - 1);
    }
  }, [storyIndex, currentStories.length]);

  // Reset timer when story changes
  React.useEffect(() => {
    if (currentStory) {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [userIndex, storyIndex, currentStory?._id]);

  // Tap gesture — left half goes back, right half goes forward
  const tapGesture = Gesture.Tap().onEnd((event) => {
    if (event.x < screenWidth / 2) {
      runOnJS(goBackStory)();
    } else {
      runOnJS(advanceStory)();
    }
  });

  // Long press to pause
  const longPressGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      isPausedRef.current = true;
    })
    .onEnd(() => {
      isPausedRef.current = false;
    });

  // Horizontal pan to switch users
  const panGesture = Gesture.Pan()
    .activeOffsetX([-30, 30])
    .onEnd((event) => {
      if (event.translationX < -50) {
        // Swiped left — next user
        if (userIndex < authorIds.length - 1) {
          runOnJS(setUserIndex)(userIndex + 1);
          runOnJS(setStoryIndex)(0);
        } else {
          runOnJS(router.back)();
        }
      } else if (event.translationX > 50) {
        // Swiped right — previous user
        if (userIndex > 0) {
          runOnJS(setUserIndex)(userIndex - 1);
          runOnJS(setStoryIndex)(0);
        }
      }
    });

  const composedGesture = Gesture.Race(
    panGesture,
    longPressGesture,
    tapGesture,
  );

  // Loading state
  if (!storyGroups || !currentGroup || !currentStory) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-black">
        <StatusBar barStyle="light-content" />

        <GestureDetector gesture={composedGesture}>
          <Animated.View style={{ flex: 1 }}>
            {/* Story image */}
            <Image
              source={{ uri: currentStory.imageUrl ?? undefined }}
              style={{ flex: 1 }}
              contentFit="contain"
              transition={200}
            />

            {/* Top overlay */}
            <View
              className="absolute left-0 right-0"
              style={{ top: insets.top }}
            >
              {/* Progress bar */}
              <StoryProgressBar
                total={currentStories.length}
                currentIndex={storyIndex}
                progress={progress}
              />

              {/* User info + close button */}
              <View className="flex-row items-center px-3 py-2">
                <Avatar className="size-8" alt={currentGroup.authorName}>
                  {currentGroup.authorAvatarUrl ? (
                    <AvatarImage
                      source={{ uri: currentGroup.authorAvatarUrl }}
                    />
                  ) : (
                    <AvatarFallback className="bg-secondary">
                      <Ionicons name="person" size={16} color="#a1a1aa" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <Text className="ml-2 flex-1 text-sm font-semibold text-white">
                  {currentGroup.authorName}
                </Text>
                {isOwnStory && (
                  <Pressable
                    onPress={handleDeleteStory}
                    hitSlop={16}
                    className="rounded-full p-1"
                  >
                    <Ionicons name="trash-outline" size={22} color="#fff" />
                  </Pressable>
                )}
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={16}
                  className="ml-2 rounded-full p-1"
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

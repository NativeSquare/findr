import { LocationAutocompleteInput } from "@/components/app/events/location-autocomplete-input";
import { SocialLinkInput } from "@/components/app/events/social-link-input";
import { PreferenceSelectionSheet } from "@/components/app/edit-profile/preference-selection-sheet";
import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { EVENT_TYPES } from "@/constants/events";
import { useUploadImage } from "@/hooks/use-upload-image";
import { api } from "@convex/_generated/api";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ArrowLeft, CloudUpload } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

export default function CreateEvent() {
  const [title, setTitle] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [eventType, setEventType] = React.useState("");
  const [date, setDate] = React.useState<Date | null>(null);
  const [time, setTime] = React.useState<Date | null>(null);
  const [maxAttendees, setMaxAttendees] = React.useState("");
  const [photoUri, setPhotoUri] = React.useState<string | null>(null);
  const [instagram, setInstagram] = React.useState("");
  const [tiktok, setTiktok] = React.useState("");
  const [facebook, setFacebook] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const dateSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const timeSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const eventTypeSheetRef = React.useRef<GorhomBottomSheetModal>(null);

  const [internalDate, setInternalDate] = React.useState(new Date());
  const [internalTime, setInternalTime] = React.useState(new Date());

  const createEvent = useMutation(api.events.createEvent);
  const { uploadImage, isUploading } = useUploadImage();

  const handlePickPhoto = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant access to your photo library to select images.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1.0,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image from gallery.");
    }
  };

  const formatDate = (d: Date | null) => {
    if (!d) return "";
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatTime = (t: Date | null) => {
    if (!t) return "";
    return `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      if (selectedDate) {
        setDate(selectedDate);
        setInternalDate(selectedDate);
      }
      dateSheetRef.current?.dismiss();
    } else if (selectedDate) {
      setInternalDate(selectedDate);
    }
  };

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    if (Platform.OS === "android") {
      if (selectedTime) {
        setTime(selectedTime);
        setInternalTime(selectedTime);
      }
      timeSheetRef.current?.dismiss();
    } else if (selectedTime) {
      setInternalTime(selectedTime);
    }
  };

  const handleDateDone = () => {
    setDate(internalDate);
    dateSheetRef.current?.dismiss();
  };

  const handleTimeDone = () => {
    setTime(internalTime);
    timeSheetRef.current?.dismiss();
  };

  const isFormValid = title.trim() && location.trim() && date && time;

  const handleCreate = async () => {
    if (!isFormValid || !date || !time) return;

    setIsSubmitting(true);
    try {
      // Combine date and time into a single timestamp
      const eventDate = new Date(date);
      eventDate.setHours(time.getHours(), time.getMinutes(), 0, 0);

      // Upload image if selected
      let imageUrl: string | undefined;
      if (photoUri) {
        imageUrl = await uploadImage(photoUri, { width: 1200 });
      }

      // Build social links (only include non-empty values)
      const hasSocialLinks =
        instagram.trim() || tiktok.trim() || facebook.trim();
      const socialLinks = hasSocialLinks
        ? {
            ...(instagram.trim() ? { instagram: instagram.trim() } : {}),
            ...(tiktok.trim() ? { tiktok: tiktok.trim() } : {}),
            ...(facebook.trim() ? { facebook: facebook.trim() } : {}),
          }
        : undefined;

      await createEvent({
        title: title.trim(),
        location: location.trim(),
        date: eventDate.getTime(),
        maxAttendees: maxAttendees ? parseInt(maxAttendees, 10) : undefined,
        imageUrl,
        eventType: eventType || undefined,
        socialLinks,
      });

      router.back();
    } catch (error: any) {
      console.error("Error creating event:", error);
      Alert.alert("Error", error.message ?? "Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || isUploading;

  return (
    <View className="flex-1 bg-background mt-safe">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        contentContainerClassName="px-4 pb-6"
      >
        <View className="w-full max-w-md self-center flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-1 py-6">
            <Pressable onPress={() => router.back()} className="size-6">
              <Icon as={ArrowLeft} size={24} className="text-white" />
            </Pressable>
            <Text className="text-xl font-medium text-white">Create Event</Text>
            <View className="size-6" />
          </View>

          {/* Form Fields */}
          <View className="gap-3">
            {/* Event Title */}
            <View className="gap-3">
              <Text className="text-sm font-medium text-[#d1d1d6]">
                Event Title
              </Text>
              <Input
                value={title}
                onChangeText={setTitle}
                placeholder="Enter your event title"
                editable={!isBusy}
              />
            </View>

            {/* Location */}
            <View className="gap-3">
              <Text className="text-sm font-medium text-[#d1d1d6]">
                Location
              </Text>
              <LocationAutocompleteInput
                value={location}
                onChangeText={setLocation}
                onSelect={(place) => setLocation(place.description)}
                placeholder="Search for a location"
                editable={!isBusy}
              />
            </View>

            {/* Event Category */}
            <View className="gap-3">
              <Text className="text-sm font-medium text-[#d1d1d6]">
                Category
              </Text>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  eventTypeSheetRef.current?.present();
                }}
                disabled={isBusy}
              >
                <View className="dark:bg-input/30 bg-background border border-input h-10 rounded-md px-3 justify-center shadow-sm shadow-black/5">
                  <Text
                    className={
                      eventType
                        ? "text-base text-foreground"
                        : "text-base text-muted-foreground/50"
                    }
                  >
                    {eventType || "Select a category"}
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* Date & Time */}
            <View className="flex-row gap-3">
              <View className="flex-1 gap-3">
                <Text className="text-sm font-medium text-[#d1d1d6]">Date</Text>
                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    dateSheetRef.current?.present();
                  }}
                  disabled={isBusy}
                >
                  <View className="dark:bg-input/30 bg-background border border-input h-10 rounded-md px-3 justify-center shadow-sm shadow-black/5">
                    <Text
                      className={
                        date
                          ? "text-base text-foreground"
                          : "text-base text-muted-foreground/50"
                      }
                    >
                      {date ? formatDate(date) : "mm/dd/yyyy"}
                    </Text>
                  </View>
                </Pressable>
              </View>
              <View className="flex-1 gap-3">
                <Text className="text-sm font-medium text-[#d1d1d6]">Time</Text>
                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    timeSheetRef.current?.present();
                  }}
                  disabled={isBusy}
                >
                  <View className="dark:bg-input/30 bg-background border border-input h-10 rounded-md px-3 justify-center shadow-sm shadow-black/5">
                    <Text
                      className={
                        time
                          ? "text-base text-foreground"
                          : "text-base text-muted-foreground/50"
                      }
                    >
                      {time ? formatTime(time) : "07:00"}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Max Attendees */}
            <View className="gap-3">
              <Text className="text-sm font-medium text-[#d1d1d6]">
                Max Attendees
              </Text>
              <Input
                value={maxAttendees}
                onChangeText={setMaxAttendees}
                placeholder="Enter your max attendees"
                keyboardType="numeric"
                editable={!isBusy}
              />
            </View>

            {/* Add Photo */}
            <View className="gap-3">
              <Text className="text-sm font-medium text-[#d1d1d6]">
                Add Photo
              </Text>
              <Pressable
                onPress={handlePickPhoto}
                className="dark:bg-input/30 bg-background border border-input rounded-md p-3 items-center gap-3 shadow-sm shadow-black/5 active:opacity-70"
                disabled={isBusy}
              >
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    className="w-full h-32 rounded-md"
                    resizeMode="cover"
                  />
                ) : (
                  <>
                    <View className="bg-muted border border-border rounded-full size-10 items-center justify-center">
                      <Icon
                        as={CloudUpload}
                        size={22}
                        className="text-[#e56400]"
                      />
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-sm font-semibold text-[#e56400]">
                        Click to upload
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        or drag and drop
                      </Text>
                    </View>
                  </>
                )}
              </Pressable>
            </View>

            {/* Social Links */}
            <SocialLinkInput
              platform="instagram"
              value={instagram}
              onChangeText={setInstagram}
            />
            <SocialLinkInput
              platform="tiktok"
              value={tiktok}
              onChangeText={setTiktok}
            />
            <SocialLinkInput
              platform="facebook"
              value={facebook}
              onChangeText={setFacebook}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="w-full max-w-md self-center px-4 pb-4 mb-safe">
        <Button
          className="w-full bg-[#e56400]"
          disabled={!isFormValid || isBusy}
          onPress={handleCreate}
        >
          {isBusy ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text className="text-base font-medium text-black">
              Create Event
            </Text>
          )}
        </Button>
      </View>

      {/* Event Type Sheet */}
      <PreferenceSelectionSheet
        bottomSheetRef={eventTypeSheetRef}
        title="Event Category"
        options={[...EVENT_TYPES]}
        selectedValues={eventType || undefined}
        onSelect={(option) =>
          setEventType(eventType === option ? "" : option)
        }
      />

      {/* Date Picker Sheet */}
      <BottomSheetModal ref={dateSheetRef} snapPoints={["50%"]}>
        <View className="px-4 pb-6 gap-6">
          <Text className="text-xl font-semibold text-foreground">
            Select Date
          </Text>
          <View className="items-center">
            <DateTimePicker
              value={internalDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          </View>
          <Button onPress={handleDateDone}>
            <Text className="text-base font-medium text-primary-foreground">
              Done
            </Text>
          </Button>
        </View>
      </BottomSheetModal>

      {/* Time Picker Sheet */}
      <BottomSheetModal ref={timeSheetRef} snapPoints={["50%"]}>
        <View className="px-4 pb-6 gap-6">
          <Text className="text-xl font-semibold text-foreground">
            Select Time
          </Text>
          <View className="items-center">
            <DateTimePicker
              value={internalTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTimeChange}
            />
          </View>
          <Button onPress={handleTimeDone}>
            <Text className="text-base font-medium text-primary-foreground">
              Done
            </Text>
          </Button>
        </View>
      </BottomSheetModal>
    </View>
  );
}

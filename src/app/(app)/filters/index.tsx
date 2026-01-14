import { PreferenceRow } from "@/components/app/edit-profile/preference-row";
import { PreferenceSectionHeader } from "@/components/app/edit-profile/preference-section-header";
import { PreferenceSelectionSheet } from "@/components/app/edit-profile/preference-selection-sheet";
import { AgePicker } from "@/components/app/filters/age-picker";
import { HeightPicker } from "@/components/app/filters/height-picker";
import { WeightPicker } from "@/components/app/filters/weight-picker";
import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  ChevronLeft,
  Heart,
  Ruler,
  Sparkles,
  User,
  Weight,
} from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";

export type FilterData = {
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
  minWeight?: number;
  maxWeight?: number;
  lookingFor: string[];
  orientation: string;
  position: string;
  bodyType: string;
  ethnicity: string;
};

const FILTERS_STORAGE_KEY = "filters";
const DEFAULT_MIN_AGE = 18;
const DEFAULT_MAX_AGE = 99;
const DEFAULT_MIN_HEIGHT = 120;
const DEFAULT_MAX_HEIGHT = 220;
const DEFAULT_MIN_WEIGHT = 40;
const DEFAULT_MAX_WEIGHT = 150;

const BODY_TYPES = ["Slim", "Average", "Athletic", "Muscular", "Stocky"];
const ORIENTATIONS = [
  "Straight",
  "Gay",
  "Bisexual",
  "Queer",
  "Pansexual",
  "Asexual",
  "Demisexual",
  "Ask Me",
];
const POSITIONS = [
  "Top",
  "Bottom",
  "Versatile",
  "Vers Top",
  "Vers Bottom",
  "Side",
  "Ask Me",
  "Not Specified",
];
const ETHNICITIES = [
  "Asian",
  "Black",
  "Latino/Hispanic",
  "Middle Eastern",
  "Mixed",
  "Native American",
  "Pacific Islander",
  "South Asian",
  "White",
  "Other",
];
const LOOKING_FOR = [
  "Chat",
  "Dates",
  "Friends",
  "Networking",
  "Relationship",
  "Hookups",
  "Not Specified",
];

export default function Filters() {
  const defaultFilters: FilterData = {
    minAge: DEFAULT_MIN_AGE,
    maxAge: DEFAULT_MAX_AGE,
    minHeight: DEFAULT_MIN_HEIGHT,
    maxHeight: DEFAULT_MAX_HEIGHT,
    minWeight: DEFAULT_MIN_WEIGHT,
    maxWeight: DEFAULT_MAX_WEIGHT,
    lookingFor: [],
    orientation: "",
    position: "",
    bodyType: "",
    ethnicity: "",
  };
  const [filters, setFilters] = React.useState<FilterData>(defaultFilters);

  // Bottom sheet refs
  const ageRangeSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const heightRangeSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const weightRangeSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const lookingForSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const positionSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const bodyTypeSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const ethnicitySheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const orientationSheetRef = React.useRef<GorhomBottomSheetModal>(null);

  React.useEffect(() => {
    const loadFilters = async () => {
      try {
        const savedFilters = await AsyncStorage.getItem(FILTERS_STORAGE_KEY);
        if (savedFilters) {
          const parsed = JSON.parse(savedFilters);
          setFilters({
            minAge: parsed.minAge ?? DEFAULT_MIN_AGE,
            maxAge: parsed.maxAge ?? DEFAULT_MAX_AGE,
            minHeight: parsed.minHeight ?? DEFAULT_MIN_HEIGHT,
            maxHeight: parsed.maxHeight ?? DEFAULT_MAX_HEIGHT,
            minWeight: parsed.minWeight ?? DEFAULT_MIN_WEIGHT,
            maxWeight: parsed.maxWeight ?? DEFAULT_MAX_WEIGHT,
            lookingFor: parsed.lookingFor ?? [],
            orientation: parsed.orientation ?? "",
            position: parsed.position ?? "",
            bodyType: parsed.bodyType ?? "",
            ethnicity: parsed.ethnicity ?? "",
          });
        }
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    };
    loadFilters();
  }, []);

  const handleClear = () => {
    setFilters(defaultFilters);
    AsyncStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(defaultFilters));
  };

  const handleApply = async () => {
    try {
      await AsyncStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error("Error saving filters:", error);
    }
    router.back();
  };

  const formatAgeRange = () => {
    const min = filters.minAge ?? DEFAULT_MIN_AGE;
    const max = filters.maxAge ?? DEFAULT_MAX_AGE;
    if (min === DEFAULT_MIN_AGE && max === DEFAULT_MAX_AGE) return undefined;
    return `${min} - ${max}`;
  };

  const formatHeightRange = () => {
    const min = filters.minHeight ?? DEFAULT_MIN_HEIGHT;
    const max = filters.maxHeight ?? DEFAULT_MAX_HEIGHT;
    if (min === DEFAULT_MIN_HEIGHT && max === DEFAULT_MAX_HEIGHT)
      return undefined;
    return `${min}cm - ${max}cm`;
  };

  const formatWeightRange = () => {
    const min = filters.minWeight ?? DEFAULT_MIN_WEIGHT;
    const max = filters.maxWeight ?? DEFAULT_MAX_WEIGHT;
    if (min === DEFAULT_MIN_WEIGHT && max === DEFAULT_MAX_WEIGHT)
      return undefined;
    return `${min}kg - ${max}kg`;
  };

  return (
    <View className="flex-1 mt-safe">
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
              <Icon as={ChevronLeft} size={24} className="text-white" />
            </Pressable>
            <Text className="text-xl font-medium text-white">Filters</Text>
            <View className="size-6" />
          </View>

          <View className="gap-4">
            {/* Measurements Section */}
            <View>
              <PreferenceSectionHeader icon={Ruler} title="Measurements" />
              <View className="rounded-xl overflow-hidden">
                <PreferenceRow
                  label="Age Range"
                  values={formatAgeRange()}
                  onPress={() => ageRangeSheetRef.current?.present()}
                />
                <PreferenceRow
                  label="Height Range"
                  values={formatHeightRange()}
                  onPress={() => heightRangeSheetRef.current?.present()}
                />
                <PreferenceRow
                  label="Weight Range"
                  values={formatWeightRange()}
                  onPress={() => weightRangeSheetRef.current?.present()}
                  isLast
                />
              </View>
            </View>

            {/* Expectations Section */}
            <View>
              <PreferenceSectionHeader icon={Heart} title="Expectations" />
              <View className="rounded-xl overflow-hidden">
                <PreferenceRow
                  label="Looking For"
                  values={
                    filters.lookingFor.length > 0
                      ? filters.lookingFor
                      : undefined
                  }
                  onPress={() => lookingForSheetRef.current?.present()}
                />
                <PreferenceRow
                  label="Position"
                  values={filters.position || undefined}
                  onPress={() => positionSheetRef.current?.present()}
                  isLast
                />
              </View>
            </View>

            {/* Physical Section */}
            <View>
              <PreferenceSectionHeader icon={Sparkles} title="Physical" />
              <View className="rounded-xl overflow-hidden">
                <PreferenceRow
                  label="Body Type"
                  values={filters.bodyType || undefined}
                  onPress={() => bodyTypeSheetRef.current?.present()}
                />
                <PreferenceRow
                  label="Ethnicity"
                  values={filters.ethnicity || undefined}
                  onPress={() => ethnicitySheetRef.current?.present()}
                  isLast
                />
              </View>
            </View>

            {/* Identity Section */}
            <View>
              <PreferenceSectionHeader icon={User} title="Identity" />
              <View className="rounded-xl overflow-hidden">
                <PreferenceRow
                  label="Sexual Orientation"
                  values={filters.orientation || undefined}
                  onPress={() => orientationSheetRef.current?.present()}
                  isLast
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View className="w-full max-w-md self-center flex-row gap-2 px-4 pb-4 mb-safe">
        <Button variant="outline" className="flex-1" onPress={handleClear}>
          <Text className="text-base font-medium">Clear</Text>
        </Button>
        <Button className="flex-1" onPress={handleApply}>
          <Text className="text-base font-medium text-primary-foreground">
            Apply
          </Text>
        </Button>
      </View>

      {/* Selection Sheets */}
      <PreferenceSelectionSheet
        bottomSheetRef={lookingForSheetRef}
        title="Looking For"
        options={LOOKING_FOR}
        selectedValues={filters.lookingFor}
        multiSelect
        onSelect={(option) =>
          setFilters({
            ...filters,
            lookingFor: filters.lookingFor.includes(option)
              ? filters.lookingFor.filter((type) => type !== option)
              : [...filters.lookingFor, option],
          })
        }
      />

      <PreferenceSelectionSheet
        bottomSheetRef={positionSheetRef}
        title="Position"
        options={POSITIONS}
        selectedValues={filters.position || undefined}
        onSelect={(option) =>
          setFilters({
            ...filters,
            position: filters.position === option ? "" : option,
          })
        }
      />

      <PreferenceSelectionSheet
        bottomSheetRef={bodyTypeSheetRef}
        title="Body Type"
        options={BODY_TYPES}
        selectedValues={filters.bodyType || undefined}
        onSelect={(option) =>
          setFilters({
            ...filters,
            bodyType: filters.bodyType === option ? "" : option,
          })
        }
      />

      <PreferenceSelectionSheet
        bottomSheetRef={ethnicitySheetRef}
        title="Ethnicity"
        options={ETHNICITIES}
        selectedValues={filters.ethnicity || undefined}
        onSelect={(option) =>
          setFilters({
            ...filters,
            ethnicity: filters.ethnicity === option ? "" : option,
          })
        }
      />

      <PreferenceSelectionSheet
        bottomSheetRef={orientationSheetRef}
        title="Sexual Orientation"
        options={ORIENTATIONS}
        selectedValues={filters.orientation || undefined}
        onSelect={(option) =>
          setFilters({
            ...filters,
            orientation: filters.orientation === option ? "" : option,
          })
        }
      />

      {/* Range Picker Sheets */}
      <BottomSheetModal ref={ageRangeSheetRef}>
        <View className="px-4 pb-6 gap-6">
          <Text className="text-xl font-semibold text-foreground">
            Age Range
          </Text>
          <AgePicker
            minAge={filters.minAge ?? DEFAULT_MIN_AGE}
            maxAge={filters.maxAge ?? DEFAULT_MAX_AGE}
            onMinAgeChange={(age) => setFilters({ ...filters, minAge: age })}
            onMaxAgeChange={(age) => setFilters({ ...filters, maxAge: age })}
          />
          <Button onPress={() => ageRangeSheetRef.current?.dismiss()}>
            <Text className="text-base font-medium text-primary-foreground">
              Done
            </Text>
          </Button>
        </View>
      </BottomSheetModal>

      <BottomSheetModal ref={heightRangeSheetRef}>
        <View className="px-4 pb-6 gap-6">
          <Text className="text-xl font-semibold text-foreground">
            Height Range
          </Text>
          <HeightPicker
            minHeight={filters.minHeight ?? DEFAULT_MIN_HEIGHT}
            maxHeight={filters.maxHeight ?? DEFAULT_MAX_HEIGHT}
            onMinHeightChange={(height) =>
              setFilters({ ...filters, minHeight: height })
            }
            onMaxHeightChange={(height) =>
              setFilters({ ...filters, maxHeight: height })
            }
          />
          <Button onPress={() => heightRangeSheetRef.current?.dismiss()}>
            <Text className="text-base font-medium text-primary-foreground">
              Done
            </Text>
          </Button>
        </View>
      </BottomSheetModal>

      <BottomSheetModal ref={weightRangeSheetRef}>
        <View className="px-4 pb-6 gap-6">
          <Text className="text-xl font-semibold text-foreground">
            Weight Range
          </Text>
          <WeightPicker
            minWeight={filters.minWeight ?? DEFAULT_MIN_WEIGHT}
            maxWeight={filters.maxWeight ?? DEFAULT_MAX_WEIGHT}
            onMinWeightChange={(weight) =>
              setFilters({ ...filters, minWeight: weight })
            }
            onMaxWeightChange={(weight) =>
              setFilters({ ...filters, maxWeight: weight })
            }
          />
          <Button onPress={() => weightRangeSheetRef.current?.dismiss()}>
            <Text className="text-base font-medium text-primary-foreground">
              Done
            </Text>
          </Button>
        </View>
      </BottomSheetModal>
    </View>
  );
}

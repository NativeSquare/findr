import { FilterData } from "@/app/(app)/filters";
import { LookingForField } from "@/components/app/profile/looking-for-field";
import { SexualOrientationField } from "@/components/app/profile/sexual-orientation-field";
import { BottomSheetModal } from "@/components/custom/bottom-sheet";
import { RangeSlider } from "@/components/custom/range-slider";
import { Slider } from "@/components/custom/slider";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";
import { ScrollView, View } from "react-native";

const FILTERS_STORAGE_KEY = "filters";
const DEFAULT_MAX_DISTANCE = 10000; // meters (10km)
const DEFAULT_MIN_AGE = 25;
const DEFAULT_MAX_AGE = 70;

interface FiltersBottomSheetProps {
  bottomSheetModalRef: React.RefObject<GorhomBottomSheetModal | null>;
  filters: FilterData;
  setFilters: React.Dispatch<React.SetStateAction<FilterData>>;
  defaultFilters: FilterData;
}

export function FiltersBottomSheet({
  bottomSheetModalRef,
  filters,
  setFilters,
  defaultFilters,
}: FiltersBottomSheetProps) {
  // Internal state for filters - only applied when "View Results" is clicked
  const [internalFilters, setInternalFilters] = React.useState<FilterData>(filters);

  // Sync internal state when modal opens or when filters prop changes
  React.useEffect(() => {
    setInternalFilters(filters);
  }, [filters]);

  const handleClear = React.useCallback(() => {
    setInternalFilters(defaultFilters);
  }, [defaultFilters]);

  const handleViewResults = React.useCallback(async () => {
    setFilters(internalFilters);
    try {
      await AsyncStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(internalFilters));
    } catch (error) {
      console.error("Error saving filters:", error);
    }
    bottomSheetModalRef.current?.dismiss();
  }, [internalFilters, setFilters, bottomSheetModalRef]);

  return (
    <BottomSheetModal ref={bottomSheetModalRef}>
      <View className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pb-6"
        >
          <View className="gap-6 pt-3">
            <Text className="text-xl font-semibold text-foreground">
              Filters
            </Text>

            <View className="gap-6">
              <View className="flex flex-col gap-6">
                <Text className="text-sm text-muted-foreground">
                  Max Distance: {Math.round(internalFilters.maxDistance / 1000)}km
                </Text>
                <Slider
                  minimumValue={1000}
                  maximumValue={50000}
                  step={1000}
                  value={internalFilters.maxDistance}
                  onValueChange={(value) =>
                    setInternalFilters({ ...internalFilters, maxDistance: value })
                  }
                />
              </View>

              <View className="gap-6">
                <Text className="text-sm text-muted-foreground">
                  Age Range: {internalFilters.minAge ?? DEFAULT_MIN_AGE} -{" "}
                  {internalFilters.maxAge ?? DEFAULT_MAX_AGE}
                </Text>
                <RangeSlider
                  minimumValue={18}
                  maximumValue={100}
                  step={1}
                  valueMin={internalFilters.minAge ?? DEFAULT_MIN_AGE}
                  valueMax={internalFilters.maxAge ?? DEFAULT_MAX_AGE}
                  onValueChange={(min, max) => {
                    setInternalFilters({
                      ...internalFilters,
                      minAge: min,
                      maxAge: max,
                    });
                  }}
                />
              </View>

              <SexualOrientationField
                onSelect={(option) =>
                  setInternalFilters({
                    ...internalFilters,
                    orientation: internalFilters.orientation === option ? "" : option,
                  })
                }
                isSelected={(option) => internalFilters.orientation === option}
              />

              <LookingForField
                onSelect={(option) =>
                  setInternalFilters({
                    ...internalFilters,
                    lookingFor: internalFilters.lookingFor.includes(option)
                      ? internalFilters.lookingFor.filter((type) => type !== option)
                      : [...internalFilters.lookingFor, option],
                  })
                }
                isSelected={(option) => internalFilters.lookingFor.includes(option)}
              />
            </View>
          </View>
        </ScrollView>
        <View className="w-full flex-row gap-2 px-4 pb-6">
          <Button variant="outline" className="flex-1" onPress={handleClear}>
            <Text className="text-base font-medium">Clear</Text>
          </Button>
          <Button className="flex-1" onPress={handleViewResults}>
            <Text className="text-base font-medium text-primary-foreground">
              View Results
            </Text>
          </Button>
        </View>
      </View>
    </BottomSheetModal>
  );
}

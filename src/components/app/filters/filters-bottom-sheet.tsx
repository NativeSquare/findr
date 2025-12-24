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
  const handleClear = React.useCallback(() => {
    setFilters(defaultFilters);
    AsyncStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(defaultFilters));
  }, [setFilters]);

  // const handleApply = React.useCallback(() => {
  //   setFilters(newFilters);
  //   AsyncStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
  //   bottomSheetModalRef.current?.dismiss();
  // }, []);

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
                  Max Distance: {Math.round(filters.maxDistance / 1000)}km
                </Text>
                <Slider
                  minimumValue={1000}
                  maximumValue={50000}
                  step={1000}
                  value={filters.maxDistance}
                  onValueChange={(value) =>
                    setFilters({ ...filters, maxDistance: value })
                  }
                />
              </View>

              <View className="gap-6">
                <Text className="text-sm text-muted-foreground">
                  Age Range: {filters.minAge ?? DEFAULT_MIN_AGE} -{" "}
                  {filters.maxAge ?? DEFAULT_MAX_AGE}
                </Text>
                <RangeSlider
                  minimumValue={18}
                  maximumValue={100}
                  step={1}
                  valueMin={filters.minAge ?? DEFAULT_MIN_AGE}
                  valueMax={filters.maxAge ?? DEFAULT_MAX_AGE}
                  onValueChange={(min, max) => {
                    setFilters({
                      ...filters,
                      minAge: min,
                      maxAge: max,
                    });
                  }}
                />
              </View>

              <SexualOrientationField
                onSelect={(option) =>
                  setFilters({
                    ...filters,
                    orientation: filters.orientation === option ? "" : option,
                  })
                }
                isSelected={(option) => filters.orientation === option}
              />

              <LookingForField
                onSelect={(option) =>
                  setFilters({
                    ...filters,
                    lookingFor: filters.lookingFor.includes(option)
                      ? filters.lookingFor.filter((type) => type !== option)
                      : [...filters.lookingFor, option],
                  })
                }
                isSelected={(option) => filters.lookingFor.includes(option)}
              />
            </View>
          </View>
        </ScrollView>
        <View className="w-full flex-row gap-2 px-4 pb-6">
          <Button variant="outline" className="flex-1" onPress={handleClear}>
            <Text className="text-base font-medium">Clear</Text>
          </Button>
          {/* <Button className="flex-1" onPress={handleApply}>
            <Text className="text-base font-medium text-primary-foreground">
              Apply
            </Text>
          </Button> */}
        </View>
      </View>
    </BottomSheetModal>
  );
}

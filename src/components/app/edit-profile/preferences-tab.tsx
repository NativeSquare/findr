import { EditProfileFormData } from "@/app/(app)/edit-profile";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { Heart, Sparkles, User, Users } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { PreferenceRow } from "./preference-row";
import { PreferenceSectionHeader } from "./preference-section-header";
import { PreferenceSelectionSheet } from "./preference-selection-sheet";

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
const RELATIONSHIP_STATUSES = [
  "Single",
  "Dating",
  "Committed",
  "Open relationship",
  "Married",
  "Partnered",
  "Polyamorous",
];

export function PreferencesTab({
  formData,
  setFormData,
}: {
  formData: EditProfileFormData;
  setFormData: (data: EditProfileFormData) => void;
}) {
  const bodyTypesSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const orientationSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const positionSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const ethnicitySheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const lookingForSheetRef = React.useRef<GorhomBottomSheetModal>(null);
  const relationshipStatusSheetRef = React.useRef<GorhomBottomSheetModal>(null);

  return (
    <View className="gap-4">
      {/* Expectations Section */}
      <View>
        <PreferenceSectionHeader icon={Heart} title="Expectations" />
        <View className="rounded-xl overflow-hidden">
          <PreferenceRow
            label="Looking For"
            values={formData.lookingFor}
            onPress={() => lookingForSheetRef.current?.present()}
          />
          <PreferenceRow
            label="Position"
            values={formData.position}
            onPress={() => positionSheetRef.current?.present()}
            isLast
          />
        </View>
      </View>

      {/* Relationship Status Section */}
      <View>
        <PreferenceSectionHeader icon={Users} title="Relationship Status" />
        <View className="rounded-xl overflow-hidden">
          <PreferenceRow
            label="Status"
            values={formData.relationshipStatus}
            onPress={() => relationshipStatusSheetRef.current?.present()}
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
            values={formData.bodyTypes}
            onPress={() => bodyTypesSheetRef.current?.present()}
          />
          <PreferenceRow
            label="Ethnicity"
            values={formData.ethnicity}
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
            values={formData.orientation}
            onPress={() => orientationSheetRef.current?.present()}
            isLast
          />
        </View>
      </View>

      <PreferenceSelectionSheet
        bottomSheetRef={bodyTypesSheetRef}
        title="Body Type"
        options={BODY_TYPES}
        selectedValues={formData.bodyTypes}
        onSelect={(option) =>
          setFormData({
            ...formData,
            bodyTypes: formData.bodyTypes === option ? undefined : option,
          })
        }
      />

      <PreferenceSelectionSheet
        bottomSheetRef={orientationSheetRef}
        title="Sexual Orientation"
        options={ORIENTATIONS}
        selectedValues={formData.orientation}
        onSelect={(option) =>
          setFormData({
            ...formData,
            orientation: option,
          })
        }
      />

      <PreferenceSelectionSheet
        bottomSheetRef={positionSheetRef}
        title="Position"
        options={POSITIONS}
        selectedValues={formData.position}
        onSelect={(option) =>
          setFormData({
            ...formData,
            position: formData.position === option ? undefined : option,
          })
        }
      />

      <PreferenceSelectionSheet
        bottomSheetRef={ethnicitySheetRef}
        title="Ethnicity"
        options={ETHNICITIES}
        selectedValues={formData.ethnicity}
        onSelect={(option) =>
          setFormData({
            ...formData,
            ethnicity: formData.ethnicity === option ? undefined : option,
          })
        }
      />

      <PreferenceSelectionSheet
        bottomSheetRef={lookingForSheetRef}
        title="Looking For"
        options={LOOKING_FOR}
        selectedValues={formData.lookingFor}
        multiSelect
        onSelect={(option) =>
          setFormData({
            ...formData,
            lookingFor: formData.lookingFor?.includes(option)
              ? formData.lookingFor?.filter((type) => type !== option)
              : [...(formData.lookingFor || []), option],
          })
        }
      />

      <PreferenceSelectionSheet
        bottomSheetRef={relationshipStatusSheetRef}
        title="Relationship Status"
        options={RELATIONSHIP_STATUSES}
        selectedValues={formData.relationshipStatus}
        onSelect={(option) =>
          setFormData({
            ...formData,
            relationshipStatus:
              formData.relationshipStatus === option ? undefined : option,
          })
        }
      />
    </View>
  );
}

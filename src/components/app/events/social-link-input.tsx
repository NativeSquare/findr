import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import type { LucideIcon } from "lucide-react-native";
import { Facebook, Instagram } from "lucide-react-native";
import { TextInput, View } from "react-native";

export type SocialPlatform = "instagram" | "tiktok" | "facebook";

export type SocialLinkInputProps = {
  platform: SocialPlatform;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

const PLATFORM_CONFIG: Record<
  SocialPlatform,
  {
    label: string;
    prefix: string;
    lucideIcon?: LucideIcon;
    ionIcon?: string;
    color: string;
  }
> = {
  instagram: {
    label: "Instagram",
    prefix: "@",
    lucideIcon: Instagram,
    color: "#E1306C",
  },
  tiktok: {
    label: "TikTok",
    prefix: "@",
    ionIcon: "logo-tiktok",
    color: "#ffffff",
  },
  facebook: {
    label: "Facebook",
    prefix: "",
    lucideIcon: Facebook,
    color: "#1877F2",
  },
};

export function SocialLinkInput({
  platform,
  value,
  onChangeText,
  placeholder,
}: SocialLinkInputProps) {
  const config = PLATFORM_CONFIG[platform];

  return (
    <View className="gap-3">
      <Text className="text-sm font-medium text-[#d1d1d6]">{config.label}</Text>
      <View className="flex-row items-center bg-[#131316] border border-[#1a1a1e] rounded-lg px-3.5 py-3 gap-3">
        {config.lucideIcon ? (
          <Icon as={config.lucideIcon} size={20} color={config.color} />
        ) : config.ionIcon ? (
          <Ionicons
            name={config.ionIcon as any}
            size={20}
            color={config.color}
          />
        ) : null}
        {config.prefix ? (
          <Text className="text-base text-[#70707b]">{config.prefix}</Text>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || `Enter username`}
          placeholderTextColor="#70707b"
          className="flex-1 text-base text-white p-0"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

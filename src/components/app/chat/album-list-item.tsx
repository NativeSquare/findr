import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Image as ImageIcon, Trash2 } from "lucide-react-native";
import { Image, Pressable, View } from "react-native";

export type AlbumListItemProps = {
  id: string;
  title: string;
  photoCount: number;
  coverPhotoUrl?: string;
  thumbnailUrls?: string[];
  onPress?: () => void;
  onDelete?: () => void;
};

export function AlbumListItem({
  title,
  photoCount,
  coverPhotoUrl,
  thumbnailUrls = [],
  onPress,
  onDelete,
}: AlbumListItemProps) {
  const hasActions = !!onDelete;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild disabled={!hasActions}>
        <Pressable
          onPress={onPress}
          className="bg-[#1a1a1e] border border-[#26272b] rounded-xl p-2 active:opacity-70"
        >
          <View className="flex-col gap-2">
            {/* Cover photo section */}
            <View className="flex-col gap-1">
              {/* Main cover photo */}
              <View className="bg-[#26272b] rounded-md h-[120px] w-full overflow-hidden">
                {coverPhotoUrl ? (
                  <Image
                    source={{ uri: coverPhotoUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Icon as={ImageIcon} size={24} className="text-[#70707b]" />
                  </View>
                )}
              </View>
              {/* Thumbnail row */}
              <View className="flex-row gap-1">
                {[0, 1, 2].map((index) => {
                  const thumbnailUrl = thumbnailUrls[index];
                  return (
                    <View
                      key={index}
                      className="bg-[#26272b] rounded-md h-[50px] flex-1 overflow-hidden"
                    >
                      {thumbnailUrl ? (
                        <Image
                          source={{ uri: thumbnailUrl }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Icon
                            as={ImageIcon}
                            size={20}
                            className="text-[#70707b]"
                          />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
            {/* Title and photo count */}
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-white flex-1">
                {title}
              </Text>
              <Text className="text-xs leading-[18px] text-[#d1d1d6]">
                {photoCount}
              </Text>
            </View>
          </View>
        </Pressable>
      </ContextMenuTrigger>
      {hasActions && (
        <ContextMenuContent
          className="bg-[#131316] border border-[#1a1a1e] rounded-lg shadow-lg min-w-[200px]"
          align="end"
        >
          {onDelete && (
            <ContextMenuItem
              onPress={onDelete}
              variant="destructive"
              className="bg-[#131316] px-3.5 py-3 gap-2"
            >
              <Icon as={Trash2} size={16} className="text-[#f04438]" />
              <Text className="text-sm leading-5 text-[#f04438]">Delete</Text>
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}

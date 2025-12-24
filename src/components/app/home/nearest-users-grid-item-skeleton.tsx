import { Skeleton } from "@/components/ui/skeleton";
import { View } from "react-native";

export function NearestUsersGridItemSkeleton() {
  return (
    <View className="relative aspect-square">
      <Skeleton className="size-full rounded-xl" />
      <View className="absolute bottom-3 left-3 right-3 flex-col gap-2">
        <View className="flex-row items-center gap-2">
          <Skeleton className="size-2 shrink-0 rounded-full" />
          <Skeleton className="h-4 flex-1 rounded" />
        </View>
        <Skeleton className="h-3 w-20 rounded" />
      </View>
    </View>
  );
}


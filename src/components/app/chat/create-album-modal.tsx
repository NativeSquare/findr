import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

export type CreateAlbumModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlbumCreated?: () => void;
};

export function CreateAlbumModal({
  open,
  onOpenChange,
  onAlbumCreated,
}: CreateAlbumModalProps) {
  const [albumTitle, setAlbumTitle] = useState("");
  const createAlbum = useMutation(api.albums.createAlbum);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!albumTitle.trim() || isCreating) return;

    setIsCreating(true);
    try {
      await createAlbum({ title: albumTitle.trim() });
      setAlbumTitle("");
      onOpenChange(false);
      onAlbumCreated?.();
    } catch (error) {
      console.error("Failed to create album:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setAlbumTitle("");
    onOpenChange(false);
  };

  const isTitleValid = albumTitle.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <DialogContent className="w-80">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold">
              Create Album
            </DialogTitle>
          </DialogHeader>

          <View className="gap-6">
            <View className="gap-3">
              <Label className="text-sm font-medium text-[#d1d1d6]">
                Album Title
              </Label>
                <Input
                  value={albumTitle}
                  onChangeText={setAlbumTitle}
                  placeholder="Album name"
                  placeholderTextColor="#70707b"
                  autoFocus
                />
            </View>

            <View className="flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full border-primary"
                onPress={handleCancel}
                disabled={isCreating}
              >
                <Text className="text-base font-medium leading-6 text-primary">
                  Cancel
                </Text>
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onPress={handleCreate}
                disabled={!isTitleValid || isCreating}
              >
                <Text className="text-base font-medium leading-6 text-black">
                  Create
                </Text>
              </Button>
            </View>
          </View>
        </DialogContent>
      </KeyboardAvoidingView>
    </Dialog>
  );
}

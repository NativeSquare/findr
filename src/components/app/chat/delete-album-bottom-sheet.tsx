import { ConfirmBottomSheet } from "@/components/custom/confirm-bottom-sheet";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import * as React from "react";

export type DeleteAlbumBottomSheetProps = {
  bottomSheetModalRef: React.RefObject<GorhomBottomSheetModal | null>;
  albumTitle: string;
  photoCount: number;
  onConfirm: () => void;
  onCancel?: () => void;
};

export function DeleteAlbumBottomSheet({
  bottomSheetModalRef,
  albumTitle,
  photoCount,
  onConfirm,
  onCancel,
}: DeleteAlbumBottomSheetProps) {
  return (
    <ConfirmBottomSheet
      bottomSheetModalRef={bottomSheetModalRef}
      title="Delete Album"
      description={`Delete 1 album (${photoCount} items)?`}
      confirmLabel="Delete"
      confirmVariant="destructive"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

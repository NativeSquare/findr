import { ConfirmBottomSheet } from "@/components/custom/confirm-bottom-sheet";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import * as React from "react";

interface DeleteAccountBottomSheetProps {
  bottomSheetModalRef: React.RefObject<GorhomBottomSheetModal | null>;
  onConfirm: () => void;
}

export function DeleteAccountBottomSheet({
  bottomSheetModalRef,
  onConfirm,
}: DeleteAccountBottomSheetProps) {
  return (
    <ConfirmBottomSheet
      bottomSheetModalRef={bottomSheetModalRef}
      title="Delete Account"
      description="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
      confirmLabel="Delete Account"
      confirmVariant="destructive"
      onConfirm={onConfirm}
    />
  );
}

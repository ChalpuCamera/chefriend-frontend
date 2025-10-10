"use client";

import DaumPostcode from "react-daum-postcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddressSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddressSelect: (address: string) => void;
}

export function AddressSearch({ open, onOpenChange, onAddressSelect }: AddressSearchProps) {
  const handleComplete = (data: { address: string; addressType: string; bname: string; buildingName: string }) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    onAddressSelect(fullAddress);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-none p-4">
        <DialogHeader>
          <DialogTitle>주소 검색</DialogTitle>
        </DialogHeader>
        <div className="mt-3">
          <DaumPostcode onComplete={handleComplete} autoClose={false} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

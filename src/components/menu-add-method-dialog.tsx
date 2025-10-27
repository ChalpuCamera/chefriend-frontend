"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Edit3 } from "lucide-react";

interface MenuAddMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMethod: (method: "ai" | "manual") => void;
}

export function MenuAddMethodDialog({
  open,
  onOpenChange,
  onSelectMethod,
}: MenuAddMethodDialogProps) {
  const handleSelectAI = () => {
    onSelectMethod("ai");
    onOpenChange(false);
  };

  const handleSelectManual = () => {
    onSelectMethod("manual");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[360px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-center text-lg">
            메뉴 추가 방법을 선택해주세요
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-3">
          {/* AI 추출 옵션 */}
          <button
            onClick={handleSelectAI}
            className="w-full flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Camera className="w-6 h-6 text-purple-700" />
            </div>
            <div className="flex-1">
              <div className="text-body-sb text-gray-800 mb-1">
                메뉴판 사진으로 추가하기
              </div>
              <div className="text-xs text-gray-500">
                AI가 자동으로 메뉴를 추출해요
              </div>
            </div>
          </button>

          {/* 직접 추가 옵션 */}
          <button
            onClick={handleSelectManual}
            className="w-full flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Edit3 className="w-6 h-6 text-blue-700" />
            </div>
            <div className="flex-1">
              <div className="text-body-sb text-gray-800 mb-1">
                직접 하나씩 추가하기
              </div>
              <div className="text-xs text-gray-500">
                메뉴 정보를 직접 입력해요
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

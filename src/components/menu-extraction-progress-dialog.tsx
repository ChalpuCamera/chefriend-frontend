"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface MenuExtractionProgressDialogProps {
  open: boolean;
  progress: number;
  currentStep: string;
}

export function MenuExtractionProgressDialog({
  open,
  progress,
  currentStep,
}: MenuExtractionProgressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-[320px] p-8"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        aria-describedby="extraction-description"
      >
        <VisuallyHidden>
          <DialogTitle>메뉴 추출 중</DialogTitle>
        </VisuallyHidden>

        <div id="extraction-description" className="flex flex-col items-center gap-6">
          {/* 로딩 스피너 */}
          <div className="relative">
            <Loader2 className="w-16 h-16 text-purple-700 animate-spin" />
          </div>

          {/* 타이틀 */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              메뉴를 추출하고 있어요
            </h3>
            <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
          </div>

          {/* 진행 상태 */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{currentStep}</span>
              <span className="text-purple-700 font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

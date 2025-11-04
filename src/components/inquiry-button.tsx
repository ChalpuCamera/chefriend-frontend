"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { inquiryApi } from "@/lib/api/landing/inquiry";
import { toast } from "sonner";

interface InquiryButtonProps {
  source: string; // "home page" | "faq page" | "menu page" 등
  variant?: "primary" | "secondary";
  className?: string;
  title?: string;
}

export function InquiryButton({
  source,
  variant = "primary",
  className,
  title,
}: InquiryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("문의 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const contentWithSource = `${content.trim()} [from ${source}]`;
      await inquiryApi.saveInquiry({ content: contentWithSource });
      toast.success("문의가 접수되었습니다!");
      setContent("");
      setIsOpen(false);
    } catch (error) {
      console.error("Inquiry submit failed:", error);
      toast.error("문의 전송에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 버튼 스타일 결정
  const buttonClassName =
    variant === "primary"
      ? "w-40 h-9 bg-purple-600 text-sub-body-sb text-white rounded-[8px] hover:bg-purple-700"
      : "w-40 h-9 bg-gray-200 text-sub-body-sb text-gray-800 rounded-[8px] hover:bg-gray-300";

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={className || buttonClassName}
      >
        {title || "개발자에게 문의하기"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-title-2 text-gray-800">
            {title || "개발자에게 문의하기"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="문의 내용을 입력해주세요"
              className="min-h-[120px] bg-gray-200 rounded-[12px] p-4 text-body-r placeholder:text-gray-500 resize-none"
              rows={5}
            />
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="flex-1 bg-purple-700 text-white hover:bg-purple-800"
              >
                {isSubmitting ? "전송 중..." : "보내기"}
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                취소
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

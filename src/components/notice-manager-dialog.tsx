"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { StoreNoticeResponse } from "@/lib/types/api/notice";

interface NoticeManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  notice?: StoreNoticeResponse; // edit 모드일 때 전달되는 기존 공지사항
  onSubmit: (data: { title: string; body: string; isRepresentative: boolean }) => void;
  isLoading?: boolean;
}

export function NoticeManagerDialog({
  open,
  onOpenChange,
  mode,
  notice,
  onSubmit,
  isLoading = false,
}: NoticeManagerDialogProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});

  // edit 모드일 때 notice 데이터로 폼 초기화
  useEffect(() => {
    if (mode === "edit" && notice) {
      setTitle(notice.title);
      setBody(notice.body);
    } else {
      setTitle("");
      setBody("");
    }
    setErrors({});
  }, [mode, notice, open]);

  const validateForm = (): boolean => {
    const newErrors: { title?: string; body?: string } = {};

    if (!title.trim()) {
      newErrors.title = "제목을 입력해주세요";
    } else if (title.length > 100) {
      newErrors.title = "제목은 100자 이내로 입력해주세요";
    }

    if (!body.trim()) {
      newErrors.body = "내용을 입력해주세요";
    } else if (body.length > 1000) {
      newErrors.body = "내용은 1000자 이내로 입력해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      body: body.trim(),
      isRepresentative: notice?.isRepresentative ?? false, // 기존 값 유지 또는 false
    });
  };

  const handleCancel = () => {
    setTitle("");
    setBody("");
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            {mode === "create" ? "공지사항 추가" : "공지사항 수정"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="notice-title">제목 *</Label>
            <Input
              id="notice-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              placeholder="공지사항 제목을 입력하세요"
              maxLength={100}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {title.length}/100
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notice-body">내용 *</Label>
            <Textarea
              id="notice-body"
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (errors.body) setErrors({ ...errors, body: undefined });
              }}
              placeholder="공지사항 내용을 입력하세요"
              maxLength={1000}
              className="h-[200px] resize-none"
              aria-invalid={!!errors.body}
            />
            {errors.body && (
              <p className="text-xs text-destructive">{errors.body}</p>
            )}
            <p className="text-xs text-muted-foreground">{body.length}/1000</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="flex-1">
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 bg-purple-700 text-white">
              {isLoading
                ? mode === "create"
                  ? "추가 중..."
                  : "수정 중..."
                : mode === "create"
                  ? "추가"
                  : "수정"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

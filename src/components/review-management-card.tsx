"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteFoodQuestions } from "@/lib/hooks/useFoodQuestions"

interface ReviewManagementCardProps {
  foodId: number
  name: string
  price: number
  imageUrl: string
  questionCount: number
  reviewCount: number
}

export function ReviewManagementCard({
  foodId,
  name,
  price,
  imageUrl,
  questionCount,
  reviewCount
}: ReviewManagementCardProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteMutation = useDeleteFoodQuestions()

  const handleEdit = () => {
    router.push(`/review/add?foodId=${foodId}`)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync(foodId)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div className="flex gap-3 p-4 bg-white rounded-[12px] border border-gray-100 shadow-sm">
        {/* Image */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <Image
            src={imageUrl || "/menu_icon.png"}
            alt={name}
            fill
            className="object-cover rounded-[8px]"
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-body-sb text-gray-900 mb-1">{name}</h3>
            <p className="text-small-m text-gray-600 mb-2">
              {price.toLocaleString()}원
            </p>
            <div className="flex items-center gap-3 text-small-r">
              <span className="text-gray-600">
                평가 항목: <span className="text-purple-700 font-medium">{Math.max(0, questionCount - 3)}개</span>
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">
                받은 리뷰: <span className="text-gray-900 font-medium">{reviewCount}개</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEdit}
              className="flex-1 py-2 px-3 bg-purple-50 text-purple-700 rounded-[8px] text-small-sb hover:bg-purple-100 transition-colors"
            >
              평가 항목 수정
            </button>
            <button
              onClick={handleDelete}
              className="py-2 px-3 bg-gray-50 text-gray-600 rounded-[8px] text-small-sb hover:bg-gray-100 transition-colors"
            >
              리뷰 끄기
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>리뷰 받기 종료</DialogTitle>
            <DialogDescription>
              &quot;{name}&quot; 메뉴의 리뷰 받기를 종료하시겠습니까?
              <br />
              설정된 평가 항목이 모두 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2">
            
          <Button
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 bg-purple-700 text-white hover:bg-purple-800"
            >
              {deleteMutation.isPending ? "종료 중..." : "종료"}
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(false)}
              
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
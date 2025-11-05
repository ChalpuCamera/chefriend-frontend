"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
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
            src={imageUrl || "/placeholder-food.png"}
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
                평가 항목: <span className="text-purple-700 font-medium">{Math.max(0, questionCount - 1)}개</span>
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
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>리뷰 받기 종료</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{name}&quot; 메뉴의 리뷰 받기를 종료하시겠습니까?
              <br />
              설정된 평가 항목이 모두 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              종료
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
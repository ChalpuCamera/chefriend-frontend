import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { noticeApi } from "@/lib/api/owner/notice";
import type {
  CreateStoreNoticeRequest,
  UpdateStoreNoticeRequest,
} from "@/lib/types/api/notice";
import type { Pageable } from "@/lib/types/api/common";
import { toast } from "sonner";

// Query Keys
export const noticeKeys = {
  all: ["notices"] as const,
  lists: () => [...noticeKeys.all, "list"] as const,
  list: (storeId: number, filters: Pageable) =>
    [...noticeKeys.lists(), storeId, filters] as const,
};

// 공지사항 목록 조회
export function useNotices(storeId: number, pageable: Pageable = {}) {
  return useQuery({
    queryKey: noticeKeys.list(storeId, pageable),
    queryFn: async () => {
      const response = await noticeApi.getNotices(storeId, pageable);
      return response.result;
    },
    enabled: !!storeId, // storeId가 있을 때만 쿼리 실행
  });
}

// 공지사항 생성
export function useCreateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storeId,
      data,
    }: {
      storeId: number;
      data: CreateStoreNoticeRequest;
    }) => {
      const response = await noticeApi.createNotice(storeId, data);
      return response.result;
    },
    onSuccess: () => {
      // 해당 매장의 모든 공지사항 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      toast.success("공지사항이 생성되었습니다");
    },
    onError: (error: Error) => {
      toast.error(`공지사항 생성 실패: ${error.message}`);
    },
  });
}

// 공지사항 수정
export function useUpdateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noticeId,
      data,
    }: {
      noticeId: number;
      data: UpdateStoreNoticeRequest;
    }) => {
      const response = await noticeApi.updateNotice(noticeId, data);
      return response.result;
    },
    onSuccess: () => {
      // 모든 공지사항 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      toast.success("공지사항이 수정되었습니다");
    },
    onError: (error: Error) => {
      toast.error(`공지사항 수정 실패: ${error.message}`);
    },
  });
}

// 공지사항 삭제 (bulk delete)
export function useDeleteNotices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storeId,
      deleteIds,
    }: {
      storeId: number;
      deleteIds: number[];
    }) => {
      await noticeApi.deleteNotices(storeId, deleteIds);
    },
    onSuccess: () => {
      // 모든 공지사항 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      toast.success("공지사항이 삭제되었습니다");
    },
    onError: (error: Error) => {
      toast.error(`공지사항 삭제 실패: ${error.message}`);
    },
  });
}

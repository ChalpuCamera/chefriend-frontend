"use client";

import { useState, useEffect, useRef } from "react";
import { useMyStores, useUpdateStore } from "@/lib/hooks/useStore";
import { useNotices, useCreateNotice, useUpdateNotice, useDeleteNotices, useSetRepresentativeNotice } from "@/lib/hooks/useNotice";
import { CustomerView } from "@/components/customer-view";
import { LinkType, LinkItem } from "@/lib/types/api/store";
import { LinkSelectorDialog, platforms, extractUrlForPlatform, validatePlatformUrl } from "@/components/link-selector-dialog";
import { NoticeManagerDialog } from "@/components/notice-manager-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, GripVertical, X, Save, Eye, Pencil, Check, Trash2, Circle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { storeKeys } from "@/lib/hooks/useStore";
import type { StoreNoticeResponse } from "@/lib/types/api/notice";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { photoApi } from "@/lib/api/owner/photo";
import { storeApi } from "@/lib/api/owner/store";
import { FloatingNavBar } from "@/components/floating-nav-bar";

// 플랫폼 정보 매핑
const platformIcons: Record<LinkType, string> = {
  NAVER_MAP: "/platform_icons/naver.png",
  KAKAO_MAP: "/platform_icons/kakaomap.png",
  YOGIYO: "/platform_icons/yogiyo.png",
  BAEMIN: "/platform_icons/baemin.png",
  COUPANGEATS: "/platform_icons/coupangeats.png",
  KAKAO_TALK: "/platform_icons/kakaotalk.png",
  INSTAGRAM: "/platform_icons/instagram.png",
  DDANGYO: "/platform_icons/ddangyo.png",
  GOOGLE_MAPS: "/platform_icons/googlemaps.png",
  DAANGN: "/platform_icons/daangn.png",
  CUSTOM: "/platform_icons/link.png",
};

const platformNames: Record<LinkType, string> = {
  NAVER_MAP: "네이버 지도",
  KAKAO_MAP: "카카오맵",
  YOGIYO: "요기요",
  BAEMIN: "배달의민족",
  COUPANGEATS: "쿠팡이츠",
  KAKAO_TALK: "카카오톡",
  INSTAGRAM: "인스타그램",
  DDANGYO: "땡겨요",
  GOOGLE_MAPS: "구글맵",
  DAANGN: "당근마켓",
  CUSTOM: "",
};

// 개별 정렬 가능한 링크 아이템
function SortableLinkItem({
  id,
  linkType,
  link,
  isEditing,
  onEditChange,
  onUpdate,
  onRemove,
}: {
  id: number;
  linkType: LinkType;
  link: LinkItem;
  isEditing: boolean;
  onEditChange: (editing: boolean) => void;
  onUpdate: (updatedLink: LinkItem) => void;
  onRemove: () => void;
}) {
  const [editUrl, setEditUrl] = useState(link.url || "");
  const [editCustomLabel, setEditCustomLabel] = useState(link.customLabel || "");

  // link가 변경되면 input 상태도 동기화 (드래그로 순서가 바뀔 때, 링크 타입 변경 시)
  useEffect(() => {
    setEditUrl(link.url || "");
    setEditCustomLabel(link.customLabel || "");
  }, [link.url, link.customLabel, linkType]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? transition : 'none',
    opacity: isDragging ? 0.5 : 1,
  };

  // 인스타그램의 경우 URL 필드에 저장된 아이디를 라벨로 표시
  const getDisplayLabel = () => {
    if (linkType === "INSTAGRAM" && link.url) {
      // 인스타그램은 url 필드에 아이디만 저장되어 있음
      return link.url.startsWith('@') ? link.url : `@${link.url}`;
    }
    return link.customLabel || link.label || platformNames[linkType];
  };

  const displayLabel = getDisplayLabel();

  const handleSave = () => {
    const trimmedUrl = editUrl.trim();
    const trimmedLabel = editCustomLabel.trim();

    // URL 필수 검증
    if (!trimmedUrl) {
      toast.error("URL을 입력해주세요");
      return;
    }

    // CUSTOM 타입은 라벨도 필수
    if (linkType === "CUSTOM" && !trimmedLabel) {
      toast.error("링크 이름을 입력해주세요");
      return;
    }

    let finalUrl = trimmedUrl;

    // CUSTOM과 INSTAGRAM 제외한 플랫폼은 도메인 검증
    if (linkType !== "CUSTOM" && linkType !== "INSTAGRAM") {
      const platform = platforms.find(p => p.key === linkType);

      if (platform?.domainToCheck) {
        const domainsToCheck = Array.isArray(platform.domainToCheck)
          ? platform.domainToCheck
          : [platform.domainToCheck];

        let extractedUrl: string | null = null;

        // 여러 도메인 중 하나라도 매칭되면 성공
        for (const domain of domainsToCheck) {
          const url = extractUrlForPlatform(trimmedUrl, domain);
          if (url && validatePlatformUrl(url, domain)) {
            extractedUrl = url;
            break;
          }
        }

        if (!extractedUrl) {
          const domainsText = domainsToCheck.join(' 또는 ');
          toast.error(`링크를 찾을 수 없습니다. ${domainsText}을(를) 포함하는 링크를 입력해주세요.`);
          return;
        }

        finalUrl = extractedUrl;
      }
    } else if (linkType === "CUSTOM") {
      // CUSTOM은 프로토콜 제거만
      finalUrl = finalUrl.replace(/^https?:\/\//, '');
    }

    onUpdate({
      ...link,
      url: finalUrl,
      isVisible: link.isVisible === false ? false : true, // null/undefined도 true로
      ...(linkType === "CUSTOM" && { customLabel: trimmedLabel }),
    });
    // onEditChange(false) 제거: 부모의 handleUpdateLink에서 editingIndex를 null로 설정하여 자동으로 편집 모드 종료됨
  };

  const handleCancel = () => {
    setEditUrl(link.url || "");
    setEditCustomLabel(link.customLabel || "");
    onEditChange(false);
  };

  const handleToggleVisible = () => {
    // isVisible의 현재 상태 (null/undefined면 true로 간주)
    const currentVisible = link.isVisible === false ? false : true;
    onUpdate({
      ...link,
      isVisible: !currentVisible,
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative px-4 py-3 bg-white border border-gray-200 rounded-lg"
    >
      <div className="flex items-center gap-3">
        {/* 왼쪽: 드래그 핸들 + 아이콘 + 라벨 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </button>

          <Image
            src={platformIcons[linkType]}
            alt={displayLabel}
            width={24}
            height={24}
            className="flex-shrink-0"
          />

          <div className="flex-1 font-medium text-gray-800 truncate min-w-0">{displayLabel}</div>
        </div>

        {/* 오른쪽: 토글 + 버튼들 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Visible 토글 */}
          <button
            onClick={handleToggleVisible}
            className={`w-10 h-6 rounded-full transition-colors ${
              link.isVisible !== false ? "bg-purple-700" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                link.isVisible !== false ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>

          {/* 버튼들 */}
          {isEditing ? (
            // 편집 모드 버튼
            <>
              <button
                onClick={handleSave}
                disabled={!editUrl.trim() || (linkType === "CUSTOM" && !editCustomLabel.trim())}
                className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                title="저장"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="취소"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            // 읽기 모드 버튼
            <>
              <button
                onClick={() => onEditChange(true)}
                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                title="수정"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={onRemove}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="삭제"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 편집 모드: URL 입력 필드 */}
      <>
        <div className="mt-2 ml-8">
          {linkType === "CUSTOM" && (
            <input
              type="text"
              value={editCustomLabel}
              onChange={(e) => setEditCustomLabel(e.target.value)}
              placeholder="링크 이름"
              disabled={!isEditing}
              className="w-full px-3 py-1.5 mb-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
          )}
          <input
            type="text"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            placeholder={`${linkType === "INSTAGRAM" ? "인스타 아이디를 입력하세요" : "URL을 입력하세요"}`}
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isEditing}
            autoFocus={isEditing}
          />
        </div>
      </>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  // const [isSiteLinkDialogOpen, setIsSiteLinkDialogOpen] = useState(false); // 드롭다운으로 변경
  const [showSiteLinkDropdown, setShowSiteLinkDropdown] = useState(false);
  const [isProfileImageDialogOpen, setIsProfileImageDialogOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const siteLinkDropdownRef = useRef<HTMLDivElement>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [newlyAddedIndex, setNewlyAddedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // 공지사항 관련 상태
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [noticeMode, setNoticeMode] = useState<"create" | "edit">("create");
  const [editingNotice, setEditingNotice] = useState<StoreNoticeResponse | undefined>(undefined);
  const [isFeaturedDialogOpen, setIsFeaturedDialogOpen] = useState(false);
  const [selectedNoticeForFeatured, setSelectedNoticeForFeatured] = useState<StoreNoticeResponse | null>(null);

  // Get user's stores (첫 번째 가게 우선)
  const { data: storesData } = useMyStores({ size: 10 });
  const stores = storesData?.content || [];


  const currentStore =
    stores.length > 0
      ? stores.reduce((first, store) =>
          store.storeId < first.storeId ? store : first
        )
      : null;
  const storeId = currentStore?.storeId;

  const updateStoreMutation = useUpdateStore();

  // 공지사항 hooks
  const { data: noticesData } = useNotices(storeId || 0, { page: 0, size: 20 });
  const rawNotices = noticesData?.content || [];

  // 공지사항 정렬: 대표 공지를 맨 위에, 나머지는 날짜순
  const notices = [...rawNotices].sort((a, b) => {
    // 대표 공지가 있으면 맨 위로
    if (a.isRepresentative && !b.isRepresentative) return -1;
    if (!a.isRepresentative && b.isRepresentative) return 1;
    // 둘 다 대표 공지이거나 둘 다 아니면 날짜순 (최신순)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const createNoticeMutation = useCreateNotice();
  const updateNoticeMutation = useUpdateNotice();
  const deleteNoticesMutation = useDeleteNotices();
  const setRepresentativeNoticeMutation = useSetRepresentativeNotice();

  // 기존 데이터로 state 초기화
  useEffect(() => {
    if (currentStore?.links) {
      // 백엔드의 label을 customLabel로 변환
      const convertedLinks = currentStore.links.map(link => {
        const converted: LinkItem = {
          linkType: link.linkType,
          url: link.url,
          isVisible: link.isVisible === false ? false : true, // null/undefined도 true로
        };

        // CUSTOM 타입이고 label이 있으면 customLabel로 변환
        if (link.linkType === "CUSTOM" && link.label) {
          converted.customLabel = link.label;
        } else if (link.customLabel) {
          converted.customLabel = link.customLabel;
        }

        return converted;
      });

      setLinks(convertedLinks);
    }
  }, [currentStore]);

  // 외부 클릭 감지로 사이트링크 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        siteLinkDropdownRef.current &&
        !siteLinkDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSiteLinkDropdown(false);
      }
    };

    if (showSiteLinkDropdown) {
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("touchend", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [showSiteLinkDropdown]);

  // Drag and drop sensors (모바일 터치 지원)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);

      // 편집 중인 항목의 인덱스를 드래그 후 위치로 업데이트
      if (editingIndex !== null) {
        if (editingIndex === oldIndex) {
          // 편집 중인 항목이 직접 이동하는 경우
          setEditingIndex(newIndex);
        } else if (oldIndex < newIndex) {
          // 위에서 아래로 이동 (oldIndex → newIndex)
          // oldIndex와 newIndex 사이에 있는 항목들이 위로 한 칸씩 이동
          if (editingIndex > oldIndex && editingIndex <= newIndex) {
            setEditingIndex(editingIndex - 1);
          }
        } else {
          // 아래에서 위로 이동 (oldIndex → newIndex)
          // newIndex와 oldIndex 사이에 있는 항목들이 아래로 한 칸씩 이동
          if (editingIndex >= newIndex && editingIndex < oldIndex) {
            setEditingIndex(editingIndex + 1);
          }
        }
      }

      setLinks((items) => {
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newOrder;
      });
    }
  };

  const handleLinkAdd = (linkItem: LinkItem) => {
    // 이전에 편집 중이던 새로 추가된 링크가 있으면 삭제
    if (editingIndex !== null && newlyAddedIndex === editingIndex) {
      setLinks(prev => prev.filter((_, i) => i !== editingIndex));
      setNewlyAddedIndex(null);
      toast.success("입력하지 않은 링크가 삭제되었습니다");
    }

    setLinks(prev => {
      const newIndex = prev.length;
      setNewlyAddedIndex(newIndex);
      setEditingIndex(newIndex); // 새로 추가된 링크를 편집 모드로
      return [...prev, linkItem];
    });
    setHasChanges(true);
  };

  const handleUpdateLink = (index: number, updatedLink: LinkItem) => {
    setLinks(prev => prev.map((link, i) => i === index ? updatedLink : link));
    setHasChanges(true);

    // 체크 표시로 저장되면 편집 모드 종료
    setEditingIndex(null);

    // 새로 추가된 링크였다면 더 이상 새로 추가된 링크로 간주하지 않음
    if (newlyAddedIndex === index) {
      setNewlyAddedIndex(null);
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  // 사이트 주소 복사
  const handleCopySiteLink = async () => {
    if (currentStore?.siteLink) {
      try {
        await navigator.clipboard.writeText(
          `https://chefriend.kr/${currentStore.siteLink}`
        );
        toast.success("사이트 주소가 복사되었습니다!");
      } catch (error) {
        console.error("Failed to copy:", error);
        toast.error("복사에 실패했습니다.");
      }
    }
  };

  // 사이트 보기
  const handleViewSite = () => {
    if (currentStore?.siteLink) {
      window.open(`https://chefriend.kr/${currentStore.siteLink}`, "_blank");
    }
  };

  // 프로필 이미지 업로드
  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !storeId) {
      console.log("No file or storeId:", { file: !!file, storeId });
      return;
    }

    setIsUploadingImage(true);
    try {
      console.log("Starting image upload for store:", storeId);

      // 1. Presigned URL 생성
      const presignedResponse = await photoApi.getPresignedUrl(file.name);
      const { presignedUrl, s3Key } = presignedResponse.result;
      console.log("Got presigned URL, s3Key:", s3Key);

      // 2. S3에 파일 업로드
      await photoApi.uploadToS3(presignedUrl, file);
      console.log("Uploaded to S3");

      // 3. 서버에 사진 정보 등록 (foodItemId 없이)
      const registerResponse = await photoApi.registerPhoto({
        s3Key,
        fileName: file.name,
        fileSize: file.size,
      });

      const imageUrl = registerResponse.result.imageUrl;
      console.log("Registered photo, imageUrl:", imageUrl);

      // 4. 가게 대표 사진 설정 API 호출
      const updateResult = await storeApi.updateStoreThumbnail(
        storeId,
        imageUrl
      );
      console.log("Store thumbnail updated, result:", updateResult);

      // 5. 캐시 무효화하여 UI 업데이트
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) });
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });

      toast.success("대표 사진이 변경되었습니다!");
      setIsProfileImageDialogOpen(false);
    } catch (error) {
      console.error("Profile image upload failed:", error);
      toast.error("사진 업로드에 실패했습니다.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSettings = () => {
    router.push("/mypage");
  };

  // 공지사항 핸들러
  const handleCreateNotice = () => {
    setNoticeMode("create");
    setEditingNotice(undefined);
    setIsNoticeDialogOpen(true);
  };

  const handleEditNotice = (notice: StoreNoticeResponse) => {
    setNoticeMode("edit");
    setEditingNotice(notice);
    setIsNoticeDialogOpen(true);
  };

  const handleNoticeSubmit = async (data: { title: string; body: string; isRepresentative: boolean }) => {
    if (!storeId) return;

    try {
      if (noticeMode === "create") {
        await createNoticeMutation.mutateAsync({ storeId, data });
      } else if (noticeMode === "edit" && editingNotice) {
        await updateNoticeMutation.mutateAsync({
          noticeId: editingNotice.id,
          data,
        });
      }
      setIsNoticeDialogOpen(false);
      setEditingNotice(undefined);
    } catch (error) {
      console.error("Notice submission failed:", error);
    }
  };

  const handleDeleteNotice = async (noticeId: number) => {
    if (!storeId) return;

    if (!confirm("이 공지사항을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteNoticesMutation.mutateAsync({
        storeId,
        deleteIds: [noticeId],
      });
    } catch (error) {
      console.error("Notice deletion failed:", error);
    }
  };

  // 대표 공지 설정
  const handleSetFeaturedNotice = (notice: StoreNoticeResponse) => {
    setSelectedNoticeForFeatured(notice);
    setIsFeaturedDialogOpen(true);
  };

  const handleConfirmFeaturedNotice = async () => {
    if (!selectedNoticeForFeatured || !storeId) return;

    try {
      await setRepresentativeNoticeMutation.mutateAsync({
        storeId,
        noticeId: selectedNoticeForFeatured.id,
      });
      setIsFeaturedDialogOpen(false);
      setSelectedNoticeForFeatured(null);
    } catch (error) {
      console.error("Featured notice update failed:", error);
    }
  };

  const handleSave = async () => {
    console.log('handleSave called - storeId:', storeId, 'currentStore:', currentStore);

    if (!storeId || !currentStore) {
      console.error('Save failed: storeId or currentStore is missing');
      toast.error("가게 정보를 불러올 수 없습니다");
      return;
    }

    // 빈 URL 검증
    const emptyUrlLinks = links.filter(link => !link.url || !link.url.trim());
    if (emptyUrlLinks.length > 0) {
      toast.error("URL이 입력되지 않은 링크가 있습니다. 링크를 수정하거나 삭제해주세요.");
      return;
    }

    console.log('Saving with payload:', {
      storeId,
      data: {
        storeName: currentStore.storeName,
        description: currentStore.description,
        siteLink: currentStore.siteLink,
        links: links,
      }
    });

    try {
      // isVisible을 명시적으로 true/false로 정리
      const normalizedLinks = links.map(link => ({
        ...link,
        isVisible: link.isVisible === false ? false : true,
      }));

      await updateStoreMutation.mutateAsync({
        storeId,
        data: {
          storeName: currentStore.storeName,
          address: currentStore.address,
          description: currentStore.description,
          siteLink: currentStore.siteLink,
          thumbnailUrl: currentStore.thumbnailUrl,
          requiredStampsForCoupon: currentStore.requiredStampsForCoupon,
          displayTemplate: currentStore.displayTemplate,
          links: normalizedLinks,  // 정규화된 배열 전송
        },
      });

      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: storeKeys.detail(storeId) });
      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });

      toast.success("링크가 저장되었습니다!");
      setHasChanges(false);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("저장에 실패했습니다");
    }
  };

  if (!currentStore) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>가게 정보를 불러오는 중...</p>
      </div>
    );
  }

  // CustomerView에 전달할 storeData 생성 (편집 중인 데이터 반영)
  const previewStoreData = {
    ...currentStore,
    links: links,
  };

  return (
    <div className="bg-white w-full mx-auto py-3 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-full mb-3">
        <Image
          src="/logo_small.png"
          alt="Logo"
          width={88}
          height={27}
          quality={100}
          priority
          style={{ width: "auto", height: "auto" }}
        />
        <button className="" onClick={handleSettings}>
          <Image
            src="/setting_icon.png"
            alt="setting"
            width={20}
            height={20}
            quality={100}
          />
        </button>
      </div>

      {/* Store Profile Section */}
      <div className="px-4 py-5 mt-6 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 프로필 이미지 - 클릭하여 미리보기 */}
            <button
              onClick={() => setIsProfileImageDialogOpen(true)}
              className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              {currentStore?.thumbnailUrl ? (
                <Image
                  src={currentStore.thumbnailUrl}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  quality={95}
                  sizes="64px"
                  unoptimized={currentStore.thumbnailUrl.startsWith("http")}
                />
              ) : (
                <Image
                  src="/store_icon.png"
                  alt="Profile"
                  width={80}
                  height={80}
                  quality={100}
                  priority
                  className="w-full h-full object-cover"
                />
              )}
            </button>
            <div className="flex flex-col gap-1">
              <h2 className="text-sub-title-b text-gray-800">
                {currentStore?.storeName || "가게 이름"}
              </h2>
              <p className="text-caption-r text-gray-800">
                {currentStore?.description && currentStore.description.length > 0 ? currentStore.description : "안녕하세요 사장님 👨‍🌾"}
              </p>
              {/* 사이트 주소 - 드롭다운 메뉴로 변경 */}
              {currentStore?.siteLink && (
                <div ref={siteLinkDropdownRef} className="relative">
                  <button
                    onClick={() => setShowSiteLinkDropdown(!showSiteLinkDropdown)}
                    className="text-body-r text-purple-700 flex items-center gap-1 hover:underline text-left"
                  >
                    chefriend.kr/{currentStore.siteLink}🔗
                  </button>
                  {showSiteLinkDropdown && (
                    <div className="absolute top-full mt-2 w-48 bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden z-10">
                      <button
                        onClick={() => {
                          handleCopySiteLink();
                          setShowSiteLinkDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-body-sb text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        주소 복사하기
                      </button>
                      <button
                        onClick={() => {
                          handleViewSite();
                          setShowSiteLinkDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-body-sb text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 border-t border-gray-200"
                      >
                        사이트 보기
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {storeId && (
            <button
              onClick={() => router.push(`/store/${storeId}/edit`)}
              className="text-body-sb text-purple-700 px-3 py-2 min-w-[48px] min-h-[44px] flex items-center justify-center"
            >
              수정
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => setIsPreviewDialogOpen(true)}
            variant="outline"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            미리보기
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            disabled={
              !hasChanges ||
              updateStoreMutation.isPending ||
              links.some(link => !link.url || !link.url.trim())
            }
            className="bg-purple-700 hover:bg-purple-800"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateStoreMutation.isPending ? "저장 중..." : "저장"}
          </Button>
        </div>

        {/* 공지사항 섹션 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">공지사항</h2>
            <Button
              onClick={handleCreateNotice}
              size="sm"
              className="bg-purple-700 hover:bg-purple-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              공지사항 추가
            </Button>
          </div>

          {notices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>아직 공지사항이 없습니다</p>
              <p className="text-sm mt-2">공지사항 추가 버튼을 눌러 시작하세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 기본적으로 최신 1개만 표시 */}
              {notices
                .slice(0, 1)
                .map((notice) => (
                <div key={notice.id} className="flex items-center gap-3">
                  <div className="flex items-center flex-shrink-0">
                    <button
                      onClick={() => !notice.isRepresentative && handleSetFeaturedNotice(notice)}
                      className="w-5 h-5 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full"
                      aria-label={notice.isRepresentative ? "대표 공지" : "대표 공지로 설정"}
                      disabled={notice.isRepresentative}
                    >
                      {notice.isRepresentative ? (
                        <CheckCircle2 className="w-5 h-5 text-purple-700" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 hover:text-purple-500 transition-colors" />
                      )}
                    </button>
                  </div>
                  <Card className="flex-1 min-w-0 border border-gray-200 py-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-2 truncate">
                            {notice.title}
                          </h3>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap break-words line-clamp-3">
                            {notice.body}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNotice(notice)}
                            className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotice(notice.id)}
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* 나머지 공지사항들 표시 */}
              {notices.length > 1 && (
                <details className="group">
                  <summary className="cursor-pointer text-sm text-purple-700 hover:text-purple-800 font-medium list-none flex items-center justify-center py-2">
                    <span className="group-open:hidden">이전 공지사항 {notices.length - 1}개 더보기</span>
                    <span className="hidden group-open:inline">접기</span>
                  </summary>
                  <div className="space-y-3 mt-3">
                    {notices
                      .slice(1)
                      .map((notice) => (
                      <div key={notice.id} className="flex items-center gap-3">
                        <div className="flex items-center flex-shrink-0">
                          <button
                            onClick={() => !notice.isRepresentative && handleSetFeaturedNotice(notice)}
                            className="w-5 h-5 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full"
                            aria-label={notice.isRepresentative ? "대표 공지" : "대표 공지로 설정"}
                            disabled={notice.isRepresentative}
                          >
                            {notice.isRepresentative ? (
                              <CheckCircle2 className="w-5 h-5 text-purple-700" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 hover:text-purple-500 transition-colors" />
                            )}
                          </button>
                        </div>
                        <Card className="flex-1 min-w-0 border border-gray-200 py-2">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-2 truncate">
                                  {notice.title}
                                </h3>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap break-words line-clamp-3">
                                  {notice.body}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                                </p>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditNotice(notice)}
                                  className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNotice(notice.id)}
                                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        {/* 링크 목록 섹션 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">링크 목록</h2>
            <Button
              onClick={() => setIsLinkDialogOpen(true)}
              size="sm"
              className="bg-purple-700 hover:bg-purple-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              링크 추가
            </Button>
          </div>

          {links.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>아직 링크가 없습니다</p>
              <p className="text-sm mt-2">링크 추가 버튼을 눌러 시작하세요</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={links.map((_, index) => String(index))}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {links.map((link, index) => (
                    <SortableLinkItem
                      key={index}
                      id={index}
                      linkType={link.linkType}
                      link={link}
                      isEditing={editingIndex === index}
                      onEditChange={(editing) => {
                        // 편집 모드 진입 시 빈 URL 링크 자동 삭제
                        if (editing) {
                          if (
                            editingIndex !== null &&
                            newlyAddedIndex === editingIndex &&
                            !links[editingIndex]?.url?.trim()
                          ) {
                            handleRemoveLink(editingIndex);
                            setNewlyAddedIndex(null);
                            toast.success("입력하지 않은 링크가 삭제되었습니다");
                          }
                        }

                        // 편집 모드 종료 시 체크
                        if (!editing && newlyAddedIndex === index) {
                          // 새로 추가된 링크가 체크 표시 없이 편집 모드를 벗어남
                          // → 자동 삭제
                          handleRemoveLink(index);
                          setNewlyAddedIndex(null);
                          return;
                        }

                        setEditingIndex(editing ? index : null);
                        if (editing && newlyAddedIndex === index) {
                          setNewlyAddedIndex(null);
                        }
                      }}
                      onUpdate={(updatedLink) => {
                        handleUpdateLink(index, updatedLink);
                      }}
                      onRemove={() => handleRemoveLink(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* 링크 추가 다이얼로그 */}
      <LinkSelectorDialog
        open={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        existingLinks={links}
        onLinkAdd={handleLinkAdd}
      />

      {/* 공지사항 관리 다이얼로그 */}
      <NoticeManagerDialog
        open={isNoticeDialogOpen}
        onOpenChange={setIsNoticeDialogOpen}
        mode={noticeMode}
        notice={editingNotice}
        onSubmit={handleNoticeSubmit}
        isLoading={createNoticeMutation.isPending || updateNoticeMutation.isPending}
      />

      {/* 미리보기 다이얼로그 */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-[400px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>손님이 보는 화면</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh]">
            <CustomerView storeData={previewStoreData} notices={notices} />
          </div>
        </DialogContent>
      </Dialog>

      {/* 사이트 주소 Dialog - 드롭다운으로 변경됨 */}
      {/* <Dialog
        open={isSiteLinkDialogOpen}
        onOpenChange={setIsSiteLinkDialogOpen}
      >
        <DialogContent className="max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="text-title-2 text-gray-800">
              우리 가게 사이트 주소
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-body-r text-gray-800 break-all">
                chefriend.kr/{currentStore?.siteLink}
              </p>
            </div>
            <DialogFooter className="flex gap-2 sm:justify-center">
              <Button
                onClick={handleCopySiteLink}
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                복사하기
              </Button>
              <Button
                onClick={handleViewSite}
                className="flex-1 bg-purple-700 text-white hover:bg-purple-800"
              >
                사이트 보기
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog> */}

      {/* 프로필 이미지 미리보기 Dialog */}
      <Dialog
        open={isProfileImageDialogOpen}
        onOpenChange={setIsProfileImageDialogOpen}
      >
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-title-2 text-gray-800">
              대표 사진
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 이미지 미리보기 - cdn에서 가져오는 이미지는 최적화 불필요*/}
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
              {currentStore?.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentStore.thumbnailUrl}
                  alt="대표 사진"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src="/store_icon.png"
                  alt="대표 사진"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                  quality={100}
                  priority
                />
              )}
            </div>
            {/* 히든 파일 input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="hidden"
            />
            <DialogFooter className="flex gap-2 sm:justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="flex-1 bg-purple-700 text-white hover:bg-purple-800"
              >
                {isUploadingImage ? "업로드 중..." : "사진 변경하기"}
              </Button>
              <Button
                onClick={() => setIsProfileImageDialogOpen(false)}
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                닫기
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 대표 공지 설정 확인 다이얼로그 */}
      <Dialog open={isFeaturedDialogOpen} onOpenChange={setIsFeaturedDialogOpen}>
        <DialogContent className="max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="text-title-2 text-gray-800">
              대표 공지로 설정하시겠습니까?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-body-r text-gray-600">
              이 공지사항이 맨 위에 표시되며, 기존 대표 공지는 해제됩니다.
            </p>
            <DialogFooter className="flex gap-2 sm:justify-center">
              <Button
                onClick={() => setIsFeaturedDialogOpen(false)}
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                취소
              </Button>
              <Button
                onClick={handleConfirmFeaturedNotice}
                disabled={setRepresentativeNoticeMutation.isPending}
                className="flex-1 bg-purple-700 text-white hover:bg-purple-800"
              >
                {setRepresentativeNoticeMutation.isPending ? "설정 중..." : "확인"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 플로팅 탭 네비게이션 */}
      <FloatingNavBar currentTab="home" />
    </div>
  );
}

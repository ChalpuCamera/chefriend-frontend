"use client";

import { useState, useEffect, useRef } from "react";
import { useMyStores, useUpdateStore } from "@/lib/hooks/useStore";
import { CustomerView } from "@/components/customer-view";
import { LinkType, LinkItem } from "@/lib/types/api/store";
import { LinkSelectorDialog } from "@/components/link-selector-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, GripVertical, X, Save, Eye, Home, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { storeKeys } from "@/lib/hooks/useStore";
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
  label,
  onRemove,
}: {
  id: number;
  linkType: LinkType;
  label?: string;
  onRemove: () => void;
}) {
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

  const displayLabel = label || platformNames[linkType];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg"
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
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
      <span className="flex-1 font-medium">{displayLabel}</span>
      <button
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 p-1"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSiteLinkDialogOpen, setIsSiteLinkDialogOpen] = useState(false);
  const [isProfileImageDialogOpen, setIsProfileImageDialogOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Get user's stores (첫 번째 가게 우선)
  const { data: storesData } = useMyStores({ size: 10 });
  const stores = storesData?.content || [];

  console.log('🏪 Stores data:', stores);

  const currentStore =
    stores.length > 0
      ? stores.reduce((first, store) =>
          store.storeId < first.storeId ? store : first
        )
      : null;
  const storeId = currentStore?.storeId;

  console.log('🎯 Selected store:', currentStore);
  console.log('🔑 Store ID:', storeId);

  const updateStoreMutation = useUpdateStore();

  // 기존 데이터로 state 초기화
  useEffect(() => {
    if (currentStore?.links) {
      // 백엔드의 label을 customLabel로 변환
      const convertedLinks = currentStore.links.map(link => {
        const converted: LinkItem = {
          linkType: link.linkType,
          url: link.url,
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
      setLinks((items) => {
        const oldIndex = Number(active.id);
        const newIndex = Number(over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasChanges(true);
        return newOrder;
      });
    }
  };

  const handleLinkAdd = (linkItem: LinkItem) => {
    setLinks(prev => [...prev, linkItem]);
    setHasChanges(true);
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

  const handleSave = async () => {
    console.log('handleSave called - storeId:', storeId, 'currentStore:', currentStore);

    if (!storeId || !currentStore) {
      console.error('Save failed: storeId or currentStore is missing');
      toast.error("가게 정보를 불러올 수 없습니다");
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
          links: links,  // 전체 배열 전송
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
              {/* 사이트 주소 - 클릭하여 Dialog 오픈 */}
              {currentStore?.siteLink && (
                <button
                  onClick={() => setIsSiteLinkDialogOpen(true)}
                  className="text-body-r text-purple-700 flex items-center gap-1 hover:underline text-left"
                >
                  chefriend.kr/{currentStore.siteLink}🔗
                </button>
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
            disabled={!hasChanges || updateStoreMutation.isPending}
            className="bg-purple-700 hover:bg-purple-800"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateStoreMutation.isPending ? "저장 중..." : "저장"}
          </Button>
        </div>

        {/* 편집 섹션 */}
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
                      label={link.label || link.customLabel}
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

      {/* 미리보기 다이얼로그 */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-[400px] p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>손님이 보는 화면</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh]">
            <CustomerView storeData={previewStoreData} />
          </div>
        </DialogContent>
      </Dialog>

      {/* 사이트 주소 Dialog */}
      <Dialog
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
      </Dialog>

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

      {/* 플로팅 탭 네비게이션 */}
      <div className="fixed bottom-6 left-0 right-0 z-50 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-full shadow-2xl border border-gray-200 flex overflow-hidden">
            {/* 홈페이지 관리 탭 */}
            <button
              onClick={() => {/* 현재 페이지이므로 아무 동작 안함 */}}
              className="flex-1 flex flex-col items-center justify-center py-4 px-4 bg-purple-700 text-white transition-all"
            >
              <Home className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">홈페이지 관리</span>
            </button>

            {/* 메뉴 관리 탭 */}
            <button
              onClick={() => router.push('/menu')}
              className="flex-1 flex flex-col items-center justify-center py-4 px-4 text-gray-600 hover:bg-gray-50 transition-all"
            >
              <UtensilsCrossed className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">메뉴 관리</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

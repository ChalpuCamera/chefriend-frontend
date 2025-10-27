import { useState, useCallback, useRef } from "react";
import { foodApi } from "@/lib/api/owner/food";

const POLLING_INTERVAL = 1000; // 1초
const TIMEOUT_MS = 60000; // 60초

interface UseMenuExtractionResult {
  startExtraction: (imageFile: File) => Promise<void>;
  isExtracting: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
}

export function useMenuExtraction(storeId: number): UseMenuExtractionResult {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    async (requestId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // 타임아웃 설정
        timeoutRef.current = setTimeout(() => {
          clearTimers();
          reject(new Error("TIMEOUT"));
        }, TIMEOUT_MS);

        // 폴링 시작
        pollingIntervalRef.current = setInterval(async () => {
          try {
            const response = await foodApi.getExtractionStatus(requestId);
            const status = response.result;

            // 진행 상태 업데이트
            setProgress(status.progressPercentage);
            setCurrentStep(status.currentStep);

            // 완료 처리
            if (status.status === "COMPLETED") {
              clearTimers();
              resolve();
            }

            // 실패 처리
            if (status.status === "FAILED") {
              clearTimers();
              reject(
                new Error(status.errorMessage || "메뉴 추출에 실패했습니다")
              );
            }
          } catch (err) {
            clearTimers();
            reject(err);
          }
        }, POLLING_INTERVAL);
      });
    },
    [clearTimers]
  );

  const startExtraction = useCallback(
    async (imageFile: File): Promise<void> => {
      setIsExtracting(true);
      setProgress(0);
      setCurrentStep("이미지 업로드 중...");
      setError(null);

      try {
        // 1. 추출 시작 API 호출
        const startResponse = await foodApi.startMenuExtraction(
          storeId,
          imageFile
        );
        const { requestId } = startResponse.result;

        // 2. 폴링 시작
        await pollStatus(requestId);

        // 3. 완료
        setProgress(100);
        setCurrentStep("완료!");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다";
        setError(errorMessage);
        throw err;
      } finally {
        setIsExtracting(false);
        clearTimers();
      }
    },
    [storeId, pollStatus, clearTimers]
  );

  return {
    startExtraction,
    isExtracting,
    progress,
    currentStep,
    error,
  };
}

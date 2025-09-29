"use client";

import Script from "next/script";

export default function KakaoScript() {
  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.0/kakao.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== "undefined" && window.Kakao && !window.Kakao.isInitialized()) {
          const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
          if (kakaoKey) {
            window.Kakao.init(kakaoKey);
            console.log("Kakao SDK initialized");
          } else {
            console.warn("Kakao JS Key not found in environment variables");
          }
        }
      }}
    />
  );
}
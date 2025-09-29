interface Window {
  Kakao?: {
    init: (appKey: string) => void;
    isInitialized: () => boolean;
    Auth: {
      authorize: (options: {
        redirectUri: string;
        scope?: string;
        throughTalk?: boolean;
        prompts?: string;
      }) => void;
      getAccessToken: () => string | null;
      logout: () => Promise<void>;
    };
    API: {
      request: (options: any) => Promise<any>;
    };
  };
}
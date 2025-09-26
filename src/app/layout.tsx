import type { Metadata } from "next";
import { QueryProvider } from "@/lib/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chefriend",
  description: "Chefriend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased max-w-[430px] mx-auto`}
        style={{
          fontFamily:
            'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}

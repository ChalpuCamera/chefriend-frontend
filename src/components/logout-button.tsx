"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
  redirectTo?: string;
}

export function LogoutButton({
  variant = "outline",
  size = "default",
  showIcon = true,
  showText = true,
  className,
  redirectTo,
}: LogoutButtonProps) {
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      // TODO: Call logout API endpoint if needed
      // await api.post('/auth/logout');

      // Clear auth state
      clearAuth();

      // Show success message
      toast.success("로그아웃되었습니다.");

      // Redirect to login page or custom path
      router.push(redirectTo || "/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {showText && <span className={showIcon ? "ml-2" : ""}>로그아웃</span>}
    </Button>
  );
}

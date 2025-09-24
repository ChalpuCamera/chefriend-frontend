"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      duration={800}
      toastOptions={{
        classNames: {
          toast: "bg-background text-foreground border-border",
          success: "!bg-purple-700 !text-white !border-purple-700",
          error: "!bg-red-500 !text-white !border-red-500",
          warning: "!bg-yellow-500 !text-white !border-yellow-500",
          info: "!bg-blue-500 !text-white !border-blue-500",
        }
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

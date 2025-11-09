"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as SonnerToast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// TODO: implement a custom toaster that uses tailwind css classes like this: https://sonner.emilkowal.ski/styling


const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-secondary group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          error: "bg-secondary",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        style: {
          background: 'var(--secondary)',
        }
      }}
      {...props}
    />
  )
}

export { Toaster }

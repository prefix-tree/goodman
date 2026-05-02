import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Get Started",
  description: "Describe your situation and we'll build your legal case",
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background text-foreground flex min-h-svh items-center justify-center">
      {children}
    </div>
  )
}

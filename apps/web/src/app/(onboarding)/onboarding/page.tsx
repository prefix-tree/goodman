"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mic, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/stores/user-store"

export default function OnboardingPage() {
  const router = useRouter()
  const setUser = useUserStore((s) => s.setUser)
  const existingUserId = useUserStore((s) => s.userId)
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    // If user already exists (e.g. page refresh), skip creation
    if (existingUserId) {
      router.push("/onboarding/situation")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `guest-${Date.now()}@solea.ai`,
          name: "Guest",
        }),
      })
      if (!res.ok) throw new Error("Failed to create user")

      const user = await res.json()
      // MongoDB ObjectId may come as string or { $oid: "..." }
      const rawId = user._id ?? user.id
      const id = typeof rawId === "object" && rawId.$oid ? rawId.$oid : String(rawId)
      setUser(id, user.name ?? "Guest")
      router.push("/onboarding/situation")
    } catch (err) {
      console.error("Failed to create user:", err)
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-10 px-6 text-center">
      {/* Visual mark */}
      <div className="relative flex size-20 items-center justify-center">
        <div className="bg-primary/8 absolute inset-0 rounded-full" />
        <div className="bg-primary/15 absolute inset-2 rounded-full" />
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="text-primary relative"
        >
          <path
            d="M12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5C15 3.34315 13.6569 2 12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 19V22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Message */}
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Tell me what you&apos;re dealing with
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          You can speak or type. I&apos;ll turn your situation into a clear
          legal case.
        </p>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        className="h-12 px-8 text-base"
        onClick={handleStart}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Mic className="size-5" />
        )}
        {loading ? "Getting ready..." : "Start with your situation"}
      </Button>
    </div>
  )
}

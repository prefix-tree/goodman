"use client";

import { cn } from "@/lib/utils";
import { useState, createContext, useContext, type ReactNode } from "react";

interface PillTabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PillTabsContext = createContext<PillTabsContextValue | null>(null);

function usePillTabs() {
  const ctx = useContext(PillTabsContext);
  if (!ctx) throw new Error("PillTabs compound components must be used within <PillTabs>");
  return ctx;
}

interface PillTabsProps {
  defaultValue: string;
  className?: string;
  children: ReactNode;
}

function PillTabs({ defaultValue, className, children }: PillTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <PillTabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("flex flex-col", className)}>{children}</div>
    </PillTabsContext.Provider>
  );
}

interface PillTabsListProps {
  className?: string;
  children: ReactNode;
}

function PillTabsList({ className, children }: PillTabsListProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {children}
    </div>
  );
}

interface PillTabsTriggerProps {
  value: string;
  className?: string;
  children: ReactNode;
}

function PillTabsTrigger({ value, className, children }: PillTabsTriggerProps) {
  const { activeTab, setActiveTab } = usePillTabs();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5",
        "text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

interface PillTabsContentProps {
  value: string;
  className?: string;
  children: ReactNode;
}

function PillTabsContent({ value, className, children }: PillTabsContentProps) {
  const { activeTab } = usePillTabs();
  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className={cn("flex-1", className)}>
      {children}
    </div>
  );
}

export { PillTabs, PillTabsList, PillTabsTrigger, PillTabsContent };

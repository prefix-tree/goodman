"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHome } from "@/components/profile/home";
import { ProfileCases } from "@/components/profile/cases";
import { ProfileInbox } from "@/components/profile/inbox";

export function ProfilePanel() {
  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="home" className="flex h-full flex-col gap-0">
        <div className="border-b px-4 py-2">
          <TabsList>
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="home" className="flex-1 overflow-auto p-4">
          <ProfileHome />
        </TabsContent>

        <TabsContent value="cases" className="flex-1 overflow-auto p-4">
          <ProfileCases />
        </TabsContent>

        <TabsContent value="inbox" className="flex-1 overflow-auto p-4">
          <ProfileInbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}

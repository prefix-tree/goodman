"use client";

import { PillTabs, PillTabsList, PillTabsTrigger, PillTabsContent } from "@/components/atoms/pill-tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileCases } from "@/components/profile/cases";
import { CaseDetail } from "@/components/profile/case-detail";
import { Badge } from "@/components/ui/badge";
import { User, FolderKanban } from "lucide-react";

export function ProfilePanel() {
  return (
    <div className="flex h-full flex-col">
      <PillTabs defaultValue="home" className="flex h-full flex-col gap-0">
        <div className="px-4 py-3">
          <PillTabsList>
            <PillTabsTrigger value="home">Home</PillTabsTrigger>
            <PillTabsTrigger value="cases">Cases</PillTabsTrigger>
            <PillTabsTrigger value="details">Details</PillTabsTrigger>
          </PillTabsList>
        </div>

        <PillTabsContent value="home" className="overflow-auto p-4">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-4" />
                  Profile
                </CardTitle>
                <CardDescription>Your account overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Plan</p>
                    <p className="font-medium">Free</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No recent activity yet. Start a voice session to get going.
                </p>
              </CardContent>
            </Card>
          </div>
        </PillTabsContent>

        <PillTabsContent value="cases" className="overflow-auto p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <FolderKanban className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Your Cases</p>
                <p className="text-xs text-muted-foreground">Track the status of your legal matters</p>
              </div>
            </div>
            <ProfileCases />
          </div>
        </PillTabsContent>

        <PillTabsContent value="details" className="overflow-auto p-4">
          <CaseDetail />
        </PillTabsContent>
      </PillTabs>
    </div>
  );
}

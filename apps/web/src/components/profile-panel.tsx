"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileCases } from "@/components/profile/cases";
import { Badge } from "@/components/ui/badge";
import { User, Inbox, FolderKanban } from "lucide-react";

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
        </TabsContent>

        <TabsContent value="cases" className="flex-1 overflow-auto p-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="size-4" />
                Your Cases
              </CardTitle>
              <CardDescription>Track the status of your legal matters</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileCases />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inbox" className="flex-1 overflow-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="size-4" />
                Inbox
              </CardTitle>
              <CardDescription>Messages and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No messages yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

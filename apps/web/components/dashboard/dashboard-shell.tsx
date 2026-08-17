"use client";

import { useMutation } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  House,
  LogOut,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

const NAV = [
  { title: "Home", url: "/dashboard", icon: House },
] as const;

function getInitials(name?: string | null) {
  if (!name) {
    return "U";
  }
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DashboardShell({
  children,
  userName,
  userEmail,
}: {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const signOut = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      window.location.reload();
    },
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <Link href="/dashboard">
                    <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                      <BriefcaseBusiness className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left leading-tight">
                      <span className="truncate font-semibold">Recruitly</span>
                      <span className="text-muted-foreground truncate text-xs">
                        Talent workspace
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-9">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-muted text-xs">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-medium">
                      {userName ?? "Guest"}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {userEmail ?? ""}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 data-[side=bottom]:my-2"
              >
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={signOut.isPending}
                  onSelect={(event) => {
                    event.preventDefault();
                    signOut.mutate();
                  }}
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex flex-1 flex-col items-start justify-start gap-4 p-6 lg:p-8">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

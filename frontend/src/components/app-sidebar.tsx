import {
  Command,
  Frame
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useQuiz } from "@/hooks/use-quiz";
import { useUser } from "@/hooks/use-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { quiz } = useQuiz();
  const { user } = useUser();

  const data = {
    navMain: [
      {
        title: "Quiz",
        url: "#",
        icon: Frame,
        isActive: true,
        items: [
          {
            title: "My Quiz",
            url: "/quizzes",
          },
          {
            title: "Create Quiz",
            url: `/quizzes/new`,
          },
          {
            title: "Quiz Results",
            url: `/quiz/${quiz?.id}/responses`,
          },
          {
            title: "Settings",
            url: `/quiz/${quiz?.id}/settings`,
          },
        ],
      },
    ],
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex cursor-pointer items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold capitalize">
                    {quiz?.name.replace(/-/g, " ")}
                  </span>
                  <span className="truncate text-xs">{user?.name}</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

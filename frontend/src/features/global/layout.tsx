import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { QueryProvider } from "@/providers/query-provider";
import { QuizLink } from "../quiz/quiz-link";
import BreadcrumbInfo from "./breadcrumb-info";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 py-2 pr-4">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <BreadcrumbInfo />
            </div>
            <QuizLink />
          </header>
          <div className="flex h-full flex-1 flex-col gap-y-6 space-y-6 border-t border-zinc-200 p-4">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </QueryProvider>
  );
}

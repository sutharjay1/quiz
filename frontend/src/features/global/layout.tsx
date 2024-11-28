import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';
import { QueryProvider } from '@/providers/query-provider';
import BreadcrumbInfo from './breadcrumb-info';
import { QuizLink } from '../quiz/quiz-link';

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<QueryProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 pr-4">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator
								orientation="vertical"
								className="mr-2 h-4"
							/>
							<BreadcrumbInfo />
						</div>
						<QuizLink />
					</header>
					<div className="flex flex-1 flex-col space-y-4 border-t border-zinc-200 p-4">
						{children}
					</div>
				</SidebarInset>
			</SidebarProvider>
		</QueryProvider>
	);
}

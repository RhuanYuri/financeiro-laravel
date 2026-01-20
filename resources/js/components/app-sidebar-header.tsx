import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';

interface Home {
    id: number;
    name: string;
}

interface PageProps {
    auth: {
        user: any;
        current_home: Home | null;
    };
    [key: string]: any;
}

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <header className="flex items-center justify-between px-4 py-3 border-b bg-background">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="ml-auto flex items-center gap-2">
                {auth.current_home && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-md">
                        <span className="text-sm font-medium text-primary">
                            {auth.current_home.name}
                        </span>
                    </div>
                )}
            </div>
        </header >
    );
}

import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { Toaster } from 'sonner';
import { PageLoader } from '@/components/common';

export function MainLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto">
                    <div className="container py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-full flex flex-col pb-20">
                        <Breadcrumbs />
                        <Suspense fallback={<PageLoader />}>
                            <Outlet />
                        </Suspense>
                    </div>
                </main>
            </div>
            <Toaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{
                    duration: 3000,
                }}
            />
        </div>
    );
}

export default MainLayout;

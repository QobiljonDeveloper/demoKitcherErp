import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { LoginPage } from '@/pages';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth';
import { refreshOnce } from '@/api/client';

// Lazy-loaded pages for code splitting
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ItemsPage = lazy(() => import('@/pages/ItemsPage'));
const StockPage = lazy(() => import('@/pages/StockPage'));
const CashPage = lazy(() => import('@/pages/CashPage'));
const EmployeesPage = lazy(() => import('@/pages/EmployeesPage'));
const SalariesPage = lazy(() => import('@/pages/SalariesPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

function PageLoader() {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

function App() {
    const { isAuthenticated, login, logout, setLoading } = useAuthStore();
    const [authChecked, setAuthChecked] = useState(false);
    const didRun = useRef(false); // Guard against React StrictMode double-fire

    useEffect(() => {
        // Prevent double-run in React.StrictMode dev mode
        if (didRun.current) return;
        didRun.current = true;

        const checkAuth = async () => {
            // ── SKIP auth check entirely on /login ──
            if (window.location.pathname === '/login') {
                setLoading(false);
                setAuthChecked(true);
                return;
            }

            try {
                // Try refreshing the session via cookie (single-flight)
                const newToken = await refreshOnce();
                if (!newToken) {
                    // No valid refresh cookie — user is not logged in
                    logout();
                    return;
                }

                // Token refreshed — fetch user info
                const userResponse = await authApi.getMe();
                login(newToken, userResponse.data);
            } catch {
                logout();
            } finally {
                setLoading(false);
                setAuthChecked(true);
            }
        };

        checkAuth();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Tizim yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={
                isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
            } />
            <Route element={
                <ProtectedRoute>
                    <MainLayout />
                </ProtectedRoute>
            }>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/items" element={<ItemsPage />} />
                <Route path="/stock" element={<StockPage />} />
                <Route path="/cash" element={<CashPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/salaries" element={<SalariesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;

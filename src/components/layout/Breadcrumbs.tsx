import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
    '/': 'Bosh sahifa',
    '/items': 'Mahsulotlar',
    '/stock': 'Ombor',
    '/cash': 'Kassa',
    '/employees': 'Xodimlar',
    '/salaries': 'Maoshlar',
    '/reports': 'Hisobotlar',
    '/settings': 'Sozlamalar',
};

export function Breadcrumbs() {
    const location = useLocation();
    const pathname = location.pathname;

    // Don't show breadcrumbs on dashboard
    if (pathname === '/') return null;

    const label = routeLabels[pathname] || pathname.slice(1);

    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
            <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Home className="h-3.5 w-3.5" />
                <span>Bosh sahifa</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{label}</span>
        </nav>
    );
}

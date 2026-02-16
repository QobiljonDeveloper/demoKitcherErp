import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ArrowDownUp,
    Wallet,
    Lightbulb,
    Users,
    Banknote,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Bosh sahifa' },
    { to: '/items', icon: Package, label: 'Mahsulotlar' },
    { to: '/stock', icon: ArrowDownUp, label: 'Ombor' },
    { to: '/cash', icon: Wallet, label: 'Kassa' },
    { to: '/utilities', icon: Lightbulb, label: 'Kommunal' },
    { to: '/employees', icon: Users, label: 'Xodimlar' },
    { to: '/salaries', icon: Banknote, label: 'Maoshlar' },
    { to: '/reports', icon: BarChart3, label: 'Hisobotlar' },
    { to: '/settings', icon: Settings, label: 'Sozlamalar' },
];

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { logout: storeLogout, user } = useAuthStore();

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch {
            // Ignore logout errors
        }
        storeLogout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile toggle - Only visible when sidebar is closed */}
            {!isOpen && (
                <Button
                    variant="default"
                    size="icon"
                    onClick={() => setIsOpen(true)}
                    className="lg:hidden fixed top-4 left-4 z-50"
                    aria-label="Menyu"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            )}

            {/* Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r transition-transform duration-300
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-primary">Oshxona ERP</h1>
                            <p className="text-sm text-muted-foreground">Boshqaruv tizimi</p>
                        </div>
                        {/* Close button for mobile */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`
                                }
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t">
                        <div className="mb-3 text-sm">
                            <p className="text-muted-foreground">Foydalanuvchi:</p>
                            <p className="font-medium truncate">{user?.email}</p>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            Chiqish
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;

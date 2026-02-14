import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';

export function Header() {
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <ThemeToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <User className="h-5 w-5" />
                            <span className="sr-only">Foydalanuvchi menyusi</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">Admin</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email || 'admin@kitchen.com'}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to="/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Sozlamalar</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Chiqish</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

import { Moon, Sun, Monitor } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';

export function SettingsPage() {
    const { theme, setTheme } = useTheme();

    const themes = [
        { value: 'light' as const, label: 'Kunduzgi rejim', icon: Sun, description: "Yorug' fon bilan" },
        { value: 'dark' as const, label: 'Tungi rejim', icon: Moon, description: "Qorong'u fon bilan" },
        { value: 'system' as const, label: 'Tizim rejimi', icon: Monitor, description: "Qurilma sozlamasiga qarab" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Sozlamalar</h1>
                <p className="text-muted-foreground">Tizim sozlamalarini boshqarish</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Mavzu</CardTitle>
                    <CardDescription>Interfeys rangini tanlang</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {themes.map((t) => (
                            <Button
                                key={t.value}
                                variant={theme === t.value ? 'default' : 'outline'}
                                className="flex flex-col items-center gap-2 h-auto py-4"
                                onClick={() => setTheme(t.value)}
                            >
                                <t.icon className="h-6 w-6" />
                                <span className="font-medium">{t.label}</span>
                                <span className="text-xs opacity-70">{t.description}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tizim haqida</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                    <p>Kitchen ERP — Oshxona boshqaruv tizimi</p>
                    <p>Versiya: 1.0.0</p>
                </CardContent>
            </Card>
        </div>
    );
}

export default SettingsPage;

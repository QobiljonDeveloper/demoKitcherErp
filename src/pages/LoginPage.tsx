import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const loginSchema = z.object({
    email: z.string().email('Noto\'g\'ri email manzili'),
    password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
    rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
    const navigate = useNavigate();
    const { login, setAccessToken } = useAuthStore();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    const rememberMe = watch('rememberMe');

    const onSubmit = async (data: LoginFormData) => {
        setError(null);
        setIsLoading(true);

        try {
            const response = await authApi.login({
                email: data.email,
                password: data.password,
                rememberMe: data.rememberMe,
            });
            // Store the token first so the axios interceptor can attach it
            setAccessToken(response.data.accessToken);
            const userResponse = await authApi.getMe();
            login(response.data.accessToken, userResponse.data);
            toast.success('Muvaffaqiyatli kirdingiz');
            navigate('/');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Email yoki parol noto\'g\'ri');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary">Kitchen ERP</CardTitle>
                    <CardDescription>Oshxona ERP - Tizimga kirish</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@kitchen.local"
                                {...register('email')}
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Parol</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...register('password')}
                                aria-invalid={!!errors.password}
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="rememberMe"
                                checked={rememberMe}
                                onCheckedChange={(checked) => setValue('rememberMe', checked === true)}
                            />
                            <Label
                                htmlFor="rememberMe"
                                className="text-sm font-normal cursor-pointer select-none"
                            >
                                Eslab qolish
                            </Label>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Kirilmoqda...' : 'Kirish'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default LoginPage;

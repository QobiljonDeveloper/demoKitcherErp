import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="text-center max-w-md">
                <div className="rounded-full bg-muted p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <FileQuestion className="h-12 w-12 text-muted-foreground" />
                </div>
                <h1 className="text-4xl font-bold mb-2">404</h1>
                <h2 className="text-xl font-semibold mb-2">Sahifa topilmadi</h2>
                <p className="text-muted-foreground mb-6">
                    Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.
                </p>
                <Button asChild>
                    <Link to="/">
                        <Home className="h-4 w-4 mr-2" />
                        Bosh sahifaga qaytish
                    </Link>
                </Button>
            </div>
        </div>
    );
}

export default NotFoundPage;

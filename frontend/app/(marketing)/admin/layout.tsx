import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute adminOnly={true}>
            {children}
        </ProtectedRoute>
    );
}

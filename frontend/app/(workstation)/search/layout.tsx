import { Suspense } from 'react';

export default function SearchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mt-8 text-center text-muted-foreground">Loading search...</div>
                </div>
            </div>
        }>
            {children}
        </Suspense>
    );
}

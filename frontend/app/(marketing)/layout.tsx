
import Header from "@/components/Header";
import { Footer } from "@/components/ui/footer";

export default function MarketingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <main className="relative overflow-hidden w-full">
                {children}
            </main>
            <Footer />
        </>
    );
}

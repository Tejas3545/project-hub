import { SignInPage } from "@/components/ui/sign-in";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    return (
        <div className="w-full min-h-screen flex items-center justify-center">
            <SignInPage />
        </div>
    );
}

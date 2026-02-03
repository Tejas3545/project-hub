import { SignUpPage } from "@/components/ui/sign-up";

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
    return (
        <div className="w-full min-h-screen flex items-center justify-center">
            <SignUpPage />
        </div>
    );
}

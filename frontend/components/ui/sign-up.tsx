'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/neon-button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

function SignUpPage() {
    return (
        <div className="grid w-full grow items-center px-4 sm:justify-center min-h-[80vh]">
            <Card className="w-full sm:w-96 bg-[#0A0A0A] border-white/10 text-white">
                <CardHeader className="space-y-2 pb-6">
                    <CardTitle className="text-2xl font-bold">Registration Disabled</CardTitle>
                    <CardDescription className="text-gray-400">
                        Accounts are created by administrators. Please contact your admin for access.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-y-4">
                    <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                        <Link href="/login">Go to Sign In</Link>
                    </Button>
                </CardContent>

                <CardFooter>
                    <div className="grid w-full gap-y-4">
                        <Button variant="link" size="sm" asChild className="text-gray-400 hover:text-white">
                            <Link href="/">
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

export { SignUpPage };

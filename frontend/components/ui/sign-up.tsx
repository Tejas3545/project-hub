'use client'
import React, { useState } from "react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/neon-button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function SignUpPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await register({ email, password, firstName: name })
            router.push("/")
        } catch (err: any) {
            setError(err.message || "Failed to create account")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid w-full grow items-center px-4 sm:justify-center min-h-[80vh]">
            <Card className="w-full sm:w-96 bg-[#0A0A0A] border-white/10 text-white">
                <CardHeader className="space-y-2 pb-6">
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription className="text-gray-400">Enter your details below to create your account</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-[#0F0F0F] border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-[#0F0F0F] border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-[#0F0F0F] border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-indigo-500"
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 font-medium">{error}</div>
                        )}

                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" disabled={loading}>
                            {loading ? "Creating account..." : "Create account"}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter>
                    <div className="grid w-full gap-y-4">
                        <Button variant="link" size="sm" asChild className="text-gray-400 hover:text-white">
                            <Link href="/login">
                                Already have an account? Sign in
                            </Link>
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

export { SignUpPage };

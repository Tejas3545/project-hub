'use client'
import React, { useState } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/neon-button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function SignInPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await login(email, password)
            router.push("/")
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to sign in")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid w-full grow items-center px-4 sm:justify-center min-h-[80vh]">
            <Card className="w-full sm:w-96 bg-[#0A0A0A] border-white/10 text-white">
                <CardHeader className="space-y-2 pb-6">
                    <CardTitle className="text-2xl font-bold">Sign in to Project Hub</CardTitle>
                    <CardDescription className="text-gray-400">Welcome back! Please sign in to continue</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export { SignInPage };

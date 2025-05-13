'use client'

import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks"
import { useEffect } from "react"

export default function LoginPage() {
    const router = useRouter()
    const { accessToken } = useAuth()

    useEffect(() => {
        if(accessToken){
            router.replace("/dashboard")
        } 
    }, [accessToken])

    const triggerBackendOAuth = () => {
        const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL
        router.replace(backendBaseUrl+'/oauth2/authorization/discord')
    }

    // TODO: turn this button into the discord button

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="flex justify-center items-center h-screen lg:mb-0 lg:grid-cols-4 lg:text-center">
                <button 
                    className="text-3xl text-center font-bold"
                    onClick={triggerBackendOAuth}>
                        Login
                </button>
            </div>
        </main>
    )
}
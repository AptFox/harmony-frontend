'use client'

import { useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function OAuthCallback() {
    const router = useRouter()
    const { login, accessToken, accessTokenIsLoading } = useAuth()

    useEffect(() => {
        if (!accessToken && accessTokenIsLoading) {
            login()
        } 
        if(accessToken && !accessTokenIsLoading) {
            router.replace("/dashboard")
        }
    }, [accessToken, accessTokenIsLoading])

    return (
        <div>
            { !accessToken && accessTokenIsLoading && <p>Logging you in...</p>}
            { !accessToken && !accessTokenIsLoading && <p>Something went wrong</p>}
        </div>
    )
}
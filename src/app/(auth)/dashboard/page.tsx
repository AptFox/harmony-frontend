'use client'
import { useUser } from "@/hooks/useUser"
import { useEffect } from "react"

export default function Dashboard() {
    const { user, isLoading, isError } = useUser()

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="flex justify-center items-center h-screen lg:mb-0 lg:grid-cols-4 lg:text-center">
                {isLoading && <p>Dashboard loading...</p>}
                {isError && <p>Dashboard error: {isError}</p>}
                {!isLoading && !isError && user && <p>Hello, {user.displayName}</p>}
            </div>
        </main>
    )
}
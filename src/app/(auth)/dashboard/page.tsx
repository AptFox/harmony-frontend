'use client'
import { useUser, useAuth } from "@/hooks"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"


export default function Dashboard() {
    const { user, isLoading, isError } = useUser()
    const { logout, accessToken } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (isLoading) return
        if (isError){
            // TODO: add logic that inspects the error and prints a standard pretty message
            toast({
                title: isError.name,
                description: isError.message,
                variant: "destructive"
            })

            router.push('/login')
        }
    }, [user, isLoading, isError, accessToken])

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="flex justify-center items-center lg:mb-0 lg:grid-cols-4 lg:text-center">
                { isLoading && <div ><p>Dashboard loading...</p></div>}
                {!isLoading && !isError && user && <div><p>Hello, {user.displayName}</p></div>}
            </div>
            <div>
                {!isLoading && !isError && user && <p>Details: {JSON.stringify(user)}</p>}
            </div>
            <div>
                <button onClick={logout}>Logout</button>
            </div>
        </main>
    )
}
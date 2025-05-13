'use client'

import { createContext, ReactNode } from "react"
import useSWR from "swr"
import swrFetcher, { createSwrRetryHandler } from "@/lib/api"
import { User, UserContextType } from "@/types/user"
import { useAuth } from "@/hooks/useAuth"

export const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserContextProvider = ({children}: {children: ReactNode}) => {
    const { accessToken, setAccessToken } = useAuth()
    const swrSignature: string[] | null = ['/api/user/@me', accessToken]
    
    const retryHandler = createSwrRetryHandler(setAccessToken)
    
    const { data, error, isLoading, mutate: refreshUser } = useSWR<User>(swrSignature, swrFetcher<User>, { shouldRetryOnError: false, use: [retryHandler] })

    return (
        <UserContext.Provider value={{ user: data, isLoading, isError: error, refreshUser }}>
            {children}
        </UserContext.Provider>
    )
}
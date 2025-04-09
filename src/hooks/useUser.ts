'use client'
import useSWR from 'swr'
import fetcher, { FetchOptions } from "@/lib/api"
import { User } from "@/types/User"


export function useUser(): { user: User | undefined, isLoading: boolean, isError: any } {
    const { data, error, isLoading } = useSWR('/api/user/@me', fetcher<User>)

    return {
        user: data,
        isLoading,
        isError: error
    }
}
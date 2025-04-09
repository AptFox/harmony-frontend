'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useUser } from '@/hooks'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isError } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!isLoading && !user) router.push('/login')
        if (isError) console.log(isError) // TODO: trigger a toast notification here
  }, [user, isLoading, isError])

  return user ? (
    <div className="flex h-screen">
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  ) : null
}

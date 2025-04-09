export interface FetchOptions {
    method?: 'GET' | 'POST' | 'PUT'
}

export default function fetcher<T>(url: string): Promise<T> {
    const accessToken = 'someTokenHere' // TODO: somehow retrieve this from react AuthContext
    const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL
    const requestUrl = backendBaseUrl ? `${backendBaseUrl+url}` : url

    // 401 error shape
    // {
    //     "timestamp": "2025-04-09T17:48:27.840+00:00",
    //     "status": 401,
    //     "error": "Unauthorized",
    //     "message": "Unauthorized",
    //     "path": "/api/user/@me"
    // }
    return fetch(requestUrl, {
        credentials: 'include',
        headers: { 
            'Content-Type': 'application/json',
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
         },
        method: 'GET',
    }).then(
        (res) => {
            if (res.ok) return res.json()
            throw new Error('something went wrong')
        }
    )
}
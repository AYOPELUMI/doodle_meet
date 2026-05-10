'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client';
import { ensureProfile } from '@/lib/supabase/ensure-profile';

// Create a wrapper component that handles the Suspense boundary
function HashHandlerContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createSupabaseClient()
    const redirectTo = searchParams.get('redirect_to') || '/dashboard'

    useEffect(() => {
        // Your existing handleHash logic here
        async function handleHash() {
            try {
                if (!window.location.hash) {
                    throw new Error('No authentication tokens found')
                }

                const hashParams = new URLSearchParams(window.location.hash.substring(1))
                const access_token = hashParams.get('access_token')
                const refresh_token = hashParams.get('refresh_token')

                if (!access_token || !refresh_token) {
                    throw new Error('Invalid authentication tokens')
                }
                //console.log("IN THE HASH PAGE")
                // Set the session first
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token,
                    refresh_token,
                })
                if (sessionError) throw sessionError

                // Get the authenticated user
                const { data: { user }, error: userError } = await supabase.auth.getUser()

                if (userError || !user) throw userError || new Error('User not found')

                const { data: existingProfile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .maybeSingle()
                ////console.log({ existingProfile }, { profileError }, !existingProfile)
                // Create profile if it doesn't exist
                if (!existingProfile) {

                    await ensureProfile(user)
                }

                // Clean URL and redirect
                window.history.replaceState(null, '', window.location.pathname)
                //////console.log({ redirectTo })
                router.replace(redirectTo)

            } catch (error) {
                console.error('Authentication error:', error)
                router.replace(
                    `/login?error=${encodeURIComponent(
                        error instanceof Error ? error.message : 'Authentication failed'
                    )}`
                )
            }
        }

        handleHash()
    }, [router, supabase, redirectTo])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Processing authentication...</h1>
                <p>Please wait while we verify your account.</p>
            </div>
        </div>
    )
}

// Main component with Suspense boundary
export default function HashHandler() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Loading...</h1>
                    <p>Please wait while we prepare the authentication process.</p>
                </div>
            </div>
        }>
            <HashHandlerContent />
        </Suspense>
    )
}

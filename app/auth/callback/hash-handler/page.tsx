'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client';

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
                console.log({ sessionError })

                if (sessionError) throw sessionError

                // Get the authenticated user
                const { data: { user }, error: userError } = await supabase.auth.getUser()
                console.log({ userError })

                if (userError || !user) throw userError || new Error('User not found')

                console.log({ user })
                // Check if profile exists
                const { data: existingProfile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .maybeSingle()

                if (profileError) {
                    console.error('Profile check error:', profileError)
                    // Continue even if profile check fails
                }
                ////console.log({ existingProfile }, { profileError }, !existingProfile)
                // Create profile if it doesn't exist
                if (!existingProfile) {
                    const { error: upsertError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: user.id,
                            email: user.email,
                            username: user.user_metadata?.username || user.email?.split('@')[0],
                            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                            avatar_url: user.user_metadata?.avatar_url || null,
                            plan: 'free',
                            snippets_count: 0,
                            max_snippets: 50,
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'id'
                        })

                    if (upsertError) {
                        console.error('Profile creation error:', upsertError)
                        // Continue even if profile creation fails
                    }
                }
                if (existingProfile) {


                    // const sessionData = {
                    //     id: sessionId,
                    //     user_id: existingProfile?.id,
                    //     device_info: device,
                    //     ip_address: ip,
                    //     location: location,
                    //     expires_at: new Date((user?.expires_at ?? 1) * 1000).toISOString(),
                    //     last_used_at: new Date().toISOString(),

                    // };

                    // await supabase.from('sessions').upsert(sessionData);
                    // const { error: loginError } = await supabase.from('login_history').insert({
                    //     user_id: existingProfile?.id,
                    //     device_info: device,
                    //     ip_address: ip,
                    //     location: location,
                    //     status: 'success',
                    //     created_at: new Date().toISOString()
                    // });
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
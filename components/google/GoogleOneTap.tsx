'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { ensureProfile } from '@/lib/supabase/ensure-profile'
import { useAuthStore } from '@/lib/store/auth-store'

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (options: {
                        client_id: string
                        callback: (response: CredentialResponse) => void
                        nonce?: string
                        use_fedcm_for_prompt?: boolean
                        auto_select?: boolean
                        cancel_on_tap_outside?: boolean
                    }) => void
                    prompt: () => void
                    cancel: () => void
                }
            }
        }
    }
}

type CredentialResponse = {
    credential: string
    select_by?: string
}

const generateNonce = async (): Promise<[string, string]> => {
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
    const encoder = new TextEncoder()
    const encodedNonce = encoder.encode(nonce)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return [nonce, hashedNonce]
}

const supportsFedCm = () => {
    if (typeof navigator === 'undefined') return false

    const userAgent = navigator.userAgent
    const isChromium = /Chrome|Chromium|Edg\//.test(userAgent)
    const isFirefox = /Firefox\//.test(userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent)

    return isChromium && !isFirefox && !isSafari
}

const GoogleOneTap = () => {
    const supabase = createSupabaseClient()
    const router = useRouter()
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const hasInitializedRef = useRef(false)

    useEffect(() => {
        if (!isAuthenticated) return
        window.google?.accounts.id.cancel()
    }, [isAuthenticated])

    const initializeGoogleOneTap = async () => {
        if (hasInitializedRef.current || isAuthenticated || !window.google) return

        const [nonce, hashedNonce] = await generateNonce()

        const { data: claims, error } = await supabase.auth.getClaims()
        if (error) {
            console.error(error)
        }
        if (claims) return

        hasInitializedRef.current = true

        window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: async (response: CredentialResponse) => {
                try {
                    const { data, error } = await supabase.auth.signInWithIdToken({
                        provider: 'google',
                        token: response.credential,
                        nonce,
                    })

                    if (error) throw error
                    if (data.user) {
                        await ensureProfile(data.user)
                    }

                    router.refresh()
                } catch (nextError) {
                    console.error(nextError)
                    hasInitializedRef.current = false
                }
            },
            nonce: hashedNonce,
            auto_select: false,
            cancel_on_tap_outside: false,
            use_fedcm_for_prompt: supportsFedCm(),
        })

        window.google.accounts.id.prompt()
    }

    return (
        <Script
            src="https://accounts.google.com/gsi/client"
            onReady={() => {
                initializeGoogleOneTap().catch(console.error)
            }}
        />
    )
}

export default GoogleOneTap

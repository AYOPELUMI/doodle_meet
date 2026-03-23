'use client'

import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'

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
                    }) => void
                    prompt: () => void
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

const GoogleOneTap = () => {
    const supabase = createSupabaseClient()
    const router = useRouter()

    const initializeGoogleOneTap = async () => {
        const [nonce, hashedNonce] = await generateNonce()

        // check session
        const { data: claims, error } = await supabase.auth.getClaims()
        if (error) console.error(error)
        if (claims) {
            router.push('/')
            return
        }

        window.google!.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: async (response: CredentialResponse) => {
                try {
                    console.log({ response })
                    const { data, error } = await supabase.auth.signInWithIdToken({
                        provider: 'google',
                        token: response.credential,
                        nonce,
                    })
                    if (error) throw error
                    router.push('/')
                } catch (error) {
                    console.error(error)
                }
            },
            nonce: hashedNonce,
            use_fedcm_for_prompt: true,
        })
        window.google!.accounts.id.prompt()
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


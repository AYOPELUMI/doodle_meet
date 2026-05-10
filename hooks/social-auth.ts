"use client"

import { createSupabaseClient } from "@/lib/supabase/client"
import { baseUrl } from "@/lib/utils"
import { toast } from "sonner"

const supabase = createSupabaseClient()

export async function signInWithGoogle() {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${baseUrl || window.location.origin}/auth/callback?redirect_to=/dashboard`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            }
        })
        if (error) throw error
    } catch {
        toast.error('Failed to sign in with Google')
    } finally {
    }
}
export async function signInWithGithub() {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${baseUrl || window.location.origin}/auth/callback?redirect_to=/dashboard`
            }
        })

        if (error) throw error
    } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to sign in with GitHub")
    } finally {
    }
}

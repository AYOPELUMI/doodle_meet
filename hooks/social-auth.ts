"use client"

import { createSupabaseClient } from "@/lib/supabase/client"
import { baseUrl } from "@/lib/utils"
import { toast } from "sonner"

const supabase = createSupabaseClient()

export async function signInWithGoogle() {

    //console.log({ baseUrl })
    try {
        //console.log(window.location.origin)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${baseUrl}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            }
        })
        if (error) throw error
    } catch (error) {
        toast.error('Failed to sign in with Google')
    } finally {
    }
}
export async function signInWithGithub() {


    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${baseUrl}/auth/callback`
            }
        })

        if (error) throw error
    } catch (error: any) {
        toast.error(error.message)
    } finally {
    }
}
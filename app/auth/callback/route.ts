import { createSupabaseServerClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const supabase = await createSupabaseServerClient()
    const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard'

    try {
        const code = requestUrl.searchParams.get('code')
        console.log({ code })
        if (!code) {
            // If no code, pass through to client-side handler
            return NextResponse.redirect(
                `${requestUrl.origin}/auth/callback/hash-handler?${requestUrl.searchParams}`
            )
        }

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        await supabase.auth.setSession({
            access_token: data.session?.access_token!,
            refresh_token: data.session?.refresh_token!
        })
        if (error) throw error

        //console.log({ redirectTo })
        //console.log({ data })
        //console.log({ requestUrl })
        return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)

    } catch (error) {
        console.log(error)
        return NextResponse.redirect(
            `${requestUrl.origin}/login?error=${encodeURIComponent(
                error instanceof Error ? error.message : 'Authentication failed'
            )}`
        )
    }
}
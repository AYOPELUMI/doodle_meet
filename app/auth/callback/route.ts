import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { toCookieUser } from '@/lib/auth/profile'
import { APP_USER_COOKIE, serializeCookieUser } from '@/lib/auth/cookies'
import { ensureProfile } from '@/lib/supabase/ensure-profile'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const supabase = await createSupabaseServerClient()
    const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard'

    try {
        const code = requestUrl.searchParams.get('code')
        if (!code) {
            // If no code, pass through to client-side handler
            return NextResponse.redirect(
                `${requestUrl.origin}/auth/callback/hash-handler?${requestUrl.searchParams}`
            )
        }

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error

        if (data.user) {
            await ensureProfile(data.user)
        }

        const response = NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)

        if (data.user) {
            const cookieUser = toCookieUser(data.user)
            response.cookies.set(APP_USER_COOKIE, serializeCookieUser(cookieUser), {
                path: "/",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7,
            })
        }

        return response

    } catch (error) {
        console.log(error)
        return NextResponse.redirect(
            `${requestUrl.origin}/login?error=${encodeURIComponent(
                error instanceof Error ? error.message : 'Authentication failed'
            )}`
        )
    }
}

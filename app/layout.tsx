import type { Metadata, Viewport } from 'next'
import './globals.css'
import "@stream-io/video-react-sdk/dist/css/styles.css"
import "stream-chat-react/dist/css/index.css"
import { AppProviders } from "@/components/providers/app-providers"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { toCookieUser } from "@/lib/auth/profile"

export const metadata: Metadata = {
  title: 'Doodle - Video Meetings Made Simple',
  description: 'Connect with anyone, anywhere. HD video meetings with smart scheduling, background filters, and seamless collaboration.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a14',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let initialUser = null

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle()

    initialUser = toCookieUser(user, profile)
  }

  return (
    <html lang="en">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body className="font-sans antialiased">
        <AppProviders initialUser={initialUser}>{children}</AppProviders>
      </body>
    </html>
  )
}

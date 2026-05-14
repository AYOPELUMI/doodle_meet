import { NextResponse } from "next/server";
import { StreamChat } from "stream-chat";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStreamServerConfig } from "@/lib/stream/config";
import { toCookieUser } from "@/lib/auth/profile";
import { nanoid } from "nanoid";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const requestUrl = new URL(request.url);
  const guestName = requestUrl.searchParams.get("guestName")?.trim();
  const guestId = requestUrl.searchParams.get("guestId")?.trim();

  const { apiKey, secret } = getStreamServerConfig();

  if (!apiKey || !secret) {
    return NextResponse.json(
      { error: "Stream environment variables are missing." },
      { status: 500 },
    );
  }

  const streamServer = StreamChat.getInstance(apiKey, secret);

  if (!user && (!guestName || !guestId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user && guestName && guestId) {
    const guestToken = streamServer.createToken(guestId);
    return NextResponse.json({
      apiKey,
      token: guestToken,
      user: {
        id: guestId,
        name: guestName,
        type: "guest",
        image: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(guestName)}&backgroundType=gradientLinear`,
      },
    });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user!.id)
    .maybeSingle();

  const appUser = toCookieUser(user!, profile);
  const token = streamServer.createToken(user!.id || nanoid(8));

  return NextResponse.json({
    apiKey,
    token,
    user: {
      id: appUser.id,
      name: appUser.name,
      image: appUser.avatar,
      type: "authenticated"
    },
  });
}

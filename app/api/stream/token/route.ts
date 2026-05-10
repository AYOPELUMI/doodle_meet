import { NextResponse } from "next/server";
import { StreamChat } from "stream-chat";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStreamServerConfig } from "@/lib/stream/config";
import { toCookieUser } from "@/lib/auth/profile";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { apiKey, secret } = getStreamServerConfig();

  if (!apiKey || !secret) {
    return NextResponse.json(
      { error: "Stream environment variables are missing." },
      { status: 500 },
    );
  }

  const streamServer = StreamChat.getInstance(apiKey, secret);
  const appUser = toCookieUser(user, profile);
  const token = streamServer.createToken(user.id);

  return NextResponse.json({
    apiKey,
    token,
    user: {
      id: appUser.id,
      name: appUser.name,
      image: appUser.avatar,
    },
  });
}

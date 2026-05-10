export function getStreamPublicConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY ?? "",
  };
}

export function getStreamServerConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY ?? "",
    secret: process.env.STREAM_API_SECRET ?? "",
  };
}

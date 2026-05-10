import { LiveMeetingRoom } from "@/components/meeting/live-meeting-room";

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <LiveMeetingRoom meetingId={id} />;
}

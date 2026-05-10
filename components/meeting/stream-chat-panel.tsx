"use client";

import { X } from "lucide-react";
import { Channel, Chat, MessageComposer, MessageList, Thread, Window } from "stream-chat-react";
import type { Channel as StreamChannel, StreamChat } from "stream-chat";
import { Button } from "@/components/ui/button";

type StreamChatPanelProps = {
  chatClient: StreamChat;
  channel: StreamChannel;
  onClose: () => void;
};

export function StreamChatPanel({ chatClient, channel, onClose }: StreamChatPanelProps) {
  return (
    <div className="flex h-full w-full min-w-0 flex-col border-l border-white/10 bg-[#08111f]/96 text-white lg:w-[360px]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">In-call chat</p>
          <p className="text-xs text-white/50">Messages stay attached to this room.</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 hover:text-white" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        <Chat client={chatClient} theme="str-chat__theme-dark">
          <Channel channel={channel}>
            <Window>
              <MessageList />
              <MessageComposer focus />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
}

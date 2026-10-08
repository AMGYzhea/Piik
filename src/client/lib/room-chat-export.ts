import type { RoomInteraction } from "./room-interactions";

/** Export received text only: no invite, peer IDs, reactions or pending sends. */
export function formatChatTranscript(messages: readonly RoomInteraction[]): string {
  const lines = messages.flatMap(message => message.payload.kind === "chat"
    ? [`[${new Date(message.occurredAt).toISOString()}] ${message.sender.displayName}`, message.payload.text, ""]
    : []);
  // Explicit UTF-8 signature and CRLF also work in older Windows text viewers.
  return "\uFEFF柚儿园聊天记录\r\n\r\n" + lines.join("\r\n");
}

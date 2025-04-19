"use client"; // Need this for using hooks

import { ChatForm } from "@/components/chat-form"
import { useChatTitle } from "./layout"; // Import the context hook

// Metadata can stay if desired, but the displayed title comes from Layout now
// export const metadata = {
//   title: "Yukie's Safe Little Corner",
//   description: "...",
//   generator: 'VieFam Inc.'
// }

export default function Page() {
  // Get the update function from context
  const { updateChatTitle } = useChatTitle();

  // Pass the update function to ChatForm
  return <ChatForm onUpdateTitle={updateChatTitle} />
}

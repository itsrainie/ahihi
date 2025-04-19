 "use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ArrowUpIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TypingEffect } from "@/components/typing-effect"

type Message = {
  role: "user" | "assistant"
  content: string
}

interface ChatFormProps extends React.ComponentProps<"form"> {
  onUpdateTitle?: (newTitle: string) => void;
}

export function ChatForm({ className, onUpdateTitle, ...props }: ChatFormProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [titleUpdated, setTitleUpdated] = useState(false);

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Add user message to the chat
      const userMessage: Message = { role: "user", content }
      setMessages((prev) => [...prev, userMessage])

      // Scroll immediately after user message is added
      // Wait a tick for the DOM to update
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 0);

      let assistantContent =  "The bot encountered an issue. Please try again.";
      // Send the message to the API
      const isFirstMessage = messages.length === 1;
      let response;

      if (isFirstMessage) {
        // Send the message to the API with a system instruction to summarize
        response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [{ role: "system", content: `Summarize the following message and derive a title for our chat, maximum 5 words: ${content}` }, userMessage],
          }),
        });
      } else {
        // Send the message to the API
        response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        });
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          throw new Error(`Failed to get a response: ${response.status} - ${response.statusText} - ${await response.text()}`);
        }
        throw new Error(errorData.error || `Failed to get a response: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json()
      assistantContent = data?.choices?.[0]?.message?.content || assistantContent;

      const assistantMessage: Message = {
        role: "assistant",
        content: assistantContent,
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Update the title with the assistant's response
      if (!titleUpdated && onUpdateTitle && isFirstMessage) {
        onUpdateTitle(assistantContent);
        setTitleUpdated(true);
      }
    } catch (err) {
      console.error("Chat error:", err)
      setError(`Failed to get a response: ${err instanceof Error ? err.message : "Unknown error"}`)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    sendMessage(input)
    setInput("");
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  const header = (
    <header className="m-auto flex max-w-96 flex-col gap-5 text-center">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">Yukie's Safe Little Corner</h1>
      <p className="text-muted-foreground text-sm">
      <i>Hello there! ✨ I'm <span className="text-foreground"><b>Yukie</b></span>, your sweet little friend with a pure heart who's <span className="text-foreground">always ready to listen</span>! This is a safe corner for you to <span className="text-foreground">share anything</span> without any worries at all. 😊</i>
      </p>
      <p className="text-muted-foreground text-sm">Send a message to start chatting with Yukie!</p>
      <p className="text-muted-foreground text-sm">Please use only one language in one message to talk to Yukie, as we are working on this!</p>
    </header>
  )

  useEffect(() => {
    // Initial focus on mount
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    // Re-focus input after bot finishes responding
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Message List Rendering
  const messageList = (
    <div
      className="my-4 flex flex-col gap-4"
      style={{ overflowAnchor: "auto" }}
    >
      {messages.map((message, index) => (
        <div
          key={index}
          data-role={message.role}
          className="max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white"
        >
          {/* Apply typing effect only to the last assistant message */}
          {message.role === 'assistant' && index === messages.length - 1 ? (
            <TypingEffect
              text={message.content}
              speed={30}
              scrollContainerRef={scrollContainerRef}
            />
          ) : (
            message.content
          )}
        </div>
      ))}
      {/* Loading indicator for chat response */}
      {isLoading && (
        <div className="max-w-[80%] self-start rounded-xl bg-gray-100 px-3 py-2 text-sm text-black">
          <div className="flex gap-1">
            <div className="animate-bounce">●</div>
            <div className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</div>
            <div className="animate-bounce" style={{ animationDelay: "0.4s" }}>●</div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <main
      className={cn(
        "ring-none mx-auto flex h-[calc(100svh-64px)] max-h-[calc(100svh-64px)] w-full flex-col items-stretch border-none",
        className,
      )}
      {...props}
    >
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 pb-4">
      {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {messages.length ? messageList : header}
      </div>
      <form
        onSubmit={handleSubmit}
        className="border-input bg-background focus-within:ring-ring/10 relative mx-auto mb-6 flex w-full max-w-4xl items-center justify-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
      >
        <AutoResizeTextarea
          onKeyDown={handleKeyDown}
          onChange={(v) => setInput(v)}
          value={input}
          placeholder="Enter a message"
          className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none"
          disabled={isLoading} // Also disable input while generating title
          ref={inputRef}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-1 right-1 size-6 rounded-full"
                disabled={isLoading || !input.trim()} // Also disable button
                type="submit"
              >
                <ArrowUpIcon size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={12}>Submit</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </form>
    </main>
  )
}

import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import { InlineSpinner } from "@/components/ui/Spinner";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { MessageSquare } from "lucide-react";
import { useEffect, useRef } from "react";
import ConversationList from "./ConversationList";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ChatInterface({ role = "customer" }) {
  const { user } = useAuthStore();
  const chat = useChat({ role });
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  const activeConv = chat.conversations.find(
    (c) => c.id === chat.activeConversationId,
  );

  return (
    <div
      className={cn(
        "flex h-full rounded-2xl overflow-hidden",
        "border border-brand-800 bg-brand-900",
        "min-h-125 max-h-[calc(100vh-160px)]",
      )}
    >
      {/* Conversation List (admin only) */}
      {role === "admin" && (
        <div
          className={cn(
            "flex flex-col shrink-0",
            "border-r border-brand-800",
            chat.activeConversationId
              ? "hidden md:flex w-72 lg:w-80"
              : "flex w-full md:w-72 lg:w-80",
          )}
        >
          <ConversationList chat={chat} />
        </div>
      )}

      {/* Message Thread */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Thread Header */}
        {(role === "admin" && chat.activeConversationId) ||
        role === "customer" ? (
          <div
            className="flex items-center gap-3 px-4 py-3.5
                        border-b border-brand-800 shrink-0"
          >
            {role === "admin" && (
              <>
                <button
                  onClick={() => chat.setSearch("")}
                  className="md:hidden text-brand-400 hover:text-brand-100
                             transition-colors"
                >
                  ←
                </button>
                <Avatar name={activeConv?.customerName} size="sm" online />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-100 font-sans truncate">
                    {activeConv?.customerName ?? "Customer"}
                  </p>
                  <p className="text-xs text-brand-500 font-sans">
                    Active conversation
                  </p>
                </div>
              </>
            )}

            {role === "customer" && (
              <>
                <Avatar name="Double Seven" size="sm" />
                <div>
                  <p className="text-sm font-semibold text-brand-100 font-sans">
                    Double Seven Support
                  </p>
                  <p className="text-xs text-brand-500 font-sans">
                    We typically reply within minutes
                  </p>
                </div>
              </>
            )}
          </div>
        ) : null}

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {role === "admin" && !chat.activeConversationId && (
            <EmptyState
              icon={<MessageSquare className="size-8" />}
              title="Select a conversation"
              description="Choose a customer from the list to start messaging."
              size="md"
            />
          )}

          {chat.isLoadingMsgs && (
            <InlineSpinner message="Loading messages..." />
          )}

          {!chat.isLoadingMsgs &&
            (role === "customer" || chat.activeConversationId) && (
              <div className="flex flex-col gap-3 p-4">
                {chat.messages.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-sm text-brand-500 font-sans text-center">
                      No messages yet. Say hello!
                    </p>
                  </div>
                ) : (
                  chat.messages.map((msg, i) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={
                        msg.sender_id === user?.id ||
                        msg.sender_id === "current_user"
                      }
                      showAvatar={
                        i === 0 ||
                        chat.messages[i - 1]?.sender_id !== msg.sender_id
                      }
                      senderName={
                        role === "admin" && msg.sender_id !== user?.id
                          ? activeConv?.customerName
                          : ""
                      }
                    />
                  ))
                )}
                <div ref={bottomRef} />
              </div>
            )}
        </div>

        {/* Message Input */}
        {(role === "customer" || chat.activeConversationId) && (
          <div className="shrink-0 border-t border-brand-800">
            <MessageInput
              onSend={chat.sendMessage}
              onSendImage={chat.sendImage}
              isSending={chat.isSending}
              disabled={chat.isLoadingMsgs}
            />
          </div>
        )}
      </div>
    </div>
  );
}
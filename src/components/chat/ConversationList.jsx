import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import { InlineSpinner } from "@/components/ui/Spinner";
import { cn, timeAgo, truncate } from "@/lib/utils";
import { MessageSquare, Search } from "lucide-react";

export default function ConversationList({ chat }) {
  const {
    conversations,
    activeConversationId,
    isLoadingConvs,
    search,
    setSearch,
    selectConversation,
    totalUnread,
  } = chat;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-brand-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold font-sans text-brand-100">
            Messages
          </h3>
          {totalUnread > 0 && (
            <span
              className="text-xs font-medium font-mono px-2 py-0.5
                           rounded-full bg-accent-500/20 text-accent-400"
            >
              {totalUnread} unread
            </span>
          )}
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          iconLeft={<Search className="size-4" />}
          size="sm"
        />
      </div>

      {/* Conversation items */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoadingConvs ? (
          <InlineSpinner message="Loading..." />
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="size-6" />}
            title="No conversations"
            description={
              search ? "No results for your search." : "No messages yet."
            }
            size="sm"
          />
        ) : (
          <div className="py-1">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConversationId}
                onSelect={() => selectConversation(conv.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationItem({ conv, isActive, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3.5",
        "transition-colors duration-150 text-left",
        isActive
          ? "bg-accent-500/8 border-r-2 border-accent-500"
          : "hover:bg-brand-800/60",
      )}
    >
      <Avatar
        name={conv.customerName}
        size="sm"
        online={conv.unreadCount > 0}
        className="shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p
            className={cn(
              "text-sm font-sans truncate",
              conv.unreadCount > 0
                ? "font-semibold text-brand-100"
                : "font-medium text-brand-200",
            )}
          >
            {conv.customerName}
          </p>
          <span className="text-xs text-brand-500 font-sans shrink-0">
            {timeAgo(conv.lastAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-xs font-sans truncate",
              conv.unreadCount > 0 ? "text-brand-300" : "text-brand-500",
            )}
          >
            {truncate(conv.lastMessage, 36)}
          </p>
          {conv.unreadCount > 0 && (
            <span
              className="shrink-0 size-5 flex items-center justify-center
                           rounded-full bg-accent-500 text-white
                           text-xs font-bold font-mono"
            >
              {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
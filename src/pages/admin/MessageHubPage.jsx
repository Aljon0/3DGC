import ChatInterface from "@/components/chat/ChatInterface";
import { useUIStore } from "@/store/useUIStore";
import { useEffect } from "react";

export default function MessageHubPage() {
  const { setPageTitle } = useUIStore();
  useEffect(() => {
    setPageTitle("Message Hub");
  }, [setPageTitle]);

  return (
    <div className="space-y-4 h-[calc(100vh-120px)]">
      <div>
        <h2 className="font-display text-2xl font-bold text-brand-50">
          Message Hub
        </h2>
        <p className="text-sm text-brand-400 font-sans mt-1">
          Centralized inbox for all customer conversations.
        </p>
      </div>
      <div className="h-[calc(100%-80px)]">
        <ChatInterface role="admin" />
      </div>
    </div>
  );
}

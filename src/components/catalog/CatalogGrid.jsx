import EmptyState from "@/components/ui/EmptyState";
import { cn }     from "@/lib/utils";
import { LayoutTemplate } from "lucide-react";
import CatalogCard from "./CatalogCard";

export default function CatalogGrid({
  items = [],
  type = "template",
  isLoading = false,
  emptyTitle,
  emptyDescription,
  onSelect,
}) {
  // Filter out any null/undefined items before rendering
  const safeItems = items.filter(Boolean);

  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-4",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      )}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (safeItems.length === 0) {
    return (
      <EmptyState
        icon={<LayoutTemplate className="size-7" />}
        title={emptyTitle}
        description={emptyDescription}
        size="md"
      />
    );
  }

  return (
    <div className={cn(
      "grid gap-4 animate-fade-in",
      type === "element"
        ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    )}>
      {safeItems.map((item) => (
        <CatalogCard
          key={item.id}
          item={item}
          type={type}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-2xl bg-brand-900 border border-brand-800
                    overflow-hidden animate-pulse">
      <div className="w-full aspect-4/3 bg-brand-800" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 bg-brand-800 rounded-lg" />
        <div className="h-3 w-1/2 bg-brand-800 rounded-lg" />
      </div>
    </div>
  );
}
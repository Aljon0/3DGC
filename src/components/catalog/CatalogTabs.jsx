import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { LayoutTemplate, Shapes } from "lucide-react";
import CatalogGrid from "./CatalogGrid";

export default function CatalogTabs({
  templates    = [],
  elements     = [],
  isLoading    = false,
  onSelectTemplate,
  onSelectElement,
}) {
  return (
    <Tabs defaultValue="templates">
      <TabsList className="mb-6">
        <TabsTrigger
          value="templates"
          icon={<LayoutTemplate className="size-3.5" />}
          badge={templates.length}
        >
          Templates
        </TabsTrigger>
        <TabsTrigger
          value="elements"
          icon={<Shapes className="size-3.5" />}
          badge={elements.length}
        >
          Elements
        </TabsTrigger>
      </TabsList>

      <TabsContent value="templates">
        <CatalogGrid
          items={templates}
          type="template"
          isLoading={isLoading}
          emptyTitle="No templates yet"
          emptyDescription="Admin-created templates will appear here."
          onSelect={onSelectTemplate}
        />
      </TabsContent>

      <TabsContent value="elements">
        <CatalogGrid
          items={elements}
          type="element"
          isLoading={isLoading}
          emptyTitle="No elements yet"
          emptyDescription="Decorative elements and assets will appear here."
          onSelect={onSelectElement}
        />
      </TabsContent>
    </Tabs>
  );
}
import KanbanBoard from "@/components/orders/KanbanBoard";
import OrderDetailSlideOver from "@/components/orders/OrderDetailSlideOver";
import WalkInOrderModal from "@/components/orders/WalkInOrderModal";
import { useUIStore } from "@/store/useUIStore";
import { useEffect, useState } from "react";

export default function OrderManagementPage() {
  const { setPageTitle } = useUIStore();
  const [walkInOpen, setWalkInOpen] = useState(false);

  useEffect(() => {
    setPageTitle("Order Management");
  }, [setPageTitle]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <KanbanBoard
        onAddWalkIn={() => setWalkInOpen(true)}
        onPrint={handlePrint}
      />

      <WalkInOrderModal
        open={walkInOpen}
        onClose={() => setWalkInOpen(false)}
      />

      <OrderDetailSlideOver role="admin" />
    </div>
  );
}

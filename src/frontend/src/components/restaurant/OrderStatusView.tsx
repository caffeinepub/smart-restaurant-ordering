import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ChefHat, Clock, Plus, ReceiptText } from "lucide-react";
import { motion } from "motion/react";
import { OrderStatus } from "../../backend";
import { useGetTableOrders } from "../../hooks/useQueries";
import type { Order } from "../../hooks/useQueries";

interface OrderStatusViewProps {
  tableNumber: number;
  orderId: bigint | null;
  onViewBill: () => void;
  onNewOrder: () => void;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = {
    [OrderStatus.pending]: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    [OrderStatus.confirmed]: {
      label: "Preparing",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    [OrderStatus.ready]: {
      label: "Ready! 🎉",
      className: "bg-green-100 text-green-800 border-green-200",
    },
  };
  const c = config[status] ?? config[OrderStatus.pending];
  return (
    <Badge className={`font-ui font-medium border ${c.className}`}>
      {c.label}
    </Badge>
  );
}

function StatusIcon({ status }: { status: OrderStatus }) {
  if (status === OrderStatus.ready) {
    return (
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
      >
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </motion.div>
    );
  }
  if (status === OrderStatus.confirmed) {
    return (
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
      >
        <ChefHat className="w-12 h-12 text-blue-500" />
      </motion.div>
    );
  }
  return (
    <motion.div
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
    >
      <Clock className="w-12 h-12 text-yellow-500" />
    </motion.div>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const placedTime = new Date(
    Number(order.placedAt) / 1_000_000,
  ).toLocaleTimeString();
  const estimatedMins = order.estimatedMinutes
    ? Number(order.estimatedMinutes)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      data-ocid="order.status.panel"
      className="bg-card border border-border rounded-xl p-5 shadow-xs"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-ui text-sm text-muted-foreground">
            Order #{Number(order.id)}
          </p>
          <p className="font-display font-semibold text-foreground text-lg">
            Placed at {placedTime}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <StatusIcon status={order.status} />
        <div>
          {order.status === OrderStatus.pending && (
            <p className="font-ui text-muted-foreground text-sm">
              Your order is waiting to be confirmed by the kitchen.
            </p>
          )}
          {order.status === OrderStatus.confirmed && (
            <p className="font-ui text-sm text-foreground">
              {estimatedMins ? (
                <>
                  Your order will be ready in approximately{" "}
                  <strong>{estimatedMins} min</strong>.
                </>
              ) : (
                "Your order is being prepared."
              )}
            </p>
          )}
          {order.status === OrderStatus.ready && (
            <p className="font-ui font-semibold text-green-700">
              Your order is ready! Enjoy your meal! 🎉
            </p>
          )}
        </div>
      </div>

      {/* Items list */}
      <div className="bg-accent/30 rounded-lg p-3">
        <p className="font-ui text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Order Items
        </p>
        <div className="space-y-1">
          {order.items.map((item) => (
            <div
              key={item.menuItemId.toString()}
              className="flex justify-between text-sm font-ui"
            >
              <span className="text-foreground">
                {item.name}{" "}
                <span className="text-muted-foreground">
                  ×{Number(item.quantity)}
                </span>
              </span>
              <span className="text-foreground font-medium">
                ${(item.price * Number(item.quantity)).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function OrderStatusView({
  tableNumber,
  onViewBill,
  onNewOrder,
}: OrderStatusViewProps) {
  const { data: orders = [], isLoading } = useGetTableOrders(tableNumber);

  const activeOrders = orders.filter(
    (o) => o.status !== OrderStatus.ready || true,
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Table {tableNumber} — Order Status
          </h2>
          <p className="text-muted-foreground font-ui mt-1 text-sm">
            Updates automatically every 5 seconds
          </p>
        </div>

        {isLoading ? (
          <div data-ocid="order.loading_state" className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : activeOrders.length === 0 ? (
          <div
            data-ocid="order.empty_state"
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Clock className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="font-ui text-muted-foreground">No active orders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((order, idx) => (
              <OrderCard key={order.id.toString()} order={order} index={idx} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <Button
            data-ocid="order.bill.button"
            variant="outline"
            className="flex-1 font-ui"
            onClick={onViewBill}
          >
            <ReceiptText className="w-4 h-4 mr-2" />
            View Bill
          </Button>
          <Button className="flex-1 font-ui" onClick={onNewOrder}>
            <Plus className="w-4 h-4 mr-2" />
            Add More Items
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

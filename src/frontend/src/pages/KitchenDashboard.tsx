import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  ChefHat,
  Clock,
  Loader2,
  LogIn,
  RefreshCw,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useConfirmOrder,
  useGetActiveKitchenOrders,
  useIsCallerAdmin,
  useMarkOrderReady,
} from "../hooks/useQueries";
import type { Order } from "../hooks/useQueries";

function StatusBadge({ status }: { status: OrderStatus }) {
  if (status === OrderStatus.ready) {
    return (
      <Badge className="bg-green-100 text-green-800 border border-green-200 font-ui">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Ready
      </Badge>
    );
  }
  if (status === OrderStatus.confirmed) {
    return (
      <Badge className="bg-blue-100 text-blue-800 border border-blue-200 font-ui">
        <ChefHat className="w-3 h-3 mr-1" />
        Preparing
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 font-ui">
      <Clock className="w-3 h-3 mr-1" />
      Pending
    </Badge>
  );
}

function KitchenOrderCard({
  order,
  index,
  onConfirm,
  onReady,
  isConfirming,
  isMarking,
}: {
  order: Order;
  index: number;
  onConfirm: (id: bigint, minutes: number) => Promise<void>;
  onReady: (id: bigint) => Promise<void>;
  isConfirming: boolean;
  isMarking: boolean;
}) {
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const placedTime = new Date(
    Number(order.placedAt) / 1_000_000,
  ).toLocaleTimeString();
  const now = Date.now();
  const placedMs = Number(order.placedAt) / 1_000_000;
  const elapsedMinutes = Math.floor((now - placedMs) / 60_000);

  const borderColor =
    order.status === OrderStatus.ready
      ? "border-green-200"
      : order.status === OrderStatus.confirmed
        ? "border-blue-200"
        : "border-yellow-200";

  return (
    <motion.div
      data-ocid={`kitchen.item.${index + 1}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.06 }}
      className={`bg-card border-2 ${borderColor} rounded-xl p-5 shadow-xs`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display font-bold text-2xl text-foreground">
              Table {Number(order.tableNumber)}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-ui">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Ordered at {placedTime}
            </span>
            <span className="text-xs">
              ({elapsedMinutes === 0 ? "just now" : `${elapsedMinutes}m ago`})
            </span>
          </div>
        </div>
        <span className="text-xs font-ui text-muted-foreground">
          #{Number(order.id)}
        </span>
      </div>

      {/* Items */}
      <div className="bg-accent/30 rounded-lg p-3 mb-4">
        <p className="font-ui text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
        </p>
        <div className="space-y-1.5">
          {order.items.map((item) => (
            <div
              key={item.menuItemId.toString()}
              className="flex justify-between text-sm font-ui"
            >
              <span className="font-semibold text-foreground">{item.name}</span>
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-bold">
                ×{Number(item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {order.status === OrderStatus.pending && (
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Label
              htmlFor={`est-${order.id}`}
              className="text-xs font-ui text-muted-foreground mb-1 block"
            >
              Est. minutes
            </Label>
            <Input
              id={`est-${order.id}`}
              type="number"
              min={1}
              max={120}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="h-9 font-ui"
            />
          </div>
          <Button
            data-ocid={`kitchen.confirm_button.${index + 1}`}
            className="font-ui font-semibold flex-1"
            disabled={isConfirming}
            onClick={() => onConfirm(order.id, estimatedMinutes)}
          >
            {isConfirming ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-1" />
            )}
            Confirm Order
          </Button>
        </div>
      )}

      {order.status === OrderStatus.confirmed && (
        <Button
          data-ocid={`kitchen.ready_button.${index + 1}`}
          className="w-full font-ui font-semibold bg-green-600 hover:bg-green-700 text-white"
          disabled={isMarking}
          onClick={() => onReady(order.id)}
        >
          {isMarking ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mr-1" />
          )}
          Mark as Ready
        </Button>
      )}

      {order.status === OrderStatus.ready && (
        <div className="flex items-center justify-center gap-2 py-2 text-green-600 font-ui font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          Order Ready — Served!
        </div>
      )}
    </motion.div>
  );
}

export default function KitchenDashboard() {
  const { login, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch,
    isFetching,
  } = useGetActiveKitchenOrders();
  const { mutateAsync: confirmOrder, isPending: isConfirming } =
    useConfirmOrder();
  const { mutateAsync: markReady, isPending: isMarking } = useMarkOrderReady();

  const handleConfirm = async (id: bigint, minutes: number) => {
    try {
      await confirmOrder({ id, estimatedMinutes: minutes });
      toast.success(`Order confirmed! Ready in ${minutes} min.`);
    } catch {
      toast.error("Failed to confirm order.");
    }
  };

  const handleMarkReady = async (id: bigint) => {
    try {
      await markReady(id);
      toast.success("Order marked as ready!");
    } catch {
      toast.error("Failed to update order.");
    }
  };

  // Sort by oldest first
  const sortedOrders = [...orders].sort(
    (a, b) => Number(a.placedAt) - Number(b.placedAt),
  );

  const pendingCount = orders.filter(
    (o) => o.status === OrderStatus.pending,
  ).length;
  const preparingCount = orders.filter(
    (o) => o.status === OrderStatus.confirmed,
  ).length;

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div
          data-ocid="kitchen.loading_state"
          className="space-y-4 w-full max-w-md px-4"
        >
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center shadow-xs"
        >
          <ChefHat className="w-14 h-14 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Kitchen Access
          </h2>
          <p className="text-muted-foreground font-ui text-sm mb-6">
            This area is for kitchen staff only. Please sign in with your admin
            credentials to continue.
          </p>
          <Button
            data-ocid="auth.login_button"
            className="w-full font-ui font-semibold"
            size="lg"
            onClick={login}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4 mr-2" />
            )}
            {isLoggingIn ? "Signing In..." : "Sign In to Access Kitchen"}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-primary" />
            Kitchen Dashboard
          </h1>
          <p className="text-muted-foreground font-ui text-sm mt-1">
            Live order feed — auto-refreshes every 5 seconds
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="font-ui gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="font-display text-3xl font-bold text-yellow-700">
            {pendingCount}
          </p>
          <p className="text-yellow-600 font-ui text-sm mt-1">Pending</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="font-display text-3xl font-bold text-blue-700">
            {preparingCount}
          </p>
          <p className="text-blue-600 font-ui text-sm mt-1">Preparing</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="font-display text-3xl font-bold text-foreground">
            {orders.length}
          </p>
          <p className="text-muted-foreground font-ui text-sm mt-1">
            Total Active
          </p>
        </div>
      </div>

      {/* Orders grid */}
      {ordersLoading ? (
        <div
          data-ocid="kitchen.loading_state"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {["k1", "k2", "k3", "k4"].map((k) => (
            <Skeleton key={k} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : sortedOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-ocid="kitchen.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <ChefHat className="w-20 h-20 text-muted-foreground/20 mb-4" />
          <h3 className="font-display text-xl font-semibold text-muted-foreground mb-2">
            All caught up!
          </h3>
          <p className="text-sm text-muted-foreground font-ui">
            No active orders right now. New orders will appear here
            automatically.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {sortedOrders.map((order, idx) => (
              <KitchenOrderCard
                key={order.id.toString()}
                order={order}
                index={idx}
                onConfirm={handleConfirm}
                onReady={handleMarkReady}
                isConfirming={isConfirming}
                isMarking={isMarking}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

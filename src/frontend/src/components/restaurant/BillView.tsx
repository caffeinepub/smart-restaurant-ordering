import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, ReceiptText } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { OrderStatus } from "../../backend";
import {
  useGetTableBill,
  useGetTableOrders,
  usePayBill,
} from "../../hooks/useQueries";

interface BillViewProps {
  tableNumber: number;
  onBack: () => void;
  onPaySuccess: () => void;
}

export default function BillView({
  tableNumber,
  onBack,
  onPaySuccess,
}: BillViewProps) {
  const { data: orders = [], isLoading: ordersLoading } =
    useGetTableOrders(tableNumber);
  const { data: totalBill = 0, isLoading: billLoading } =
    useGetTableBill(tableNumber);
  const { mutateAsync: payBill, isPending: isPaying } = usePayBill();

  const isLoading = ordersLoading || billLoading;

  const formatINR = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handlePay = async () => {
    try {
      await payBill(tableNumber);
      toast.success("Bill paid! Thank you for dining with us! 🙏");
      onPaySuccess();
    } catch {
      toast.error("Payment failed. Please try again.");
    }
  };

  // Collect all items from all orders
  const allItems: {
    name: string;
    quantity: number;
    price: number;
    orderStatus: OrderStatus;
  }[] = [];

  for (const order of orders) {
    for (const item of order.items) {
      const existing = allItems.find(
        (a) =>
          a.name === item.name &&
          a.price === item.price &&
          a.orderStatus === order.status,
      );
      if (existing) {
        existing.quantity += Number(item.quantity);
      } else {
        allItems.push({
          name: item.name,
          quantity: Number(item.quantity),
          price: item.price,
          orderStatus: order.status,
        });
      }
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-lg mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-6 font-ui text-muted-foreground gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
          {/* Bill header */}
          <div className="bg-primary px-6 py-5 text-primary-foreground">
            <div className="flex items-center gap-3">
              <ReceiptText className="w-6 h-6" />
              <div>
                <h2 className="font-display text-xl font-bold">Bill Summary</h2>
                <p className="text-primary-foreground/80 text-sm font-ui">
                  Table {tableNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Bill body */}
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : allItems.length === 0 ? (
              <div data-ocid="bill.empty_state" className="text-center py-8">
                <p className="text-muted-foreground font-ui">
                  No items to bill
                </p>
              </div>
            ) : (
              <>
                {/* Order items */}
                <div className="space-y-3 mb-4">
                  {orders.flatMap((order) =>
                    order.items.map((item) => (
                      <div
                        key={`${order.id.toString()}-${item.menuItemId.toString()}`}
                        className="flex items-center justify-between text-sm font-ui"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-medium">
                            {item.name}
                          </span>
                          <span className="text-muted-foreground">
                            ×{Number(item.quantity)}
                          </span>
                        </div>
                        <span className="text-foreground font-semibold">
                          {formatINR(item.price * Number(item.quantity))}
                        </span>
                      </div>
                    )),
                  )}
                </div>

                <Separator className="my-4" />

                {/* Total */}
                <div className="flex items-center justify-between font-ui">
                  <span className="text-muted-foreground text-sm">
                    Subtotal
                  </span>
                  <span className="font-semibold">{formatINR(totalBill)}</span>
                </div>
                <div className="flex items-center justify-between font-ui mt-2">
                  <span className="text-muted-foreground text-sm">
                    Service charge
                  </span>
                  <span className="font-semibold text-muted-foreground">
                    Included
                  </span>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-lg text-foreground">
                    Total
                  </span>
                  <span className="font-display font-bold text-2xl text-primary">
                    {formatINR(totalBill)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Pay button */}
          <div className="px-6 pb-6">
            <Button
              data-ocid="bill.pay_button"
              className="w-full font-ui font-semibold"
              size="lg"
              disabled={isPaying || isLoading || allItems.length === 0}
              onClick={handlePay}
            >
              {isPaying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatINR(totalBill)} & Clear Table`
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

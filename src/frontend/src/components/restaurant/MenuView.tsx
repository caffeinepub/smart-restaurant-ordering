import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetMenu } from "../../hooks/useQueries";
import { usePlaceOrder } from "../../hooks/useQueries";
import type { OrderItem } from "../../hooks/useQueries";
import type { CartItem } from "../../pages/CustomerView";

// Category display label -> backend category string
const CATEGORIES: {
  label: string;
  value: string;
  emoji: string;
  fallbackImage: string;
}[] = [
  {
    label: "Sabji / Vegetables",
    value: "Sabji",
    emoji: "🥘",
    fallbackImage: "/assets/generated/food-sabji.dim_600x400.jpg",
  },
  {
    label: "Roti / Bread",
    value: "Roti",
    emoji: "🫓",
    fallbackImage: "/assets/generated/food-roti.dim_600x400.jpg",
  },
  {
    label: "Rice",
    value: "Rice",
    emoji: "🍚",
    fallbackImage: "/assets/generated/food-rice.dim_600x400.jpg",
  },
  {
    label: "Sides",
    value: "Sides",
    emoji: "🥗",
    fallbackImage: "/assets/generated/food-sides.dim_600x400.jpg",
  },
  {
    label: "Drinks",
    value: "Drinks",
    emoji: "🥤",
    fallbackImage: "/assets/generated/food-drinks.dim_600x400.jpg",
  },
];

const getCategoryFallback = (category: string): string => {
  const cat = CATEGORIES.find(
    (c) => c.value.toLowerCase() === category.toLowerCase(),
  );
  return cat?.fallbackImage ?? "/assets/generated/food-sabji.dim_600x400.jpg";
};

interface MenuViewProps {
  tableNumber: number;
  cart: CartItem[];
  onAddToCart: (item: {
    menuItemId: bigint;
    name: string;
    price: number;
  }) => void;
  onUpdateQuantity: (menuItemId: bigint, delta: number) => void;
  onRemoveItem: (menuItemId: bigint) => void;
  onOrderPlaced: (orderId: bigint) => void;
  onChangeTable: () => void;
  cartAsOrderItems: () => OrderItem[];
}

export default function MenuView({
  tableNumber,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onOrderPlaced,
  onChangeTable,
  cartAsOrderItems,
}: MenuViewProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const { data: menuItems = [], isLoading } = useGetMenu();
  const { mutateAsync: placeOrder, isPending: isPlacing } = usePlaceOrder();

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const formatINR = (amount: number) =>
    `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getItemsByCategory = (categoryValue: string) =>
    menuItems.filter(
      (item) =>
        item.category.toLowerCase() === categoryValue.toLowerCase() &&
        item.available,
    );

  const getCartQuantity = (menuItemId: bigint) => {
    const item = cart.find((c) => c.menuItemId === menuItemId);
    return item?.quantity ?? 0;
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    try {
      const orderId = await placeOrder({
        tableNumber,
        items: cartAsOrderItems(),
      });
      toast.success("Order placed successfully!");
      setCartOpen(false);
      onOrderPlaced(orderId);
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Sub-header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onChangeTable}
            className="font-ui gap-1 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Change Table
          </Button>
          <div className="h-4 w-px bg-border" />
          <div>
            <span className="font-display font-semibold text-foreground text-lg">
              Table {tableNumber}
            </span>
          </div>
        </div>

        {/* Floating cart button */}
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetTrigger asChild>
            <Button
              data-ocid="cart.open_modal_button"
              className="relative font-ui"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {totalItems > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  variant="destructive"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            className="w-full sm:max-w-md flex flex-col"
            data-ocid="cart.modal"
          >
            <SheetHeader>
              <SheetTitle className="font-display text-xl">
                Your Order — Table {tableNumber}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto py-4">
              {cart.length === 0 ? (
                <div
                  data-ocid="cart.empty_state"
                  className="flex flex-col items-center justify-center h-40 text-center"
                >
                  <ShoppingCart className="w-12 h-12 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground font-ui">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-muted-foreground/70 font-ui mt-1">
                    Add items from the menu
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.menuItemId.toString()}
                      className="flex items-center gap-3 bg-accent/30 rounded-xl p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-ui font-medium text-sm text-foreground truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground font-ui">
                          {formatINR(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onUpdateQuantity(item.menuItemId, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-ui font-semibold w-5 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onUpdateQuantity(item.menuItemId, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => onRemoveItem(item.menuItemId)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center justify-between font-ui">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-lg text-foreground">
                    {formatINR(totalPrice)}
                  </span>
                </div>
                <Button
                  data-ocid="cart.submit_button"
                  className="w-full font-ui font-semibold"
                  size="lg"
                  disabled={isPlacing}
                  onClick={handlePlaceOrder}
                >
                  {isPlacing
                    ? "Placing Order..."
                    : `Place Order — ${formatINR(totalPrice)}`}
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Menu content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <Tabs defaultValue="Sabji">
          <TabsList className="flex flex-wrap gap-1 h-auto bg-accent/50 p-1 mb-6">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                data-ocid="menu.tab"
                className="font-ui font-medium"
              >
                {cat.emoji} {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((cat) => (
            <TabsContent key={cat.value} value={cat.value}>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
                    <Skeleton key={k} className="h-64 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {getItemsByCategory(cat.value).map((item, idx) => {
                      const qty = getCartQuantity(item.id);
                      return (
                        <motion.div
                          key={item.id.toString()}
                          data-ocid={`menu.item.${idx + 1}`}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="bg-card rounded-xl border border-border overflow-hidden
                            hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
                        >
                          {/* Image */}
                          <div className="relative h-44 bg-accent/30 overflow-hidden">
                            <img
                              src={
                                item.imageUrl ||
                                getCategoryFallback(item.category)
                              }
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  getCategoryFallback(item.category);
                              }}
                            />
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-display font-semibold text-foreground leading-tight">
                                {item.name}
                              </h3>
                              <span className="font-ui font-bold text-primary whitespace-nowrap">
                                {formatINR(item.price)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground font-ui line-clamp-2 mb-3">
                              {item.description}
                            </p>

                            {/* Add to cart control */}
                            {qty === 0 ? (
                              <Button
                                className="w-full font-ui"
                                size="sm"
                                onClick={() =>
                                  onAddToCart({
                                    menuItemId: item.id,
                                    name: item.name,
                                    price: item.price,
                                  })
                                }
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add to Cart
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => onUpdateQuantity(item.id, -1)}
                                >
                                  {qty === 1 ? (
                                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                  ) : (
                                    <Minus className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                                <span className="flex-1 text-center font-ui font-semibold">
                                  {qty} in cart
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => onUpdateQuantity(item.id, 1)}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {getItemsByCategory(cat.value).length === 0 && (
                    <div
                      data-ocid="menu.empty_state"
                      className="col-span-full flex flex-col items-center justify-center py-16 text-center"
                    >
                      <div className="text-5xl mb-3">🍽️</div>
                      <p className="font-ui text-muted-foreground">
                        No {cat.label.toLowerCase()} available right now
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

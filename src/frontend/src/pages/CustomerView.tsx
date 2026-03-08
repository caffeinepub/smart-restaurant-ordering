import { useState } from "react";
import BillView from "../components/restaurant/BillView";
import MenuView from "../components/restaurant/MenuView";
import OrderStatusView from "../components/restaurant/OrderStatusView";
import TableSelector from "../components/restaurant/TableSelector";
import type { OrderItem } from "../hooks/useQueries";

type CustomerScreen = "table-select" | "menu" | "order-status" | "bill";

export interface CartItem {
  menuItemId: bigint;
  name: string;
  price: number;
  quantity: number;
}

export default function CustomerView() {
  const [screen, setScreen] = useState<CustomerScreen>("table-select");
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [placedOrderId, setPlacedOrderId] = useState<bigint | null>(null);

  const handleTableSelect = (table: number) => {
    setTableNumber(table);
    setCart([]);
    setScreen("menu");
  };

  const handleAddToCart = (item: {
    menuItemId: bigint;
    name: string;
    price: number;
  }) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.menuItemId
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (menuItemId: bigint, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((c) =>
        c.menuItemId === menuItemId
          ? { ...c, quantity: Math.max(0, c.quantity + delta) }
          : c,
      );
      return updated.filter((c) => c.quantity > 0);
    });
  };

  const handleRemoveFromCart = (menuItemId: bigint) => {
    setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId));
  };

  const handleOrderPlaced = (orderId: bigint) => {
    setPlacedOrderId(orderId);
    setCart([]);
    setScreen("order-status");
  };

  const cartAsOrderItems = (): OrderItem[] =>
    cart.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: BigInt(item.quantity),
    }));

  return (
    <div className="flex-1">
      {screen === "table-select" && (
        <TableSelector onTableSelect={handleTableSelect} />
      )}
      {screen === "menu" && tableNumber !== null && (
        <MenuView
          tableNumber={tableNumber}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onOrderPlaced={handleOrderPlaced}
          onChangeTable={() => setScreen("table-select")}
          cartAsOrderItems={cartAsOrderItems}
        />
      )}
      {screen === "order-status" && tableNumber !== null && (
        <OrderStatusView
          tableNumber={tableNumber}
          orderId={placedOrderId}
          onViewBill={() => setScreen("bill")}
          onNewOrder={() => {
            setScreen("menu");
            setCart([]);
          }}
        />
      )}
      {screen === "bill" && tableNumber !== null && (
        <BillView
          tableNumber={tableNumber}
          onBack={() => setScreen("order-status")}
          onPaySuccess={() => {
            setTableNumber(null);
            setCart([]);
            setPlacedOrderId(null);
            setScreen("table-select");
          }}
        />
      )}
    </div>
  );
}

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MenuItem {
    id: bigint;
    name: string;
    description: string;
    available: boolean;
    imageUrl: string;
    category: string;
    price: number;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    tableNumber: bigint;
    placedAt: bigint;
    items: Array<OrderItem>;
    estimatedMinutes?: bigint;
}
export interface OrderItem {
    name: string;
    quantity: bigint;
    price: number;
    menuItemId: bigint;
}
export enum OrderStatus {
    pending = "pending",
    confirmed = "confirmed",
    ready = "ready"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearTableOrders(tableNumber: bigint): Promise<void>;
    confirmOrder(id: bigint, estimatedMinutes: bigint): Promise<void>;
    createMenuItem(name: string, description: string, price: number, category: string, imageUrl: string): Promise<bigint>;
    deleteMenuItem(id: bigint): Promise<void>;
    getActiveKitchenOrders(): Promise<Array<Order>>;
    getCallerUserRole(): Promise<UserRole>;
    getMenu(): Promise<Array<MenuItem>>;
    getMenuByCategory(category: string): Promise<Array<MenuItem>>;
    getOrderStatus(orderId: bigint): Promise<OrderStatus>;
    getTableBill(tableNumber: bigint): Promise<number>;
    getTableOrders(tableNumber: bigint): Promise<Array<Order>>;
    isCallerAdmin(): Promise<boolean>;
    markOrderReady(id: bigint): Promise<void>;
    payBill(tableNumber: bigint): Promise<void>;
    placeOrder(tableNumber: bigint, items: Array<OrderItem>): Promise<bigint>;
    toggleMenuItemAvailability(id: bigint): Promise<void>;
    updateMenuItem(id: bigint, name: string, description: string, price: number, category: string, imageUrl: string): Promise<void>;
}

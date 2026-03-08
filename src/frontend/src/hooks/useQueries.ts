import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MenuItem, Order, OrderItem, OrderStatus } from "../backend";
import { useActor } from "./useActor";

// ─── Menu Queries ───────────────────────────────────────────────────────────

export function useGetMenu() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menu"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenu();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetMenuByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menu", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
    staleTime: 30_000,
  });
}

// ─── Order Queries ───────────────────────────────────────────────────────────

export function useGetTableOrders(tableNumber: number | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["tableOrders", tableNumber],
    queryFn: async () => {
      if (!actor || tableNumber === null) return [];
      return actor.getTableOrders(BigInt(tableNumber));
    },
    enabled: !!actor && !isFetching && tableNumber !== null,
    refetchInterval: 5_000,
  });
}

export function useGetActiveKitchenOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["kitchenOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveKitchenOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5_000,
  });
}

export function useGetTableBill(tableNumber: number | null) {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["tableBill", tableNumber],
    queryFn: async () => {
      if (!actor || tableNumber === null) return 0;
      return actor.getTableBill(BigInt(tableNumber));
    },
    enabled: !!actor && !isFetching && tableNumber !== null,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tableNumber,
      items,
    }: {
      tableNumber: number;
      items: OrderItem[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(BigInt(tableNumber), items);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tableOrders", variables.tableNumber],
      });
    },
  });
}

export function useConfirmOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      estimatedMinutes,
    }: {
      id: bigint;
      estimatedMinutes: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.confirmOrder(id, BigInt(estimatedMinutes));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchenOrders"] });
    },
  });
}

export function useMarkOrderReady() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.markOrderReady(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchenOrders"] });
    },
  });
}

export function usePayBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tableNumber: number) => {
      if (!actor) throw new Error("Not connected");
      return actor.payBill(BigInt(tableNumber));
    },
    onSuccess: (_, tableNumber) => {
      queryClient.invalidateQueries({
        queryKey: ["tableOrders", tableNumber],
      });
      queryClient.invalidateQueries({
        queryKey: ["tableBill", tableNumber],
      });
    },
  });
}

export function useCreateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: {
      name: string;
      description: string;
      price: number;
      category: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createMenuItem(
        item.name,
        item.description,
        item.price,
        item.category,
        item.imageUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: {
      id: bigint;
      name: string;
      description: string;
      price: number;
      category: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateMenuItem(
        item.id,
        item.name,
        item.description,
        item.price,
        item.category,
        item.imageUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteMenuItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}

export function useToggleMenuItemAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.toggleMenuItemAvailability(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}

// ─── Re-exports ──────────────────────────────────────────────────────────────

export type { MenuItem, Order, OrderItem, OrderStatus };

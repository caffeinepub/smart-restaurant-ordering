import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";
import Layout from "../components/shared/Layout";
import AdminPanel from "../pages/AdminPanel";
import CustomerView from "../pages/CustomerView";
import KitchenDashboard from "../pages/KitchenDashboard";

const rootRoute = createRootRoute({
  component: () => {
    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  },
});

const customerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: CustomerView,
});

const tableRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/table",
  component: CustomerView,
});

const kitchenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kitchen",
  component: KitchenDashboard,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPanel,
});

export const routeTree = rootRoute.addChildren([
  customerRoute,
  tableRoute,
  kitchenRoute,
  adminRoute,
]);

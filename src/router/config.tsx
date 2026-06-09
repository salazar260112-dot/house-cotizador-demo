import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Login from "../pages/login/page";
import Dashboard from "../pages/dashboard/page";
import NewQuotation from "../pages/quotation/new/page";
import SupervisorDashboard from "../pages/supervisor/dashboard/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/cotizacion/nueva",
    element: <NewQuotation />,
  },
  {
    path: "/supervisor/dashboard",
    element: <SupervisorDashboard />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
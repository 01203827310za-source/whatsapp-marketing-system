import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./ui/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CustomersPage } from "./pages/CustomersPage";
import { CustomerDetailsPage } from "./pages/CustomerDetailsPage";
import { CampaignsPage } from "./pages/CampaignsPage";
import { CampaignWizardPage } from "./pages/CampaignWizardPage";
import { CampaignDetailsPage } from "./pages/CampaignDetailsPage";
import { ProductsPage } from "./pages/ProductsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { useAuthStore } from "./store/auth.store";

const Protected = ({ children }: { children: JSX.Element }) => {
  const token = useAuthStore((state) => state.accessToken);
  return token ? children : <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <Protected>
        <AppLayout />
      </Protected>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "customers/:id", element: <CustomerDetailsPage /> },
      { path: "campaigns", element: <CampaignsPage /> },
      { path: "campaigns/new", element: <CampaignWizardPage /> },
      { path: "campaigns/:id", element: <CampaignDetailsPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "settings", element: <SettingsPage /> }
    ]
  }
]);

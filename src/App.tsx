import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import DataEntry from "./pages/DataEntry";
import Schedule from "./pages/Schedule";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import AdminDashboard from "./pages/AdminDashboard";
import Performance from "./pages/Performance";
import MamasPerformance from "./pages/MamasPerformance";
import NotFound from "./pages/NotFound";
import WeeklyPlanCreator from "./pages/WeeklyPlanCreator";
import { AssignmentsManager } from "./pages/AssignmentsManager";
import { MarketerWeeklyPlanner } from "./pages/MarketerWeeklyPlanner";
import CombinedPlansViewer from "./pages/CombinedWeeklyPlanner";
import EmployeeManagement from "./pages/EmployeeManagement";
import MamasManagement from "./pages/MamasManagement";
import StoreManagement from "./pages/StoreManagement";
import PlanManagement from "./pages/PlanManagement";
import ItemManagement from "./pages/ItemManagement";
import CashFlow from "./pages/CashFlow";
import Customers from "./pages/CustomersManagement";
import CollectionSessionsManagement from "./pages/CollectionSessionsManagement";
import SiteEvaluationReports from "./pages/SiteEvaluationReports";
import CustomersManagement from "./pages/CustomersManagement";
import JanitorPayment from "./pages/JanitorPayment";
import PlanExecution from "./pages/PlanExecution";
import { SuppliersHistory } from "./pages/SuppliersHistory";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./components/contexts/AuthContext";
import RegularCollectionPlanner from "./pages/RegularCollectionPlanner";
import InStoreCollectionPlanner from "./pages/InStoreCollectionPlanner";
import ScheduleToday from "./pages/Scheduletoday";
import AndemammaProducts from "./pages/AndemammaProducts";
import MamaProductEntry from "./pages/MamaProductEntry";
import MamasPayment from "./pages/MamasPayment";
import { MarketerAssignedSuppliers } from "./pages/MarketerAssignedSuppliers";
import MarketerOrders from "./pages/MarketerOrders";
import { MarketerDashboard } from "./pages/MarketerDashboard";
import  CollectionCoordinatorDashboard  from "./pages/CollectionCoordinatorDashboard";
import SupplierCollectionStatus from "./pages/SupplierCollectionData";
import MarketerSupplierCollectionStatus from "./pages/MarketerSupplierCollectionStatus";
import ProductInnovations from "./pages/ProductInnovations";

const queryClient = new QueryClient();

// Create a custom fetch function that includes the auth token
const createAuthFetch = (token: string | null) => {
  return async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };
};

// Protected Route component with role-based access
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: { 
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Component that provides authFetch to all children
const AuthFetchProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  
  // You can use the createAuthFetch function in your components
  // For example: const authFetch = createAuthFetch(token);
  
  return <>{children}</>;
};

const AppContent = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Login />;
  }
  
  return (
    <AuthFetchProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar>
            <AppSidebar />
          </Sidebar>
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/Admin" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/data-entry" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', 'data_entry']}>
                  <DataEntry />
                </ProtectedRoute>
              } />
              <Route path="/schedule" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', "operation manager",'planner']}>
                  <Schedule />
                </ProtectedRoute>
              } />
              <Route path="/suppliers" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', 'procurement']}>
                  <Suppliers />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', 'analyst']}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/performance" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', 'HR']}>
                  <Performance />
                </ProtectedRoute>
              } />
              <Route path="/mamas-performance" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', 'HR']}>
                  <MamasPerformance />
                </ProtectedRoute>
              } />
              <Route path="/WeeklyPlanCreator" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', "operation manager", 'planner']}>
                  <WeeklyPlanCreator />
                </ProtectedRoute>
              } />
              <Route path="/AssignmentsManager" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', 'supervisor']}>
                  <AssignmentsManager />
                </ProtectedRoute>
              } />
              <Route path="/MarketerWeeklyPlanner" element={
                <ProtectedRoute allowedRoles={['Admin', "Marketer",'manager', 'marketer']}>
                  <MarketerWeeklyPlanner />
                </ProtectedRoute>
              } />
              <Route path="/weeklyPlanview" element={
                <ProtectedRoute allowedRoles={['Admin', "Marketer", 'manager', 'planner', 'marketer']}>
                  <CombinedPlansViewer />
                </ProtectedRoute>
              } />
              <Route path="/EmployeeManagement" element={
                <ProtectedRoute allowedRoles={['Admin', "Marketer",'HR']}>
                  <EmployeeManagement />
                </ProtectedRoute>
              } />
              <Route path="/MamasManagement" element={
                <ProtectedRoute allowedRoles={['Admin', 'HR']}>
                  <MamasManagement />
                </ProtectedRoute>
              } />
              <Route path="/StoreManagement" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', 'store_keeper']}>
                  <StoreManagement />
                </ProtectedRoute>
              } />
              {/* <Route path="/PlanManagement" element={
                <ProtectedRoute allowedRoles={['Admin', "operation manager",'manager', 'planner']}>
                  <PlanManagement />
                </ProtectedRoute>
              } /> */}
              <Route path="/ItemManagement" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', 'procurement']}>
                  <ItemManagement />
                </ProtectedRoute>
              } />
              <Route path="/cash-flow" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', 'finance']}>
                  <CashFlow />
                </ProtectedRoute>
              } />
              <Route path="/Customers" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', 'sales']}>
                  <Customers />
                </ProtectedRoute>
              } />
              <Route path="/ProductInnovations" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', 'sales']}>
                  <ProductInnovations />
                </ProtectedRoute>
              } />
              <Route path="/collection-sessions" element={
                <ProtectedRoute allowedRoles={['Admin',"Marketer", "operation manager",'manager', 'sales']}>
                  <CollectionSessionsManagement />
                </ProtectedRoute>
              } />
              <Route path="/MarketerDashboard" element={
                <ProtectedRoute allowedRoles={['Admin',"Marketer"]}>
                  <MarketerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/AndemammaProducts" element={
                <ProtectedRoute allowedRoles={['Admin',"Marketer", "operation manager",'manager', 'sales']}>
                  <AndemammaProducts />
                </ProtectedRoute>
              } />
              <Route path="/MamasPayment" element={
                <ProtectedRoute allowedRoles={['Admin',"Marketer", "operation manager",'manager', 'sales']}>
                  <MamasPayment />
                </ProtectedRoute>
              } />
              <Route path="/MamaProductEntry" element={
                <ProtectedRoute allowedRoles={['Admin',"Marketer", "operation manager",'manager', 'sales']}>
                  <MamaProductEntry />
                </ProtectedRoute>
              } />
              <Route path="/SiteEvaluationForm" element={
                <ProtectedRoute allowedRoles={['Admin', "operation manager", 'manager', 'evaluator']}>
                  <SiteEvaluationReports />
                </ProtectedRoute>
              } />
              <Route path="/CustomersManagement" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', 'sales']}>
                  <CustomersManagement />
                </ProtectedRoute>
              } />
              <Route path="/CollectionCoordinatorDashboard" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', "sales", "operation manager"]}>
                  <CollectionCoordinatorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/JanitorPayment" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager', 'finance']}>
                  <JanitorPayment />
                </ProtectedRoute>
              } />
              <Route path="/PlanExecution" element={
                <ProtectedRoute allowedRoles={['Admin', "regular coordination",'manager', "operation manager",'supervisor']}>
                  <PlanExecution />
                </ProtectedRoute>
              } />
              <Route path="/SuppliersHistory" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager',"Marketer", 'procurement']}>
                  <SuppliersHistory />
                </ProtectedRoute>
              } />
              <Route path="/RegularCollectionPlanner" element={
                <ProtectedRoute allowedRoles={['Admin', "regular coordination",'manager',"Marketer", 'procurement']}>
                  <RegularCollectionPlanner />
                </ProtectedRoute>
              } />
              <Route path="/SupplierCollectionStatus" element={
                <ProtectedRoute allowedRoles={['Admin', "operation manager","regular coordination",'manager',"Marketer", 'procurement']}>
                  <SupplierCollectionStatus />
                </ProtectedRoute>
              } />
              <Route path="/MarketerSupplierCollectionStatus" element={
                <ProtectedRoute allowedRoles={['Admin', "operation manager","regular coordination",'manager',"Marketer", 'procurement']}>
                  <MarketerSupplierCollectionStatus />
                </ProtectedRoute>
              } />
              <Route path="/InStoreCollectionPlanner" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager',"Marketer",  "operation manager",'procurement']}>
                  <InStoreCollectionPlanner />
                </ProtectedRoute>
              } />
              <Route path="/ScheduleToday" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager',"Marketer", 'procurement']}>
                  <ScheduleToday />
                </ProtectedRoute>
              } />
              <Route path="/MarketerAssignedSuppliers" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager',"Marketer", 'procurement']}>
                  <MarketerAssignedSuppliers />
                </ProtectedRoute>
              } />
              <Route path="/MarketerOrders" element={
                <ProtectedRoute allowedRoles={['Admin', 'manager',"Marketer", 'procurement']}>
                  <MarketerOrders />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Navigate to="/" replace />} />
              
              {/* Catch-all route for 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </SidebarProvider>
    </AuthFetchProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
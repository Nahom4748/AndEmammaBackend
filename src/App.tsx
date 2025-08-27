
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
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
import  SiteEvaluationReports  from "./pages/SiteEvaluationReports";
import CustomersManagement from "./pages/CustomersManagement";
import JanitorPayment from "./pages/JanitorPayment";
import PlanExecution from "./pages/PlanExecution";
import { SuppliersHistory } from "./pages/SuppliersHistory";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/data-entry" element={<DataEntry />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/mamas-performance" element={<MamasPerformance />} />
                <Route path="/WeeklyPlanCreator" element={<WeeklyPlanCreator />} />
                <Route path="/AssignmentsManager" element={<AssignmentsManager />} />
                <Route path="/MarketerWeeklyPlanner" element={<MarketerWeeklyPlanner />} />
                <Route path="/weeklyPlanview" element={<CombinedPlansViewer/>} />
                <Route path="/EmployeeManagement" element={<EmployeeManagement/>} />
                <Route path="/MamasManagement" element={<MamasManagement />} />
                <Route path="/StoreManagement" element={<StoreManagement />} />
                <Route path="/PlanManagement" element={<PlanManagement />} />
                <Route path="/ItemManagement" element={<ItemManagement />} />
                  <Route path="/cash-flow" element={<CashFlow />} />
                  <Route path="/Customers" element={<Customers />} />
   <Route path="/collection-sessions" element={<CollectionSessionsManagement />} />
   <Route path="/SiteEvaluationForm" element={<SiteEvaluationReports />} />
   <Route path="/CustomersManagement" element={<CustomersManagement />} />
   <Route path="/JanitorPayment" element={<JanitorPayment/>} />
   <Route path="/PlanExecution" element={<PlanExecution/>} />
   <Route path="/SuppliersHistory" element={<SuppliersHistory/>} />

                  
                {/* Catch-all route for 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

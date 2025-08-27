import { 
  LayoutDashboard, ShieldCheck, TrendingUp, FileBarChart, CalendarRange,
  UserPlus, ClipboardList, BriefcaseBusiness, Users2, ClipboardCheck, 
  Building2, Truck, CircleDollarSign, Package, BarChart3, 
  Store, ClipboardType, ReceiptText, Factory 
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

// Grouped menu structure with icons matching text
const groupedMenuItems = [
  {
    label: "General",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Performance", url: "/performance", icon: TrendingUp },
      { title: "Reports", url: "/reports", icon: BarChart3 },
      { title: "Cash Flow", url: "/cash-flow", icon: CircleDollarSign },
      { title: "Collection team Report", url: "/PlanExecution", icon: CircleDollarSign },
    ],
  },
  {
    label: "Admin",
    items: [
      { title: "Admin Dashboard", url: "/admin", icon: ShieldCheck },
      { title: "Employee Management", url: "/EmployeeManagement", icon: BriefcaseBusiness },
      { title: "Mamas Management", url: "/MamasManagement", icon: Users2 },
      { title: "Customers Management", url: "/CustomersManagement", icon: Users2 },
      { title: "Janitor Payment", url: "/JanitorPayment", icon: ReceiptText },
      { title: "Suppliers History", url: "/SuppliersHistory", icon: ReceiptText },
    ],
  },
  {
    label: "Marketer",
    items: [
      { title: "Assign Marketers", url: "/AssignmentsManager", icon: UserPlus },
      { title: "Marketer Weekly Planner", url: "/MarketerWeeklyPlanner", icon: CalendarRange },
    ],
  },
  {
    label: "Collection Coordinator Manager",
    items: [
      { title: "Collection Data Entry", url: "/data-entry", icon: ClipboardType },
      { title: "Weekly Collection Plan", url: "/WeeklyPlanCreator", icon: ClipboardList },
      { title: "Weekly Plans", url: "/weeklyPlanview", icon: ClipboardCheck },
      { title: "Plan Management", url: "/PlanManagement", icon: FileBarChart },
      { title: "Sessions for Instore", url: "/collection-sessions", icon: CircleDollarSign },
    ],
  },
  {
    label: "Store Management",
    items: [
      { title: "Suppliers Management", url: "/suppliers", icon: Factory },
      { title: "Customers Management", url: "/Customers", icon: Users2 },
      { title: "Store Management", url: "/StoreManagement", icon: Store },
      { title: "Item Management", url: "/ItemManagement", icon: Package },
      { title: "Site Evaluation Form", url: "/SiteEvaluationForm", icon: Building2 },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <Truck className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-lg font-bold">AndE Mamma</h2>
            <p className="text-sm text-muted-foreground">Paper Collection System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groupedMenuItems.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link 
                        to={item.url} 
                        className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 ${
                          location.pathname === item.url ? "bg-gray-200 font-semibold" : ""
                        }`}
                      >
                        <item.icon className="w-5 h-5 text-primary" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

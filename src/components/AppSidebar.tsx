// AppSidebar.tsx
import React from "react";
import { useAuth } from "@/components/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Home,
  BarChart3,
  Calendar,
  Users,
  Truck,
  FileText,
  Settings,
  ClipboardList,
  Target,
  Store,
  Package,
  CreditCard,
  UserCog,
  ClipboardCheck,
  History,
  LogOut,
  User,
  Building2,
  FolderKanban,
  ChartLine,
  Box,
  DollarSign,
  FileSpreadsheet,
  ClipboardPlus,
  ShoppingCart,
  UserCheck,
  CheckSquare,
  List,
  FileSearch,
  Archive,
  Lightbulb,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type MenuItem = {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  roles: string[];
};

type MenuGroup = {
  label: string;
  items: MenuItem[];
};

const groupedMenuItems: MenuGroup[] = [
  {
    label: "General",
    items: [
      { path: "/", label: "Dashboard", icon: Home, roles: ["Admin", "manager", "operation manager", "user"] },
      { path: "/reports", label: "Reports", icon: BarChart3, roles: ["Admin", "manager", "analyst"] },
      { path: "/performance", label: "Performance", icon: Target, roles: ["Admin", "manager", "HR"] },
      { path: "/AndemammaProducts", label: "Andemamma Products", icon: Box, roles: ["Admin", "manager", "HR"] },
      { path: "/MamaProductEntry", label: "Mama Product Entry", icon: ClipboardPlus, roles: ["Admin", "manager", "HR"] },
      { path: "/MamasPayment", label: "Mamas Payment", icon: DollarSign, roles: ["Admin", "manager", "HR"] },
      { path: "/MarketerDashboard", label: "Marketer Dashboard", icon: ChartLine, roles: ["Admin", "Marketer", "manager", "HR"] },
      { path: "/MarketerOrders", label: "Marketer Orders", icon: ClipboardList, roles: ["Admin", "Marketer", "manager", "HR"] },
      { path: "/PlanExecution", label: "View Plans", icon: Calendar, roles: ["Admin", "operation manager", "regular coordination", "manager", "HR"] },
    ],
  },
  {
    label: "Planning & Assignments",
    items: [
      { path: "/AssignmentsManager", label: "Assignments Manager", icon: ClipboardCheck, roles: ["Admin", "manager", "supervisor"] },
      { path: "/MarketerWeeklyPlanner", label: "Marketer Weekly Planner", icon: Calendar, roles: ["Admin", "Marketer", "manager"] },
      { path: "/weeklyPlanview", label: "View Weekly Plans", icon: CheckSquare, roles: ["Admin", "manager", "planner"] },
      { path: "/PlanExecution", label: "Collection Plan Report", icon: ChartLine, roles: ["Admin", "manager", "supervisor"] },
      { path: "/ProductInnovations", label: "Product Innovations", icon: Lightbulb, roles: ["Admin", "manager", "supervisor"] },
      { path: "/ScheduleToday", label: "Today’s Schedules", icon: List, roles: ["Admin", "manager", "procurement"] },
      { path: "/MarketerAssignedSuppliers", label: "View Assigned Suppliers", icon: UserCheck, roles: ["Admin", "Marketer", "manager", "procurement"] },
      { path: "/CollectionCoordinatorDashboard", label: "Collection Coordinator Dashboard", icon: Building2, roles: ["Admin", "operation manager", "manager", "procurement"] },
      { path: "/RegularCollectionPlanner", label: "Regular Collection Planner", icon: FolderKanban, roles: ["Admin", "regular coordination", "manager", "procurement"] },
      { path: "/SupplierCollectionStatus", label: "Supplier Collection Status", icon: FileSearch, roles: ["Admin", "regular coordination", "operation manager", "manager", "procurement"] },
      { path: "/MarketerSupplierCollectionStatus", label: "Marketer Supplier Collection", icon: ClipboardList, roles: ["Admin", "Marketer", "manager", "procurement"] },
    ],
  },
  {
    label: "Operations",
    items: [
      { path: "/suppliers", label: "Suppliers", icon: Truck, roles: ["Admin", "manager", "procurement"] },
      { path: "/SuppliersHistory", label: "Suppliers History", icon: History, roles: ["Admin", "manager", "procurement"] },
      { path: "/RegularCollectionPlanner", label: "Regular Collection Planner", icon: FolderKanban, roles: ["Admin", "manager", "procurement"] },
      { path: "/InStoreCollectionPlanner", label: "In-Store Collection Planner", icon: Store, roles: ["Admin", "manager", "operation manager", "procurement"] },
      { path: "/collection-sessions", label: "In-Store Collection Sessions", icon: ClipboardList, roles: ["Admin", "manager", "operation manager", "sales"] },
      { path: "/SiteEvaluationForm", label: "Site Evaluation", icon: FileSearch, roles: ["Admin", "manager", "evaluator"] },
    ],
  },
  {
    label: "HR & Employees",
    items: [
      { path: "/EmployeeManagement", label: "Employee Management", icon: UserCog, roles: ["Admin", "HR"] },
      { path: "/MamasManagement", label: "Mamas Management", icon: Users, roles: ["Admin", "HR"] },
    ],
  },
  {
    label: "Store & Inventory",
    items: [
      { path: "/StoreManagement", label: "Store Management", icon: Archive, roles: ["Admin", "manager", "store_keeper"] },
      { path: "/ItemManagement", label: "Outlet Items", icon: Package, roles: ["Admin", "manager", "procurement"] },
    ],
  },
  {
    label: "Finance & Customers",
    items: [
      { path: "/cash-flow", label: "Cash Flow", icon: CreditCard, roles: ["Admin", "manager", "finance"] },
      { path: "/JanitorPayment", label: "Janitor Payment", icon: DollarSign, roles: ["Admin", "manager", "finance"] },
      { path: "/Customers", label: "Customers", icon: ShoppingCart, roles: ["Admin", "manager", "sales"] },
    ],
  },
  {
    label: "Data Entry",
    items: [
      { path: "/data-entry", label: "Data Entry", icon: FileSpreadsheet, roles: ["Admin", "manager", "data_entry"] },
    ],
  },
];

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const first = user.first_name?.[0] ?? "";
    const last = user.last_name?.[0] ?? "";
    const initials = `${first}${last}`.toUpperCase();
    return initials || "U";
  };

  // helper to check if user has at least one role in item.roles
  const hasAccess = (roles: string[]) => {
    if (!user?.role) return false;
    // if your user.role is a single string e.g. "Admin", this checks equality.
    // if your user can have multiple roles as array, adapt accordingly.
    return roles.includes(user.role);
  };

  return (
    <Sidebar>
      <div className="flex flex-col h-full">
        <SidebarContent>
          {groupedMenuItems
            .filter((group) => group.items.some((item) => hasAccess(item.roles)))
            .map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items
                      .filter((item) => hasAccess(item.roles))
                      .map((item) => {
                        const Icon = item.icon;
                        return (
                          <SidebarMenuItem key={item.path}>
                            <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                              <Link to={item.path} className="flex items-center gap-3">
                                <Icon size={18} />
                                <span>{item.label}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
        </SidebarContent>

        {/* User profile & logout */}
        <div className="mt-auto p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-12 px-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 text-green-800">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {user?.first_name} {user?.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {user?.role?.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;

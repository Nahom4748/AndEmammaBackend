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

// ================= GROUPED MENU CONFIG =================
const groupedMenuItems = [
  {
    label: "General",
    items: [
      { path: "/", label: "Dashboard", icon: Home, roles: ["Admin", "manager", "operation manager","user"] },
      { path: "/reports", label: "Reports", icon: BarChart3, roles: ["Admin", "manager", "analyst"] },
      { path: "/performance", label: "Performance", icon: Target, roles: ["Admin", "manager", "HR"] },
      { path: "/AndemammaProducts", label: "Andemamma Products", icon: Target, roles: ["Admin", "manager", "HR"] },
      { path: "/MamaProductEntry", label: "MamaProduct Entry", icon: Target, roles: ["Admin", "manager", "HR"] },
      { path: "/MamasPayment", label: "Mamas Payment", icon: Target, roles: ["Admin", "manager", "HR"] },
    ],
  },
  {
    label: "Planning & Assignments",
    items: [
      { path: "/AssignmentsManager", label: "Assignments Manager", icon: ClipboardCheck, roles: ["Admin", "manager", "supervisor"] },
      { path: "/MarketerWeeklyPlanner", label: "Marketer Weekly Planner", icon: Calendar, roles: ["Admin", "Marketer","manager", "marketer"] },
      { path: "/weeklyPlanview", label: "View Weekly Plans", icon: ClipboardList, roles: ["Admin", "manager", "Marketer","planner", "marketer"] },
      { path: "/PlanExecution", label: "Collection Plan Report", icon: ChartLine, roles: ["Admin","Marketer", "manager", "supervisor"] },
      { path: "/ScheduleToday", label: "Today Schedules", icon: Calendar, roles: ["Admin", "Marketer","manager", "procurement"] },
    ],
  },
  {
    label: "Operations",
    items: [
      { path: "/suppliers", label: "Suppliers", icon: Truck, roles: ["Admin", "manager", "procurement"] },
      { path: "/SuppliersHistory", label: "Suppliers History", icon: History, roles: ["Admin", "Marketer","manager", "procurement"] },
      { path: "/RegularCollectionPlanner", label: "Regular Collection Planner", icon: FolderKanban, roles: ["Admin", "Marketer","manager", "procurement"] },
      { path: "/InStoreCollectionPlanner", label: "InStore Collection Planner", icon: Building2, roles: ["Admin", "Marketer","manager", "procurement"] },
      { path: "/collection-sessions", label: "Instore Collection Sessions", icon: ClipboardList, roles: ["Admin", "manager", "operation manager","sales"] },
      { path: "/SiteEvaluationForm", label: "Site Evaluation", icon: FileText, roles: ["Admin", "Marketer","manager", "evaluator"] },
    ],
  },
  {
    label: "HR & Employees",
    items: [
      { path: "/EmployeeManagement", label: "Employee Management", icon: UserCog, roles: ["Admin","Marketer", "HR"] },
      { path: "/MamasManagement", label: "Mamas Management", icon: Users, roles: ["Admin", "HR"] },
    ],
  },
  {
    label: "Store & Inventory",
    items: [
      { path: "/StoreManagement", label: "Store Management", icon: Store, roles: ["Admin", "manager", "store_keeper"] },
      { path: "/ItemManagement", label: "Outlet Items", icon: Package, roles: ["Admin", "manager", "procurement"] },
    ],
  },
  {
    label: "Finance & Customers",
    items: [
      { path: "/cash-flow", label: "Cash Flow", icon: CreditCard, roles: ["Admin", "manager", "finance"] },
      { path: "/JanitorPayment", label: "Janitor Payment", icon: CreditCard, roles: ["Admin", "manager", "finance"] },
      { path: "/Customers", label: "Customers", icon: Users, roles: ["Admin", "manager", "sales"] },
    ],
  },
  {
    label: "Data Entry",
    items: [
      { path: "/data-entry", label: "Data Entry", icon: ClipboardList, roles: ["manager", "Admin","data_entry"] },
    ],
  }
];

export function AppSidebar() {
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
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || "U";
  };

  return (
    <Sidebar>
      <div className="flex flex-col h-full">
        <SidebarContent>
          {groupedMenuItems.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items
                    .filter(item => item.roles.includes(user?.role || ""))
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton
                            asChild
                            isActive={location.pathname === item.path}
                          >
                            <Link to={item.path}>
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
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
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
}

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CheckCircle, Clock, Package, AlertTriangle, ChevronDown, ChevronUp, MapPin, User, Truck, Calendar, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/components/contexts/AuthContext";
import { Input } from "@/components/ui/input";

interface Plan {
  id: number;
  plan_date: string;
  day: string;
  status: "pending" | "completed" | "rejected";
  note: string;
  collection_type_id: number;
  collection_type_name: string;
  supplier_id: number;
  supplier_name: string;
  coordinator_id: number | null;
  coordinator_name: string | null;
  driver_id: number | null;
  driver_name: string | null;
  total_collection_kg?: string;
  rejection_reason?: string;
  region_name?: string;
  sector_name?: string;
  marketer_name?: string | null;
  not_completed_date?: string | null;
  updatedAt?: string | null;
  created_at: string;
}

export default function PlanExecution() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [weight, setWeight] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReportDialog, setIsReportDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);
  const [sensitiveInfoVisible, setSensitiveInfoVisible] = useState<{[key: number]: boolean}>({});
  const { user } = useAuth();

  // Fetch plans from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
        
        const startDate = startOfWeek.toISOString().split('T')[0];
        const endDate = endOfWeek.toISOString().split('T')[0];
        
        const plansResponse = await axios.get(
          `http://localhost:5000/api/getweeklyplan?start_date=${startDate}&end_date=${endDate}`
        );
        
        if (plansResponse.data.status === "success") {
          setPlans(plansResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load plans");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter plans based on user role
  const filteredPlans = useMemo(() => {
    let filtered = plans;
    
    if (user?.role === "regular coordination") {
      filtered = filtered.filter(plan => plan.collection_type_name === "Regular");
    } else if (user?.role === "operation manager") {
      filtered = filtered.filter(plan => plan.collection_type_name === "Instore");
    }
    
    return filtered;
  }, [plans, user]);

  // Categorize plans
  const inProgressPlans = useMemo(() => filteredPlans.filter(p => p.status === "pending"), [filteredPlans]);
  const completedPlans = useMemo(() => filteredPlans.filter(p => p.status === "completed"), [filteredPlans]);
  const rejectedPlans = useMemo(() => filteredPlans.filter(p => p.status === "rejected"), [filteredPlans]);

  const handleOpenDialog = (plan: Plan, type: "complete" | "report") => {
    setSelectedPlan(plan);
    setWeight(0);
    setNotes("");
    setRejectionReason("");
    type === "complete" ? setIsDialogOpen(true) : setIsReportDialog(true);
  };

  const submitCompletion = async () => {
    if (!selectedPlan || weight <= 0) {
      toast.error("Please enter valid weight");
      return;
    }

    try {
      const planData = {
        id: selectedPlan.id,
        status: "completed",
        updatedAt: new Date().toISOString(),
        total_collection_kg: weight.toFixed(2),
        rejection_reason: null,
        notes: notes
      };

      const response = await axios.post("http://localhost:5000/api/weekly-plan/status", { 
        plans: [planData] 
      });

      if (response.data.status === "success") {
        toast.success("Plan completed successfully!");
        setPlans(prev => prev.map(p => 
          p.id === selectedPlan.id 
            ? { 
                ...p, 
                status: "completed", 
                total_collection_kg: weight.toFixed(2), 
                updatedAt: new Date().toISOString(),
                note: notes || p.note // Update note if provided
              }
            : p
        ));
        setIsDialogOpen(false);
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error("Error completing plan:", error);
      toast.error("Failed to complete plan");
    }
  };

  const submitRejection = async () => {
    if (!selectedPlan || !rejectionReason.trim()) {
      toast.error("Please provide rejection reason");
      return;
    }

    try {
      const planData = {
        id: selectedPlan.id,
        status: "rejected",
        updatedAt: new Date().toISOString(),
        rejection_reason: rejectionReason,
        notes: notes,
        total_collection_kg: "0.00"
      };

      const response = await axios.post("http://localhost:5000/api/weekly-plan/status", { 
        plans: [planData] 
      });

      if (response.data.status === "success") {
        toast.success("Issue reported successfully!");
        setPlans(prev => prev.map(p => 
          p.id === selectedPlan.id 
            ? { 
                ...p, 
                status: "rejected", 
                rejection_reason: rejectionReason, 
                updatedAt: new Date().toISOString(),
                note: notes || p.note // Update note if provided
              }
            : p
        ));
        setIsReportDialog(false);
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error("Error rejecting plan:", error);
      toast.error("Failed to report issue");
    }
  };

  const toggleExpandPlan = (planId: number) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const toggleSensitiveInfo = (planId: number) => {
    setSensitiveInfoVisible(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": 
        return <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1">Completed</Badge>;
      case "rejected": 
        return <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1">Rejected</Badge>;
      default: 
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1">In Progress</Badge>;
    }
  };

  const getCollectionTypeBadge = (type: string) => {
    return type === "Instore" 
      ? <Badge className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-1">Instore</Badge>
      : <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1">Regular</Badge>;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Check if user has permission to view sensitive information
  const canViewSensitiveInfo = user?.role === "operation manager" || user?.role === "admin";

  // Modern Plan Card Component for Mobile
  const PlanCard = ({ plan }: { plan: Plan }) => {
    const showSensitiveInfo = sensitiveInfoVisible[plan.id] || canViewSensitiveInfo;
    
    return (
      <Card className="mb-4 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl transition-all duration-300">
        <CardContent className="p-4">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge(plan.status)}
              {getCollectionTypeBadge(plan.collection_type_name)}
              {!canViewSensitiveInfo && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Protected
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-gray-100 hover:bg-gray-200"
              onClick={() => toggleExpandPlan(plan.id)}
            >
              {expandedPlan === plan.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>

          {/* Main Content */}
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">{plan.supplier_name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{plan.day} • {formatDate(plan.plan_date)}</span>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedPlan === plan.id && (
              <div className="space-y-3 pt-3 border-t border-gray-200">
                {/* Location Info */}
                {(plan.region_name || plan.sector_name) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="text-sm">
                      {plan.region_name && <p className="text-gray-700"><span className="font-medium">Region:</span> {plan.region_name}</p>}
                      {plan.sector_name && <p className="text-gray-700"><span className="font-medium">Sector:</span> {plan.sector_name}</p>}
                    </div>
                  </div>
                )}

                {/* Personnel Info */}
                <div className="grid grid-cols-1 gap-2">
                  {plan.coordinator_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        <span className="font-medium">Coordinator:</span> {plan.coordinator_name}
                      </span>
                    </div>
                  )}
                  {plan.driver_name && (
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        <span className="font-medium">Driver:</span> {plan.driver_name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Note Section - Always show if exists */}
                {plan.note && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-800">Plan Note</span>
                      {!canViewSensitiveInfo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleSensitiveInfo(plan.id)}
                        >
                          {showSensitiveInfo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-blue-800">
                      {showSensitiveInfo ? plan.note : "••••••••••••••••"}
                    </p>
                  </div>
                )}

                {/* Status Specific Info */}
                {plan.status === "completed" && plan.total_collection_kg && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-green-800 font-medium">
                      ✅ Weight Collected: {plan.total_collection_kg} kg
                    </p>
                    {plan.updatedAt && (
                      <p className="text-xs text-green-600 mt-1">
                        Completed on: {formatDate(plan.updatedAt)}
                      </p>
                    )}
                  </div>
                )}

                {plan.status === "rejected" && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-red-800">Rejection Details</span>
                      {!canViewSensitiveInfo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleSensitiveInfo(plan.id)}
                        >
                          {showSensitiveInfo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                    {plan.rejection_reason && (
                      <p className="text-sm text-red-800">
                        <span className="font-medium">Reason:</span> {showSensitiveInfo ? plan.rejection_reason : "••••••••••••••••"}
                      </p>
                    )}
                    {plan.updatedAt && (
                      <p className="text-xs text-red-600 mt-1">
                        Reported on: {formatDate(plan.updatedAt)}
                      </p>
                    )}
                  </div>
                )}

                {/* Creation Info */}
                <div className="text-xs text-gray-500 border-t pt-2">
                  Created: {formatDate(plan.created_at)}
                </div>
              </div>
            )}

            {/* Action Buttons for Pending Plans */}
            {plan.status === "pending" && (
              <div className="flex gap-2 pt-3">
                <Button 
                  onClick={() => handleOpenDialog(plan, "complete")}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 shadow-md hover:shadow-lg transition-all"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleOpenDialog(plan, "report")}
                  className="text-red-600 border-red-300 hover:bg-red-50 flex-1 shadow-md hover:shadow-lg transition-all"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Desktop Table View
  const PlanTable = ({ plans, showActions = false }: { plans: Plan[], showActions?: boolean }) => (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-700">Supplier & Details</th>
              <th className="text-left p-4 font-semibold text-gray-700 hidden lg:table-cell">Type</th>
              <th className="text-left p-4 font-semibold text-gray-700 hidden md:table-cell">Date</th>
              <th className="text-left p-4 font-semibold text-gray-700">Status</th>
              {showActions && <th className="text-left p-4 font-semibold text-gray-700">Actions</th>}
              {!showActions && <th className="text-left p-4 font-semibold text-gray-700">Details</th>}
            </tr>
          </thead>
          <tbody>
            {plans.map((plan, index) => {
              const showSensitiveInfo = sensitiveInfoVisible[plan.id] || canViewSensitiveInfo;
              
              return (
                <tr key={plan.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50 hover:bg-gray-100 transition-colors"}>
                  <td className="p-4">
                    <div>
                      <div className="font-semibold text-gray-900">{plan.supplier_name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {plan.region_name && <span>{plan.region_name} • </span>}
                        {plan.sector_name && <span>{plan.sector_name}</span>}
                      </div>
                      {plan.note && (
                        <div className="text-xs text-blue-600 mt-1">
                          📝 Note: {showSensitiveInfo ? plan.note : "••••••••••••••••"}
                          {!canViewSensitiveInfo && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={() => toggleSensitiveInfo(plan.id)}
                            >
                              {showSensitiveInfo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1 lg:hidden">
                        {plan.collection_type_name} • {formatDate(plan.plan_date)}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    {getCollectionTypeBadge(plan.collection_type_name)}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="text-sm text-gray-600">
                      {formatDate(plan.plan_date)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(plan.status)}
                      {plan.status === "completed" && plan.total_collection_kg && (
                        <span className="text-xs text-green-600 font-medium">
                          ✅ {plan.total_collection_kg} kg
                        </span>
                      )}
                      {plan.status === "rejected" && plan.rejection_reason && (
                        <div className="text-xs text-red-600">
                          ❌ {showSensitiveInfo ? plan.rejection_reason : "••••••••••••••••"}
                          {!canViewSensitiveInfo && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={() => toggleSensitiveInfo(plan.id)}
                            >
                              {showSensitiveInfo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  {showActions ? (
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleOpenDialog(plan, "complete")}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenDialog(plan, "report")}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  ) : (
                    <td className="p-4">
                      <div className="text-xs text-gray-500">
                        Updated: {plan.updatedAt ? formatDate(plan.updatedAt) : "Never"}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {plans.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No plans found</p>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Modern Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <SidebarTrigger className="mr-4" />
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Plan Execution</h1>
              <p className="text-sm text-gray-600 hidden sm:block">
                {user?.role === "regular coordination" ? "Regular Collection Plans" : 
                 user?.role === "operation manager" ? "Instore Collection Plans" : 
                 "All Collection Plans"}
                 {!canViewSensitiveInfo && " • Sensitive information protected"}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {!canViewSensitiveInfo && (
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Protected View
              </Badge>
            )}
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
              {user?.role || "User"}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Main Dashboard Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl lg:text-3xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Collection Plan Dashboard
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Manage and track your weekly collection plans
              {!canViewSensitiveInfo && (
                <span className="block text-sm text-amber-600 mt-1">
                  ⚠️ Sensitive information is protected. Click the eye icon to reveal details.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 lg:space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 lg:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm lg:text-base opacity-90">Pending Plans</p>
                    <p className="text-2xl lg:text-3xl font-bold">{inProgressPlans.length}</p>
                  </div>
                  <Clock className="h-8 w-8 lg:h-10 lg:w-10 opacity-90" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 lg:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm lg:text-base opacity-90">Completed</p>
                    <p className="text-2xl lg:text-3xl font-bold">{completedPlans.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 lg:h-10 lg:w-10 opacity-90" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 lg:p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm lg:text-base opacity-90">Rejected</p>
                    <p className="text-2xl lg:text-3xl font-bold">{rejectedPlans.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 lg:h-10 lg:w-10 opacity-90" />
                </div>
              </div>
            </div>

            {/* Plans Section - Mobile Cards */}
            <div className="block lg:hidden">
              <Tabs defaultValue="in-progress" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-12 bg-gray-100 rounded-xl p-1">
                  <TabsTrigger value="in-progress" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                    <Clock className="h-4 w-4" />
                    <span>Pending</span>
                    <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700">
                      {inProgressPlans.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span>Done</span>
                    <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">
                      {completedPlans.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Issues</span>
                    <Badge variant="secondary" className="ml-1 bg-red-100 text-red-700">
                      {rejectedPlans.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="in-progress" className="mt-6">
                  <div className="space-y-4">
                    {inProgressPlans.map(plan => (
                      <PlanCard key={plan.id} plan={plan} />
                    ))}
                    {inProgressPlans.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg">No pending plans</p>
                        <p className="text-sm">All plans are completed or reported</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                  <div className="space-y-4">
                    {completedPlans.map(plan => (
                      <PlanCard key={plan.id} plan={plan} />
                    ))}
                    {completedPlans.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg">No completed plans</p>
                        <p className="text-sm">Completed plans will appear here</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="rejected" className="mt-6">
                  <div className="space-y-4">
                    {rejectedPlans.map(plan => (
                      <PlanCard key={plan.id} plan={plan} />
                    ))}
                    {rejectedPlans.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg">No rejected plans</p>
                        <p className="text-sm">Rejected plans will appear here</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Plans Section - Desktop Table */}
            <div className="hidden lg:block">
              <Tabs defaultValue="in-progress" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-14 bg-gray-100 rounded-2xl p-1 mb-6">
                  <TabsTrigger value="in-progress" className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl text-base font-medium">
                    <Clock className="h-5 w-5" />
                    Pending Plans
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-sm">
                      {inProgressPlans.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl text-base font-medium">
                    <CheckCircle className="h-5 w-5" />
                    Completed
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-sm">
                      {completedPlans.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-xl text-base font-medium">
                    <AlertTriangle className="h-5 w-5" />
                    Rejected
                    <Badge variant="secondary" className="bg-red-100 text-red-700 text-sm">
                      {rejectedPlans.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="in-progress" className="mt-2">
                  <PlanTable plans={inProgressPlans} showActions={true} />
                </TabsContent>

                <TabsContent value="completed" className="mt-2">
                  <PlanTable plans={completedPlans} />
                </TabsContent>

                <TabsContent value="rejected" className="mt-2">
                  <PlanTable plans={rejectedPlans} />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Modern Completion Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Complete Collection Plan
              </DialogTitle>
              <DialogDescription>
                Record collection details for <span className="font-semibold">{selectedPlan?.supplier_name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-blue-700 font-medium">Supplier</Label>
                    <p className="text-blue-900">{selectedPlan?.supplier_name}</p>
                  </div>
                  <div>
                    <Label className="text-blue-700 font-medium">Date</Label>
                    <p className="text-blue-900">{selectedPlan ? formatDate(selectedPlan.plan_date) : ""}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Weight Collected (kg) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  placeholder="Enter weight in kilograms"
                  className="mt-2 h-12 text-lg"
                />
              </div>

              <div>
                <Label className="text-base font-medium">Additional Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information about the collection..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={submitCompletion}
                  className="bg-green-600 hover:bg-green-700 px-6"
                  disabled={weight <= 0}
                >
                  Complete Plan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modern Report Dialog */}
        <Dialog open={isReportDialog} onOpenChange={setIsReportDialog}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Report Collection Issue
              </DialogTitle>
              <DialogDescription>
                Report issues for <span className="font-semibold">{selectedPlan?.supplier_name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-red-700 font-medium">Supplier</Label>
                    <p className="text-red-900">{selectedPlan?.supplier_name}</p>
                  </div>
                  <div>
                    <Label className="text-red-700 font-medium">Date</Label>
                    <p className="text-red-900">{selectedPlan ? formatDate(selectedPlan.plan_date) : ""}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Issue Reason *</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this plan cannot be completed..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-medium">Additional Details</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information..."
                  rows={2}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsReportDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={submitRejection}
                  disabled={!rejectionReason.trim()}
                  className="bg-red-600 hover:bg-red-700 px-6"
                >
                  Report Issue
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
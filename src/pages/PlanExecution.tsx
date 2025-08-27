import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Calendar, CheckCircle, Clock, Package, FileText, X, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

// Rejected plans storage
const REJECTED_PLANS_KEY = "rejectedPlans";

interface RejectedPlan {
  id: string;
  planId: string;
  supplierName: string;
  rejectedAt: string;
  rejectionReason: string;
  notes?: string;
}

interface Plan {
  id: number;
  date: string;
  day: string;
  status: "pending" | "completed" | "rejected";
  totalWeight: string | null;
  rejectionReason: string | null;
  updatedAt: string | null;
  supplier: string;
  collectionType: string;
  coordinator: string | null;
  marketer: string | null;
  driver: string | null;
  note: string;
}

interface CompletedPlan {
  id: string;
  planId: number;
  supplierName: string;
  completedAt: string;
  totalWeight: number;
  notes: string;
}

function loadRejectedPlans(): RejectedPlan[] {
  try {
    return JSON.parse(localStorage.getItem(REJECTED_PLANS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRejectedPlan(plan: RejectedPlan) {
  const plans = loadRejectedPlans();
  plans.push(plan);
  localStorage.setItem(REJECTED_PLANS_KEY, JSON.stringify(plans));
}

export default function PlanExecution() {
  const [query, setQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [weight, setWeight] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReportDialog, setIsReportDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedPlans, setCompletedPlans] = useState<CompletedPlan[]>([]);

  // Fetch plans from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Calculate date range for current week
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
        
        const startDate = startOfWeek.toISOString().split('T')[0];
        const endDate = endOfWeek.toISOString().split('T')[0];
        
        // Fetch weekly plans
        const plansResponse = await axios.get(
          `http://localhost:5000/api/weekly-plan?start_date=${startDate}&end_date=${endDate}`
        );
        
        if (plansResponse.data.status === "success") {
          setPlans(plansResponse.data.data);
        }
        
        // Load completed plans from localStorage (or fetch from backend if available)
        const savedCompletedPlans = localStorage.getItem("completedPlans");
        if (savedCompletedPlans) {
          setCompletedPlans(JSON.parse(savedCompletedPlans));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const rejectedPlans = loadRejectedPlans();

  // Categorize plans based on status
  const inProgressPlans = useMemo(() => {
    return plans.filter(p => p.status === "pending");
  }, [plans]);

  const completedPlansList = useMemo(() => {
    return plans.filter(p => p.status === "completed");
  }, [plans]);

  const rejectedPlansList = useMemo(() => {
    return plans.filter(p => p.status === "rejected");
  }, [plans]);

  const handleOpenDialog = (plan: Plan, type: "complete" | "report") => {
    setSelectedPlan(plan);
    setWeight(0);
    setNotes("");
    setRejectionReason("");
    if (type === "complete") {
      setIsDialogOpen(true);
      setIsReportDialog(false);
    } else {
      setIsReportDialog(true);
      setIsDialogOpen(false);
    }
  };

  const submitCompletion = async () => {
    if (!selectedPlan) {
      toast.error("No plan selected");
      return;
    }

    if (weight <= 0) {
      toast.error("Please enter a valid weight");
      return;
    }

    try {
      // Prepare the plan data to send to backend
      const planData = {
        id: selectedPlan.id,
        date: selectedPlan.date,
        day: selectedPlan.day,
        supplier: selectedPlan.supplier,
        collectionType: selectedPlan.collectionType,
        coordinator: selectedPlan.coordinator,
        marketer: selectedPlan.marketer,
        driver: selectedPlan.driver,
        note: selectedPlan.note,
        status: "completed",
        updatedAt: new Date().toISOString(),
        totalWeight: weight.toFixed(2),
        notes: notes
      };

      // Send to backend using axios
      const response = await axios.post("http://localhost:5000/api/weekly-plan/status", { 
        plans: [planData] 
      });

      if (response.data.status === "success") {
        const completedPlan: CompletedPlan = {
          id: crypto.randomUUID(),
          planId: selectedPlan.id,
          supplierName: selectedPlan.supplier,
          completedAt: new Date().toISOString(),
          totalWeight: weight,
          notes
        };
        
        // Update local state
        const updatedCompletedPlans = [...completedPlans, completedPlan];
        setCompletedPlans(updatedCompletedPlans);
        localStorage.setItem("completedPlans", JSON.stringify(updatedCompletedPlans));
        
        toast.success("Plan completed successfully!");

        // Update the plan status in local state by refetching data
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
        
        const startDate = startOfWeek.toISOString().split('T')[0];
        const endDate = endOfWeek.toISOString().split('T')[0];
        
        const plansResponse = await axios.get(
          `http://localhost:5000/api/weekly-plan?start_date=${startDate}&end_date=${endDate}`
        );
        
        if (plansResponse.data.status === "success") {
          setPlans(plansResponse.data.data);
        }

        setIsDialogOpen(false);
        setSelectedPlan(null);
      } else {
        throw new Error(response.data.message || "Failed to update plan");
      }
    } catch (error) {
      console.error("Error updating plan status:", error);
      toast.error("Failed to update plan status");
    }
  };

  const submitRejection = async () => {
    if (!selectedPlan) {
      toast.error("No plan selected");
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      // Prepare the plan data to send to backend
      const planData = {
        id: selectedPlan.id,
        date: selectedPlan.date,
        day: selectedPlan.day,
        supplier: selectedPlan.supplier,
        collectionType: selectedPlan.collectionType,
        coordinator: selectedPlan.coordinator,
        marketer: selectedPlan.marketer,
        driver: selectedPlan.driver,
        note: selectedPlan.note,
        status: "rejected",
        updatedAt: new Date().toISOString(),
        rejectionReason: rejectionReason,
        notes: notes,
        totalWeight: "0.00"
      };

      // Send to backend using axios
      const response = await axios.post("http://localhost:5000/api/weekly-plan/status", { 
        plans: [planData] 
      });

      if (response.data.status === "success") {
        const rejectedPlan: RejectedPlan = {
          id: crypto.randomUUID(),
          planId: selectedPlan.id.toString(),
          supplierName: selectedPlan.supplier,
          rejectedAt: new Date().toISOString(),
          rejectionReason,
          notes
        };
        saveRejectedPlan(rejectedPlan);
        toast.success("Plan rejection reported successfully!");

        // Update the plan status in local state by refetching data
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
        
        const startDate = startOfWeek.toISOString().split('T')[0];
        const endDate = endOfWeek.toISOString().split('T')[0];
        
        const plansResponse = await axios.get(
          `http://localhost:5000/api/weekly-plan?start_date=${startDate}&end_date=${endDate}`
        );
        
        if (plansResponse.data.status === "success") {
          setPlans(plansResponse.data.data);
        }

        setIsReportDialog(false);
        setSelectedPlan(null);
      } else {
        throw new Error(response.data.message || "Failed to update plan");
      }
    } catch (error) {
      console.error("Error updating plan status:", error);
      toast.error("Failed to update plan status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>;
      case "rejected":
        return <Badge className="bg-red-600 hover:bg-red-700">Rejected</Badge>;
      default:
        return <Badge className="bg-blue-600 hover:bg-blue-700">In Progress</Badge>;
    }
  };

  const getCollectionTypeBadge = (type: string) => {
    return type === "Instore" 
      ? <Badge className="bg-purple-600 hover:bg-purple-700">Instore</Badge>
      : <Badge className="bg-orange-600 hover:bg-orange-700">Regular</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 animate-pulse text-blue-600" />
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="container flex h-16 items-center px-4">
          <SidebarTrigger className="mr-4" />
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Plan Execution</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Manage and track collection plans</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Plan Management Dashboard</CardTitle>
            <CardDescription className="text-gray-600">
              Track and complete collection plans with detailed reporting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Input
                placeholder="🔍 Search by supplier name or date..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-4 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-blue-700 text-lg">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <span className="text-3xl font-bold text-blue-800">{inProgressPlans.length}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-700 text-lg">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <span className="text-3xl font-bold text-green-800">{completedPlansList.length}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-700 text-lg">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <span className="text-3xl font-bold text-red-800">{rejectedPlansList.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="in-progress" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-12 p-1 bg-gray-100 rounded-lg">
                <TabsTrigger 
                  value="in-progress" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm"
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">In Progress</span>
                  <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700">
                    {inProgressPlans.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="completed"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Completed</span>
                  <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">
                    {completedPlansList.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="rejected"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">Rejected</span>
                  <Badge variant="secondary" className="ml-1 bg-red-100 text-red-700">
                    {rejectedPlansList.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="in-progress" className="mt-6">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                  <Table>
                     <TableHeader className="bg-gray-50">
                       <TableRow className="border-b border-gray-200">
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Type</TableHead>
                        <TableHead className="font-semibold text-gray-700">Supplier</TableHead>
                        <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inProgressPlans.map((plan, index) => (
                        <TableRow key={plan.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <TableCell>
                            {getStatusBadge(plan.status)}
                          </TableCell>
                          <TableCell>
                            {getCollectionTypeBadge(plan.collectionType)}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">{plan.supplier}</TableCell>
                          <TableCell className="text-gray-600 hidden md:table-cell">{new Date(plan.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleOpenDialog(plan, "complete")}
                                className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Complete</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleOpenDialog(plan, "report")}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Report</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {inProgressPlans.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <div className="flex flex-col items-center space-y-3">
                              <Clock className="h-12 w-12 text-gray-300" />
                              <p className="text-gray-500 font-medium">No plans in progress</p>
                              <p className="text-sm text-gray-400">All plans have been completed or reported</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                  <Table>
                     <TableHeader className="bg-gray-50">
                       <TableRow className="border-b border-gray-200">
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Type</TableHead>
                        <TableHead className="font-semibold text-gray-700">Supplier</TableHead>
                        <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">Total Weight</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedPlansList.map((plan, index) => (
                        <TableRow key={plan.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <TableCell>
                            {getStatusBadge(plan.status)}
                          </TableCell>
                          <TableCell>
                            {getCollectionTypeBadge(plan.collectionType)}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">{plan.supplier}</TableCell>
                          <TableCell className="text-gray-600 hidden md:table-cell">{new Date(plan.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-gray-800 font-medium">
                            {plan.totalKg ? `${plan.totalKg} kg` : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                      {completedPlansList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <div className="flex flex-col items-center space-y-3">
                              <CheckCircle className="h-12 w-12 text-gray-300" />
                              <p className="text-gray-500 font-medium">No completed plans</p>
                              <p className="text-sm text-gray-400">Completed plans will appear here</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="rejected" className="mt-6">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow className="border-b border-gray-200">
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Supplier</TableHead>
                        <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectedPlansList.map((plan, index) => (
                        <TableRow key={plan.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <TableCell>
                            {getStatusBadge(plan.status)}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">{plan.supplier}</TableCell>
                          <TableCell className="text-gray-600 hidden md:table-cell">{new Date(plan.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="text-sm text-red-700 bg-red-50 p-2 rounded-md border border-red-200">
                                {plan.rejectionReason || "No reason provided"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {rejectedPlansList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12">
                            <div className="flex flex-col items-center space-y-3">
                              <AlertTriangle className="h-12 w-12 text-gray-300" />
                              <p className="text-gray-500 font-medium">No rejected plans</p>
                              <p className="text-sm text-gray-400">Rejected plans will appear here</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Completion Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Complete Plan
              </DialogTitle>
              <DialogDescription>
                Record collection details for {selectedPlan?.supplier}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Supplier</Label>
                  <p className="text-sm">{selectedPlan?.supplier}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm">{selectedPlan ? new Date(selectedPlan.date).toLocaleDateString() : ""}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Collection Type</Label>
                  {selectedPlan && getCollectionTypeBadge(selectedPlan.collectionType)}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Weight Collection (kg)</Label>
                <div className="p-3 border rounded-lg">
                  <div className="flex flex-col gap-3">
                    <div>
                      <Label className="text-sm">Weight (kg)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="text-right">
                      <Label className="text-sm mb-2">Total Weight</Label>
                      <p className="text-sm font-medium p-2 bg-muted rounded">
                        {weight.toFixed(2)} kg
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about the collection..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={submitCompletion}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={weight <= 0}
                >
                  Complete Plan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Dialog */}
        <Dialog open={isReportDialog} onOpenChange={setIsReportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                Report Plan Issue
              </DialogTitle>
              <DialogDescription>
                Report issues for {selectedPlan?.supplier}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Supplier</Label>
                  <p className="text-sm">{selectedPlan?.supplier}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm">{selectedPlan ? new Date(selectedPlan.date).toLocaleDateString() : ""}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why the plan could not be completed..."
                  rows={3}
                  className="border-red-200 focus:border-red-400"
                />
              </div>

              <div>
                <Label htmlFor="report-notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="report-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional comments..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsReportDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={submitRejection}
                  disabled={!rejectionReason.trim()}
                  className="bg-red-600 hover:bg-red-700"
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
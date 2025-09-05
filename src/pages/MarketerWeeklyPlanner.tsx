import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, MapPin, Target, Plus, List, Search, Edit, Save, X, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useAuth } from "@/components/contexts/AuthContext";

interface Supplier {
  supplierId: number;
  companyName: string;
  contactPerson: string;
  phone: string;
  location: string;
  region: string;
  sector: string;
  marketer: {
    id: number;
    name: string;
  };
}

interface Plan {
  id: number;
  supplier_id: number;
  visit_date: string;
  notes: string | null;
  type: string;
  status: string;
  feedback: string | null;
  created_by: number;
  created_at: string;
  company_name: string;
  contact_person: string;
  supplier_phone: string;
  supplier_location: string;
  marketer_name: string;
}

type VisitType = "sourcing" | "product" | "strategic" | "followup";

const visitTypes: { value: VisitType; label: string }[] = [
  { value: 'sourcing', label: 'Sourcing' },
  { value: 'product', label: 'Product' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'followup', label: 'Follow-up' },
];

export function MarketerWeeklyPlanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState<VisitType | "">("");
  const [notes, setNotes] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [updatedStatus, setUpdatedStatus] = useState("");
  const [updatedFeedback, setUpdatedFeedback] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [loading, setLoading] = useState({ updating: false, fetching: false });

  // Get marketer ID from authenticated user
  const marketerId = user?.user_id;

  useEffect(() => {
    if (marketerId) {
      fetchSuppliers();
      fetchPlans();
    }
  }, [marketerId]);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/suppliers/with-marketer/${marketerId}`);
      if (response.data.status === "success") {
        setSuppliers(response.data.data || []);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch suppliers",
        variant: "destructive",
      });
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    if (!marketerId) return;
    
    setLoading(prev => ({ ...prev, fetching: true }));
    try {
      const response = await axios.get(`http://localhost:5000/api/marketervisits/${marketerId}`);
      if (response.data.status === "success") {
        setPlans(response.data.data || []);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast({
        title: "Error",
        description: "Failed to fetch marketing plans",
        variant: "destructive",
      });
      setPlans([]);
    } finally {
      setLoading(prev => ({ ...prev, fetching: false }));
    }
  };

  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers;
    
    // Apply location filter
    if (locationFilter && locationFilter !== "all") {
      filtered = filtered.filter(s => s.location === locationFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.companyName.toLowerCase().includes(query) ||
        s.contactPerson.toLowerCase().includes(query) ||
        s.location.toLowerCase().includes(query) ||
        s.sector.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [suppliers, locationFilter, searchQuery]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    suppliers.forEach(supplier => {
      if (supplier.location) {
        locations.add(supplier.location);
      }
    });
    return Array.from(locations);
  }, [suppliers]);

  const selectedSupplierData = selectedSupplier 
    ? suppliers.find(s => s.supplierId === selectedSupplier)
    : null;

  const handleSavePlan = async () => {
    if (!selectedSupplier || !selectedDate || !selectedPurpose) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!marketerId) {
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const planData = {
        supplier_id: selectedSupplier,
        marketer_id: marketerId,
        visit_date: new Date(selectedDate).toISOString(),
        type: selectedPurpose,
        notes: notes || null,
        status: "Pending"
      };

      await axios.post("http://localhost:5000/api/marketer-visits", planData);
      
      toast({
        title: "Plan Created",
        description: `Marketing plan saved for ${selectedSupplierData?.companyName}`,
      });

      // Reset form and refresh plans
      setSelectedSupplier(null);
      setSelectedDate("");
      setSelectedPurpose("");
      setNotes("");
      fetchPlans();
      setActiveTab("view");
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Error",
        description: "Failed to save marketing plan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePlan = async (planId: number) => {
    setLoading(prev => ({ ...prev, updating: true }));
    
    try {
      await axios.put(`http://localhost:5000/api/weekly-plan/${planId}`, {
        status: updatedStatus,
        feedback: updatedFeedback,
        notes: statusNotes
      });

      toast({
        title: "Plan Updated",
        description: "Marketing plan updated successfully",
      });

      // Refresh plans and exit edit mode
      fetchPlans();
      setEditingPlanId(null);
      setUpdatedStatus("");
      setUpdatedFeedback("");
      setStatusNotes("");
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: "Error",
        description: "Failed to update marketing plan",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  const startEditing = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setUpdatedStatus(plan.status);
    setUpdatedFeedback(plan.feedback || "");
    setStatusNotes(plan.notes || "");
  };

  const cancelEditing = () => {
    setEditingPlanId(null);
    setUpdatedStatus("");
    setUpdatedFeedback("");
    setStatusNotes("");
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'Completed':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'Cancelled':
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return <AlertCircle className="h-4 w-4 mr-1" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pending':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case 'Completed':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'Cancelled':
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  if (!marketerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access the marketing planner</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Marketer Planning</h1>
              <p className="text-sm text-muted-foreground">Create strategic marketing plans</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Plan
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              View Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            {/* Location Filter and Search */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle>Filter Suppliers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Filter by Location</Label>
                    <Select 
                      value={locationFilter} 
                      onValueChange={setLocationFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {uniqueLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Suppliers</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name, contact, location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                {locationFilter && locationFilter !== "all" && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {locationFilter}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocationFilter("all")}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plan Creation */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/80">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <CardTitle>Create Marketing Plan</CardTitle>
                </div>
                <CardDescription>Plan your customer visits and marketing activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Supplier Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier *</Label>
                    <Select 
                      value={selectedSupplier?.toString() || ""} 
                      onValueChange={(value) => setSelectedSupplier(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSuppliers.length > 0 ? (
                          filteredSuppliers.map((supplier) => (
                            <SelectItem key={supplier.supplierId} value={supplier.supplierId.toString()}>
                              <div className="space-y-1">
                                <div className="font-medium">{supplier.companyName}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {supplier.location}
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-suppliers" disabled>
                            No suppliers found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="pl-10"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                {/* Purpose Selection */}
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Visit *</Label>
                  <Select 
                    value={selectedPurpose} 
                    onValueChange={(value) => setSelectedPurpose(value as VisitType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose..." />
                    </SelectTrigger>
                    <SelectContent>
                      {visitTypes.map((purpose) => (
                        <SelectItem key={purpose.value} value={purpose.value}>
                          {purpose.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Supplier Details */}
                {selectedSupplierData && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                    <h4 className="font-medium mb-2">Supplier Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Contact Person</Label>
                        <p>{selectedSupplierData.contactPerson}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <p>{selectedSupplierData.phone}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Sector</Label>
                        <Badge variant="outline">{selectedSupplierData.sector}</Badge>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Region</Label>
                        <p>{selectedSupplierData.region}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground">Location</Label>
                        <p className="text-xs">{selectedSupplierData.location}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any specific notes about this marketing plan..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 flex-col sm:flex-row">
                  <Button
                    onClick={handleSavePlan}
                    disabled={!selectedSupplier || !selectedDate || !selectedPurpose || isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Save Marketing Plan
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSupplier(null);
                      setSelectedDate("");
                      setSelectedPurpose("");
                      setNotes("");
                    }}
                  >
                    Clear Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Marketing Plans</CardTitle>
                <CardDescription>View all your scheduled marketing visits</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.fetching ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading plans...</p>
                  </div>
                ) : plans.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No marketing plans found. Create your first plan above.
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Visit Date</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Feedback</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plans.map((plan) => (
                          <TableRow key={plan.id} className="group">
                            <TableCell className="font-medium">
                              <div>
                                <div>{plan.company_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {plan.contact_person}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {plan.supplier_location}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(plan.visit_date)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {plan.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {editingPlanId === plan.id ? (
                                <Select 
                                  value={updatedStatus} 
                                  onValueChange={setUpdatedStatus}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge 
                                  variant="outline"
                                  className={`flex items-center justify-center w-fit ${getStatusVariant(plan.status)}`}
                                >
                                  {getStatusIcon(plan.status)}
                                  {plan.status}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingPlanId === plan.id ? (
                                <Select 
                                  value={updatedFeedback} 
                                  onValueChange={setUpdatedFeedback}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select feedback" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="aware">Aware</SelectItem>
                                    <SelectItem value="not aware">Not Aware</SelectItem>
                                    <SelectItem value="against">Against</SelectItem>
                                    <SelectItem value="interested">Interested</SelectItem>
                                    <SelectItem value="neutral">Neutral</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="capitalize">{plan.feedback || "N/A"}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {plan.notes ? (
                                <div className="max-w-xs truncate" title={plan.notes}>
                                  {plan.notes}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">No notes</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {editingPlanId === plan.id ? (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdatePlan(plan.id)}
                                    disabled={loading.updating}
                                  >
                                    {loading.updating ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                      <Save className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelEditing}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditing(plan)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* Status Notes for Editing */}
                    {editingPlanId && (
                      <div className="p-4 border-t">
                        <Label htmlFor="statusNotes">Status Notes</Label>
                        <Textarea
                          id="statusNotes"
                          placeholder="Add notes about the status update..."
                          value={statusNotes}
                          onChange={(e) => setStatusNotes(e.target.value)}
                          rows={3}
                          className="mt-2"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default MarketerWeeklyPlanner;
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, XCircle, Users, Calendar, FileCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

interface MarketerVisit {
  id: number;
  supplier_id: number;
  visit_date: string;
  notes: string | null;
  type: string;
  status: string;
  feedback: string;
  created_by: number;
  company_name: string;
  contact_person: string;
  supplier_phone: string;
  supplier_location: string;
  marketer_id: number;
  marketer_name: string;
}

interface CollectionPlan {
  id: number;
  plan_date: string;
  supplier_id: number;
  company_name: string;
  collection_type_id: number;
  collection_type_name: string;
  status?: string;
  notes?: string;
}

const PlanManagement = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [marketerVisits, setMarketerVisits] = useState<MarketerVisit[]>([]);
  const [collectionPlans, setCollectionPlans] = useState<CollectionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [statusNotes, setStatusNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState({
    marketer: false,
    collection: false,
    updating: false
  });

  // Get current week dates (Monday to Sunday)
  const getCurrentWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  };

  // SEO setup
  useEffect(() => {
    document.title = "Plan Management | Collection Manager";
    const descContent = "Manage weekly marketer plans and collection plans with status updates and notes.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", descContent);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + location.pathname;
  }, [location.pathname]);

  // Load plans
  useEffect(() => {
    const { start, end } = getCurrentWeekDates();
    
    const loadPlans = async () => {
      try {
        setLoading(prev => ({ ...prev, marketer: true, collection: true }));
        
        // Fetch marketer visits
        const marketerResponse = await axios.get(`http://localhost:5000/api/marketer-visits?start_date=${start}&end_date=${end}`);
        setMarketerVisits(marketerResponse.data.data);
        
        // Fetch collection plans
        const collectionResponse = await axios.get(`http://localhost:5000/api/weekly-plan?start_date=${start}&end_date=${end}`);
        setCollectionPlans(collectionResponse.data.data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error loading plans",
          description: "Failed to fetch plans from the server",
        });
      } finally {
        setLoading(prev => ({ ...prev, marketer: false, collection: false }));
      }
    };

    loadPlans();
  }, []);

  const updateMarketerVisit = async (visitId: number, status: string) => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      
      await axios.put(`http://localhost:5000/api/marketer-visits/${visitId}`, {
        status,
        feedback,
        notes: statusNotes
      });
      
      // Refresh the data
      const { start, end } = getCurrentWeekDates();
      const response = await axios.get(`http://localhost:5000/api/marketer-visits?start_date=${start}&end_date=${end}`);
      setMarketerVisits(response.data.data);
      
      toast({
        title: "Visit updated",
        description: `Marketer visit status changed to ${status}`,
      });
      
      setSelectedPlan(null);
      setStatusNotes("");
      setFeedback("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating visit",
        description: "Failed to update marketer visit",
      });
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  const updateCollectionPlan = async (planId: number, status: string) => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      
      await axios.put(`http://localhost:5000/api/weekly-plan/${planId}`, {
        status,
        notes: statusNotes
      });
      
      // Refresh the data
      const { start, end } = getCurrentWeekDates();
      const response = await axios.get(`http://localhost:5000/api/weekly-plan?start_date=${start}&end_date=${end}`);
      setCollectionPlans(response.data.data);
      
      toast({
        title: "Plan updated",
        description: `Collection plan status changed to ${status}`,
      });
      
      setSelectedPlan(null);
      setStatusNotes("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating plan",
        description: "Failed to update collection plan",
      });
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status || status === "Pending") {
      return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    }
    if (status === "Completed") {
      return <Badge className="bg-green-600 text-white"><CheckCircle2 className="mr-1 h-3 w-3" />Completed</Badge>;
    }
    if (status === "Cancelled" || status === "Rejected") {
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />{status}</Badge>;
    }
    if (status === "In Process") {
      return <Badge className="bg-yellow-600 text-white"><Clock className="mr-1 h-3 w-3" />In Process</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const pendingMarketerVisits = useMemo(() => 
    marketerVisits.filter(v => !v.status || v.status === "Pending"), 
    [marketerVisits]
  );

  const pendingCollectionPlans = useMemo(() => 
    collectionPlans.filter(p => !p.status || p.status === "Pending"), 
    [collectionPlans]
  );

  // Check if a date is today or in the past
  const canUpdatePlan = (dateString: string) => {
    const planDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return planDate <= today;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold">Plan Management</h1>
            <p className="text-muted-foreground">Update status and add notes for weekly plans</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {pendingMarketerVisits.length} pending marketer visits
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {pendingCollectionPlans.length} pending collection plans
            </div>
          </div>
        </div>
      </header>

      <Tabs defaultValue="marketer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="marketer" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Marketer Visits
          </TabsTrigger>
          <TabsTrigger value="collection" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Collection Plans
          </TabsTrigger>
        </TabsList>

        {/* Marketer Visits */}
        <TabsContent value="marketer" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Marketer Visits</CardTitle>
                <CardDescription>Update status for marketer visits this week</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.marketer ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Marketer</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Visit Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {marketerVisits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell className="font-medium">{visit.marketer_name}</TableCell>
                          <TableCell>{visit.company_name}</TableCell>
                          <TableCell>{new Date(visit.visit_date).toLocaleDateString()}</TableCell>
                          <TableCell className="capitalize">{visit.type}</TableCell>
                          <TableCell>{getStatusBadge(visit.status)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPlan(`marketer-${visit.id}`)}
                              disabled={!canUpdatePlan(visit.visit_date)}
                            >
                              Update
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Status Update Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>
                  {selectedPlan?.startsWith('marketer-') ? "Update visit status and feedback" : "Select a visit to update"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlan?.startsWith('marketer-') && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status Notes</label>
                      <Textarea
                        placeholder="Add notes about this visit..."
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Supplier Feedback</label>
                      <Select onValueChange={setFeedback}>
                        <SelectTrigger>
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
                    </div>
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => updateMarketerVisit(
                          parseInt(selectedPlan.split('-')[1]),
                          "Completed"
                        )}
                        disabled={loading.updating}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark Completed
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => updateMarketerVisit(
                          parseInt(selectedPlan.split('-')[1]),
                          "Rejected"
                        )}
                        disabled={loading.updating}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Mark Rejected
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Collection Plans */}
        <TabsContent value="collection" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Collection Plans</CardTitle>
                <CardDescription>Update status for collection plans this week</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.collection ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Plan Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collectionPlans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">{plan.company_name}</TableCell>
                          <TableCell>{new Date(plan.plan_date).toLocaleDateString()}</TableCell>
                          <TableCell className="capitalize">{plan.collection_type_name}</TableCell>
                          <TableCell>{getStatusBadge(plan.status)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPlan(`collection-${plan.id}`)}
                              disabled={!canUpdatePlan(plan.plan_date)}
                            >
                              Update
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Status Update Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>
                  {selectedPlan?.startsWith('collection-') ? "Update collection status and notes" : "Select a plan to update"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlan?.startsWith('collection-') && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status Notes</label>
                      <Textarea
                        placeholder="Add notes about this collection..."
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Button
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={() => updateCollectionPlan(
                          parseInt(selectedPlan.split('-')[1]),
                          "In Process"
                        )}
                        disabled={loading.updating}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Mark In Process
                      </Button>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => updateCollectionPlan(
                          parseInt(selectedPlan.split('-')[1]),
                          "Completed"
                        )}
                        disabled={loading.updating}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark Completed
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => updateCollectionPlan(
                          parseInt(selectedPlan.split('-')[1]),
                          "Cancelled"
                        )}
                        disabled={loading.updating}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Mark Cancelled
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanManagement;
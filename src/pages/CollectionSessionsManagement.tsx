import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  CalendarIcon, 
  RefreshCw, 
  MapPin, 
  User, 
  Phone, 
  Package, 
  Edit, 
  Plus,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Search,
  Menu,
  Save,
  X,
  Eye,
  Play,
  Pause,
  StopCircle,
  MessageCircle,
  FileText,
  CalendarDays,
  Users,
  Package2,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MarketerOrder {
  order_id: number;
  intention_date: string;
  contact_person: string;
  phone_number: string;
  estimated_kg: string;
  require_shredder: number;
  additional_notes: string;
  status: string;
  created_at: string;
  supplier_id: number;
  company_name: string;
  location: string;
  region_name: string;
  sector_name: string;
  marketer_id: number;
  marketer_name: string;
  marketer_phone: string;
}

interface Coordinator {
  id: number;
  name: string;
  phone: string;
}

interface CollectionSession {
  id: number;
  session_number: string;
  supplier_id: number;
  supplier_name: string;
  marketer_id: number;
  marketer_name: string;
  coordinator_id: number;
  coordinator_name: string;
  site_location: string;
  estimated_start_date: string;
  estimated_end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  status: "planned" | "ongoing" | "completed" | "cancelled";
  estimatedAmount: string;
  total_time_spent: number;
  performance: {
    efficiency: number;
    quality: number;
    punctuality: number;
  };
  collection_data: Record<string, any>;
  problems: any[];
  comments: any[];
  created_at: string;
  updated_at: string;
}

const CollectionSessionsManagement = () => {
  const [marketerOrders, setMarketerOrders] = useState<MarketerOrder[]>([]);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [collectionSessions, setCollectionSessions] = useState<CollectionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<MarketerOrder | null>(null);
  const [selectedCoordinator, setSelectedCoordinator] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [activeSessionTab, setActiveSessionTab] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<CollectionSession | null>(null);
  const [sessionDetails, setSessionDetails] = useState<CollectionSession | null>(null);
  const [updateSessionStatus, setUpdateSessionStatus] = useState<string>("");
  const [sessionComment, setSessionComment] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    fetchCollectionSessions();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const ordersResponse = await fetch('http://localhost:5000/api/marketer-orders');
      const ordersData = await ordersResponse.json();
      
      if (ordersData.message && ordersData.message.includes("successfully")) {
        setMarketerOrders(ordersData.orders || []);
      } else {
        setMarketerOrders([]);
      }

      // Updated coordinator fetch endpoint and filtering
      const coordinatorsResponse = await fetch('http://localhost:5000/users');
      const coordinatorsData = await coordinatorsResponse.json();
      
      if (coordinatorsData.status === "success") {
        // Filter only collection coordinators
        const collectionCoordinators = coordinatorsData.data
          .filter((user: any) => user.company_role_name === "collection coordinator")
          .map((user: any) => ({
            id: user.user_id,
            name: `${user.first_name} ${user.last_name}`,
            phone: user.phone_number
          }));
        setCoordinators(collectionCoordinators || []);
      } else {
        setCoordinators([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data from backend",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await fetch('http://localhost:5000/collection-sessions');
      const data = await response.json();
      
      if (data.status === "success") {
        setCollectionSessions(data.data || []);
      } else {
        setCollectionSessions([]);
      }
    } catch (error) {
      console.error('Error fetching collection sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch collection sessions",
        variant: "destructive"
      });
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleOrderSelect = (orderId: string) => {
    const order = marketerOrders.find(o => o.order_id.toString() === orderId);
    setSelectedOrder(order || null);
  };

  const generateSerialNumber = () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `CS-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrder || !startDate || !endDate || !selectedCoordinator) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const serialNumber = generateSerialNumber();
      const coordinator = coordinators.find(c => c.id.toString() === selectedCoordinator);
      
      const sessionData = {
        session_number: serialNumber,
        supplier_id: selectedOrder.supplier_id,
        supplier_name: selectedOrder.company_name,
        site_location: selectedOrder.location,
        marketer_id: selectedOrder.marketer_id,
        marketer_name: selectedOrder.marketer_name,
        coordinator_id: parseInt(selectedCoordinator),
        coordinator_name: coordinator?.name || "",
        estimatedAmount: selectedOrder.estimated_kg,
        estimated_start_date: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        estimated_end_date: endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        status: "planned",
        marketer_order_id: selectedOrder.order_id, // Include marketer order ID
        order_id: selectedOrder.order_id // Also include as order_id for compatibility
      };

      const response = await fetch('http://localhost:5000/api/collection-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Collection session created successfully",
        });
        
        setSelectedOrder(null);
        setSelectedCoordinator("");
        setStartDate(undefined);
        setEndDate(undefined);
        fetchData();
        fetchCollectionSessions();
      } else {
        throw new Error(responseData.message || 'Failed to create collection session');
      }
    } catch (error) {
      console.error('Error creating collection session:', error);
      toast({
        title: "Error",
        description: "Failed to create collection session",
        variant: "destructive"
      });
    }
  };

  const updateSession = async (sessionId: number, newStatus: string, comment: string = "") => {
    try {
      const updateData: any = { 
        status: newStatus 
      };
      
      // Add actual dates based on status
      const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      if (newStatus === "ongoing") {
        updateData.actual_start_date = currentDate;
      } else if (newStatus === "completed") {
        updateData.actual_end_date = currentDate;
      }
      
      // Include all necessary data for backend
      if (selectedSession) {
        updateData.session_number = selectedSession.session_number;
        updateData.supplier_id = selectedSession.supplier_id;
        updateData.supplier_name = selectedSession.supplier_name;
        updateData.marketer_id = selectedSession.marketer_id;
        updateData.marketer_name = selectedSession.marketer_name;
        updateData.coordinator_id = selectedSession.coordinator_id;
        updateData.coordinator_name = selectedSession.coordinator_name;
        updateData.site_location = selectedSession.site_location;
        updateData.estimatedAmount = selectedSession.estimatedAmount;
        updateData.estimated_start_date = selectedSession.estimated_start_date;
        updateData.estimated_end_date = selectedSession.estimated_end_date;
        
        // Find the original marketer order to include its ID
        const originalOrder = marketerOrders.find(order => 
          order.supplier_id === selectedSession.supplier_id && 
          order.marketer_id === selectedSession.marketer_id
        );
        
        if (originalOrder) {
          updateData.marketer_order_id = originalOrder.order_id;
          updateData.order_id = originalOrder.order_id;
        }
      }
      
      if (comment) {
        updateData.comment = comment;
        // Add to comments array if it exists
        if (!updateData.comments) {
          updateData.comments = [];
        }
        updateData.comments.push({
          text: comment,
          timestamp: new Date().toISOString(),
          type: 'status_update'
        });
      }

      const response = await fetch(`http://localhost:5000/api/collection-sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Session status updated to ${newStatus}`,
        });
        
        fetchCollectionSessions();
        setSelectedSession(null);
        setUpdateSessionStatus("");
        setSessionComment("");
      } else {
        throw new Error(responseData.message || 'Failed to update session status');
      }
    } catch (error) {
      console.error('Error updating session status:', error);
      toast({
        title: "Error",
        description: "Failed to update session status",
        variant: "destructive"
      });
    }
  };

  const deleteSession = async (sessionId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/collection-sessions/${sessionId}`, {
        method: 'DELETE',
      });

      const responseData = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Collection session deleted successfully",
        });
        
        fetchCollectionSessions();
      } else {
        throw new Error(responseData.message || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete collection session",
        variant: "destructive"
      });
    }
  };

  const handleSessionUpdate = () => {
    if (!selectedSession || !updateSessionStatus) return;

    if ((updateSessionStatus === "ongoing" || updateSessionStatus === "completed") && !sessionComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please add a comment when updating to ongoing or completed status",
        variant: "destructive"
      });
      return;
    }

    updateSession(selectedSession.id, updateSessionStatus, sessionComment);
  };

  const handleDeleteSession = (session: CollectionSession) => {
    if (window.confirm(`Are you sure you want to delete session ${session.session_number}?`)) {
      deleteSession(session.id);
    }
  };

  const resetSessionModal = () => {
    setSelectedSession(null);
    setUpdateSessionStatus("");
    setSessionComment("");
  };

  const resetSessionDetailsModal = () => {
    setSessionDetails(null);
  };

  // Status badges for collection sessions
  const getSessionStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      planned: { label: "Planned", variant: "outline" },
      ongoing: { label: "Ongoing", variant: "default" },
      completed: { label: "Completed", variant: "secondary" },
      cancelled: { label: "Cancelled", variant: "destructive" }
    };

    const config = statusConfig[status.toLowerCase()] || {
      label: status,
      variant: "outline"
    };

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  // Filter collection sessions based on active tab and search
  const filteredSessions = collectionSessions.filter(session => {
    const matchesTab = activeSessionTab === "all" || 
      session.status.toLowerCase() === activeSessionTab;

    const matchesSearch = sessionSearchQuery === "" || 
      session.session_number.toLowerCase().includes(sessionSearchQuery.toLowerCase()) ||
      session.supplier_name.toLowerCase().includes(sessionSearchQuery.toLowerCase()) ||
      session.coordinator_name.toLowerCase().includes(sessionSearchQuery.toLowerCase()) ||
      session.site_location.toLowerCase().includes(sessionSearchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Only show orders with "active" status in the dropdown
  const activeOrdersForSelection = marketerOrders.filter(order => {
    const statusLower = order.status.toLowerCase();
    return statusLower === "active";
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Collection Sessions
              </h1>
              <p className="text-gray-600">
                Professional collection session tracking
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Collection Sessions
            </h1>
            <p className="text-gray-600">
              Create and manage collection sessions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search sessions..."
              className="pl-10 w-full lg:w-64"
              value={sessionSearchQuery}
              onChange={(e) => setSessionSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => { fetchData(); fetchCollectionSessions(); }} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Session Update Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Update Session</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSessionModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Session Details</Label>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><span className="font-medium">ID:</span> {selectedSession.session_number}</div>
                  <div><span className="font-medium">Supplier:</span> {selectedSession.supplier_name}</div>
                  <div><span className="font-medium">Coordinator:</span> {selectedSession.coordinator_name}</div>
                  <div><span className="font-medium">Current Status:</span> {getSessionStatusBadge(selectedSession.status)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Update Status</Label>
                <Select value={updateSessionStatus} onValueChange={setUpdateSessionStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Comments
                  {(updateSessionStatus === "ongoing" || updateSessionStatus === "completed") && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <Textarea
                  placeholder="Add comments about this status update..."
                  value={sessionComment}
                  onChange={(e) => setSessionComment(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Comments are required when changing status to Ongoing or Completed
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t">
              <Button
                variant="outline"
                onClick={resetSessionModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSessionUpdate}
                disabled={!updateSessionStatus || ((updateSessionStatus === "ongoing" || updateSessionStatus === "completed") && !sessionComment.trim())}
                className="flex-1"
              >
                Update Session
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Create Collection Session Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Collection Session
            </CardTitle>
            <CardDescription>
              Create a new collection session from an active marketer order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Marketer Order</Label>
                <Select onValueChange={handleOrderSelect} value={selectedOrder?.order_id.toString() || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an active marketer order" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeOrdersForSelection.length === 0 ? (
                      <SelectItem value="no-orders" disabled>
                        No active orders available
                      </SelectItem>
                    ) : (
                      activeOrdersForSelection.map((order) => (
                        <SelectItem key={order.order_id} value={order.order_id.toString()}>
                          {order.company_name} - {order.estimated_kg} kg
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedOrder && (
                <>
                  <div className="space-y-2">
                    <Label>Assign Coordinator</Label>
                    <Select onValueChange={setSelectedCoordinator} value={selectedCoordinator}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a coordinator" />
                      </SelectTrigger>
                      <SelectContent>
                        {coordinators.length === 0 ? (
                          <SelectItem value="no-coordinators" disabled>
                            No collection coordinators available
                          </SelectItem>
                        ) : (
                          coordinators.map((coordinator) => (
                            <SelectItem key={coordinator.id} value={coordinator.id.toString()}>
                              {coordinator.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Order Summary</h4>
                    <div className="text-sm space-y-1">
                      <div><span className="font-medium">Supplier:</span> {selectedOrder.company_name}</div>
                      <div><span className="font-medium">Location:</span> {selectedOrder.location}</div>
                      <div><span className="font-medium">Estimated Amount:</span> {selectedOrder.estimated_kg} kg</div>
                      <div><span className="font-medium">Marketer:</span> {selectedOrder.marketer_name}</div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Create Collection Session
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Collection Sessions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Collection Sessions ({collectionSessions.length})
            </CardTitle>
            <CardDescription>
              Manage and track all collection sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeSessionTab} onValueChange={setActiveSessionTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="planned">Planned</TabsTrigger>
                <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="space-y-4">
              {sessionsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No sessions found</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Session ID</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Coordinator</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            {session.session_number}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{session.supplier_name}</div>
                            <div className="text-sm text-gray-500">{session.site_location}</div>
                          </TableCell>
                          <TableCell>
                            {session.coordinator_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-1 text-green-600" />
                              {session.estimatedAmount} kg
                            </div>
                          </TableCell>
                          <TableCell>
                            {getSessionStatusBadge(session.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSessionDetails(session)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {session.status === "planned" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedSession(session)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSession(session)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}

                              {/* Quick Actions */}
                              {session.status === "planned" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSession(session);
                                    setUpdateSessionStatus("ongoing");
                                  }}
                                  className="h-8 px-2 text-green-600 hover:bg-green-50"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {session.status === "ongoing" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSession(session);
                                    setUpdateSessionStatus("completed");
                                  }}
                                  className="h-8 px-2 text-blue-600 hover:bg-blue-50"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}

                              {(session.status === "planned" || session.status === "ongoing") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSession(session);
                                    setUpdateSessionStatus("cancelled");
                                  }}
                                  className="h-8 px-2 text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Details Modal */}
      {sessionDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Session Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSessionDetailsModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Supplier Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {sessionDetails.supplier_name}</div>
                      <div><span className="font-medium">Location:</span> {sessionDetails.site_location}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Team Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Coordinator:</span> {sessionDetails.coordinator_name}</div>
                      <div><span className="font-medium">Marketer:</span> {sessionDetails.marketer_name}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Collection Details</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Session ID:</span> {sessionDetails.session_number}</div>
                      <div><span className="font-medium">Estimated Amount:</span> {sessionDetails.estimatedAmount} kg</div>
                      <div><span className="font-medium">Status:</span> {getSessionStatusBadge(sessionDetails.status)}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Schedule</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Planned Start:</span> {format(new Date(sessionDetails.estimated_start_date), "MMM dd, yyyy")}</div>
                      <div><span className="font-medium">Planned End:</span> {format(new Date(sessionDetails.estimated_end_date), "MMM dd, yyyy")}</div>
                      {sessionDetails.actual_start_date && (
                        <div><span className="font-medium">Actual Start:</span> {format(new Date(sessionDetails.actual_start_date), "MMM dd, yyyy")}</div>
                      )}
                      {sessionDetails.actual_end_date && (
                        <div><span className="font-medium">Actual End:</span> {format(new Date(sessionDetails.actual_end_date), "MMM dd, yyyy")}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments */}
              {sessionDetails.comments && sessionDetails.comments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Comments & Updates</h3>
                  <div className="space-y-3">
                    {sessionDetails.comments.map((comment: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">{comment.text || comment}</p>
                        {comment.timestamp && (
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(comment.timestamp), "MMM dd, yyyy 'at' hh:mm a")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t">
              <Button
                variant="outline"
                onClick={resetSessionDetailsModal}
                className="flex-1"
              >
                Close
              </Button>
              {(sessionDetails.status === "planned" || sessionDetails.status === "ongoing") && (
                <Button
                  onClick={() => {
                    setSelectedSession(sessionDetails);
                    setSessionDetails(null);
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update Session
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionSessionsManagement;
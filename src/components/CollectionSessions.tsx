import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  MapPin,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  BarChart3,
  FileText,
  RefreshCw,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Edit,
  Trash2,
  Truck,
  Download,
  Upload
} from "lucide-react";
import { CollectionSession, CollectionProblem, CollectionComment, CollectionPerformance } from "@/types/supplier";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// API base URL
const API_BASE_URL = "http://localhost:5000";

interface CollectionSessionsProps {
  suppliers: any[];
  marketers: any[];
}

// Extended CollectionSession type with proper kg formatting
interface ExtendedCollectionSession extends CollectionSession {
  collection_data: {
    estimatedAmount: number;
    actualAmount?: number;
    paperTypes: {
      carton: number;
      mixed: number;
      sw: number;
      sc: number;
      np: number;
    };
  };
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "planned": return "bg-blue-100 text-blue-800";
    case "in-progress": return "bg-amber-100 text-amber-800";
    case "completed": return "bg-green-100 text-green-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export const CollectionSessions = ({ suppliers, marketers }: CollectionSessionsProps) => {
  const [sessions, setSessions] = useState<ExtendedCollectionSession[]>([]);
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ExtendedCollectionSession | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
    fetchCoordinators();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/collection-sessions`);
      if (response.data.status === 'success') {
        setSessions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch collection sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordinators = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/coordinators`);
      if (response.data.status === 'success') {
        setCoordinators(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching coordinators:', error);
      toast({
        title: "Error",
        description: "Failed to fetch coordinators",
        variant: "destructive"
      });
    }
  };

  const handleCreateSession = async (sessionData: Omit<ExtendedCollectionSession, 'id' | 'session_number'>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/collection-sessions`, sessionData);
      if (response.data.status === 'success') {
        setSessions(prev => [...prev, response.data.data]);
        setIsCreateDialogOpen(false);
        toast({
          title: "Collection Session Created",
          description: "New collection session has been successfully created.",
        });
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create collection session",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSession = async (sessionId: string, updates: Partial<ExtendedCollectionSession>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/collection-sessions/${sessionId}`, updates);
      if (response.data.status === 'success') {
        setSessions(prev => prev.map(s =>
          s.id === sessionId ? { ...s, ...updates } : s
        ));
        setSelectedSession(prev => prev && prev.id === sessionId ? { ...prev, ...updates } : prev);
        toast({
          title: "Session Updated",
          description: "Collection session has been successfully updated.",
        });
      }
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: "Failed to update collection session",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/collection-sessions/${sessionId}`);
      if (response.data.status === 'success') {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (selectedSession?.id === sessionId) {
          setIsDetailsDialogOpen(false);
        }
        setDeleteConfirmOpen(false);
        toast({
          title: "Session Deleted",
          description: "Collection session has been successfully deleted.",
        });
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

  // Format weight in kg with commas
  const formatWeight = (kg: number) => {
    return `${kg?.toLocaleString() || 0} kg`;
  };

  // Filter and sort sessions
  const filteredSessions = sessions
    .filter(session => {
      const sessionNumber = session.session_number || "";
      const supplierName = session.supplier_name || "";
      const siteLocation = session.site_location || "";
      const matchesSearch = sessionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        siteLocation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || session.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      } else if (sortBy === "amount-high") {
        return (b.collection_data?.estimatedAmount || 0) - (a.collection_data?.estimatedAmount || 0);
      } else if (sortBy === "amount-low") {
        return (a.collection_data?.estimatedAmount || 0) - (b.collection_data?.estimatedAmount || 0);
      }
      return 0;
    });

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Collection Sessions</h2>
          <p className="text-muted-foreground">
            Manage collection sessions and track performance
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={fetchSessions}
            disabled={loading}
            className="border-green-300 text-green-800 hover:bg-green-50 w-full sm:w-auto"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-green-800">Create New Collection Session</DialogTitle>
              </DialogHeader>
              <CreateSessionForm
                suppliers={suppliers}
                marketers={marketers}
                coordinators={coordinators}
                onSubmit={handleCreateSession}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="border-green-100 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-green-200 focus:ring-green-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[140px] border-green-200 focus:ring-green-500">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[160px] border-green-200 focus:ring-green-500">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount-high">Amount: High to Low</SelectItem>
                  <SelectItem value="amount-low">Amount: Low to High</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-green-200 text-green-800 hover:bg-green-50 w-full md:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map((session) => (
          <Card
            key={session.id}
            className="cursor-pointer hover:shadow-md transition-shadow border-green-100 overflow-hidden group relative"
            onClick={() => {
              setSelectedSession(session);
              setIsDetailsDialogOpen(true);
            }}
          >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-white shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSession(session);
                  setIsDetailsDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4 text-green-600" />
              </Button>
            </div>
            <CardHeader className="pb-3 border-b border-green-100 bg-green-50/30">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base text-green-900 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    {session.session_number || "N/A"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{session.supplier_name || "Unknown Supplier"}</p>
                </div>
                <Badge className={`${getStatusColor(session.status || "planned")} capitalize`}>
                  {session.status || "planned"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="truncate">{session.site_location || "No location specified"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{session.coordinator_name || "Unassigned"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{session.estimated_start_date ? new Date(session.estimated_start_date).toLocaleDateString() : "No date set"}</span>
                </div>
                {session.total_time_spent > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>{session.total_time_spent}h spent</span>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-green-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Estimated:</span>
                  <span className="font-medium text-green-700">
                    {formatWeight(session.estimatedAmount || 0)}
                  </span>
                </div>
                {session.collection_data?.actualAmount && session.collection_data.actualAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Actual:</span>
                    <span className="font-medium text-green-700">
                      {formatWeight(session.collection_data.actualAmount)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-green-100">
                <div className="flex gap-1">
                  {session.problems?.filter(p => p.status === 'open').length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {session.problems.filter(p => p.status === 'open').length} issues
                    </Badge>
                  )}
                  {session.comments?.length > 0 && (
                    <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                      {session.comments.length} comments
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-green-600 font-medium">
                  {(session.performance?.efficiency || 0)}% efficiency
                </div>
              </div>
            </CardContent>
            <div className="px-4 pb-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-green-200 text-green-700 hover:bg-green-50"
                onClick={(e) => {
                  e.stopPropagation();
                  if (expandedSessionId === session.id) {
                    setExpandedSessionId(null);
                  } else {
                    setExpandedSessionId(session.id);
                  }
                }}
              >
                {expandedSessionId === session.id ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Quick Actions
                  </>
                )}
              </Button>
              {expandedSessionId === session.id && (
                <div className="mt-3 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSession(session);
                      setIsDetailsDialogOpen(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  {session.status !== "completed" && session.status !== "cancelled" && (
                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextStatus = session.status === "planned" ? "in-progress" : "completed";
                        handleUpdateSession(session.id, { status: nextStatus });
                        setExpandedSessionId(null);
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as {session.status === "planned" ? "In Progress" : "Completed"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-red-200 text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSession(session);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Session
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredSessions.length === 0 && !loading && (
        <Card className="border-green-100">
          <CardContent className="text-center py-12">
            <Truck className="h-12 w-12 text-green-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">No collection sessions found</h3>
            <p className="text-muted-foreground">Try adjusting your search or create a new session to get started.</p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card className="border-green-100">
          <CardContent className="text-center py-12">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
            <p className="text-muted-foreground mt-4">Loading sessions...</p>
          </CardContent>
        </Card>
      )}

      {/* Session Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-green-800 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Session Details - {selectedSession?.session_number || "N/A"}
            </DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <SessionDetails
              session={selectedSession}
              onUpdate={(updates) => handleUpdateSession(selectedSession.id, updates)}
              onDelete={() => {
                handleDeleteSession(selectedSession.id);
                setIsDetailsDialogOpen(false);
              }}
              loading={loading}
              formatWeight={formatWeight}
              getStatusColor={getStatusColor}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete session {selectedSession?.session_number || "N/A"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-green-200 text-green-800 hover:bg-green-50"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedSession) {
                  handleDeleteSession(selectedSession.id);
                }
              }}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CreateSessionFormProps {
  suppliers: any[];
  marketers: any[];
  coordinators: any[];
  onSubmit: (data: Omit<ExtendedCollectionSession, 'id' | 'session_number'>) => void;
  loading: boolean;
}

const CreateSessionForm = ({ suppliers, marketers, coordinators, onSubmit, loading }: CreateSessionFormProps) => {
  const [formData, setFormData] = useState({
    supplierId: 0,
    supplier_name: "",
    supplierLocation: "",
    marketerId: 0,
    marketerName: "",
    coordinatorId: 0,
    coordinator_name: "",
    site_location: "",
    estimated_start_date: "",
    estimatedEndDate: "",
    status: "planned" as const,
    problems: [] as CollectionProblem[],
    comments: [] as CollectionComment[],
    performance: {
      efficiency: 0,
      quality: 0,
      punctuality: 0,
    },
    collection_data: {
      estimatedAmount: 0,
      paperTypes: {
        carton: 0,
        mixed: 0,
        sw: 0,
        sc: 0,
        np: 0,
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-green-800">Supplier</Label>
          <Select
            value={formData.supplierId.toString()}
            onValueChange={(value) => {
              const supplier = suppliers.find(s => s.id === parseInt(value));
              setFormData({
                ...formData,
                supplierId: parseInt(value),
                supplier_name: supplier?.name || "",
                supplierLocation: supplier?.location || "",
                site_location: supplier?.location || formData.site_location
              });
            }}
          >
            <SelectTrigger className="border-green-200 focus:ring-green-500">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map(supplier => (
                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name} - {supplier.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-green-800">Marketer</Label>
          <Select
            value={formData.marketerId.toString()}
            onValueChange={(value) => {
              const marketer = marketers.find(m => m.id === parseInt(value));
              setFormData({
                ...formData,
                marketerId: parseInt(value),
                marketerName: marketer?.name || ""
              });
            }}
          >
            <SelectTrigger className="border-green-200 focus:ring-green-500">
              <SelectValue placeholder="Select marketer" />
            </SelectTrigger>
            <SelectContent>
              {marketers.map(marketer => (
                <SelectItem key={marketer.id} value={marketer.id.toString()}>
                  {marketer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-green-800">Collection Coordinator</Label>
          <Select
            value={formData.coordinatorId.toString()}
            onValueChange={(value) => {
              const coordinator = coordinators.find(c => c.id === parseInt(value));
              setFormData({
                ...formData,
                coordinatorId: parseInt(value),
                coordinator_name: coordinator?.name || ""
              });
            }}
          >
            <SelectTrigger className="border-green-200 focus:ring-green-500">
              <SelectValue placeholder="Select coordinator" />
            </SelectTrigger>
            <SelectContent>
              {coordinators.map(coordinator => (
                <SelectItem key={coordinator.id} value={coordinator.id.toString()}>
                  {coordinator.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-green-800">Site Location</Label>
          <Input
            value={formData.site_location}
            onChange={(e) => setFormData({...formData, site_location: e.target.value})}
            placeholder="Enter collection site location"
            required
            className="border-green-200 focus:ring-green-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-green-800">Estimated Start Date</Label>
          <Input
            type="date"
            value={formData.estimated_start_date}
            onChange={(e) => setFormData({...formData, estimated_start_date: e.target.value})}
            required
            className="border-green-200 focus:ring-green-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-green-800">Estimated End Date</Label>
          <Input
            type="date"
            value={formData.estimatedEndDate}
            onChange={(e) => setFormData({...formData, estimatedEndDate: e.target.value})}
            required
            className="border-green-200 focus:ring-green-500"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-green-800">Estimated Collection Amount (kg)</Label>
        <Input
          type="number"
          value={formData.collection_data.estimatedAmount}
          onChange={(e) => setFormData({
            ...formData,
            collection_data: {
              ...formData.collection_data,
              estimatedAmount: parseFloat(e.target.value)
            }
          })}
          placeholder="0"
          min="0"
          step="0.1"
          className="border-green-200 focus:ring-green-500"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsCreateDialogOpen(false)}
          className="border-green-200 text-green-800 hover:bg-green-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? "Creating..." : "Create Session"}
        </Button>
      </div>
    </form>
  );
};

interface SessionDetailsProps {
  session: ExtendedCollectionSession;
  onUpdate: (updates: Partial<ExtendedCollectionSession>) => void;
  onDelete: () => void;
  loading: boolean;
  formatWeight: (kg: number) => string;
  getStatusColor: (status: string) => string;
}

const SessionDetails = ({ session, onUpdate, onDelete, loading, formatWeight, getStatusColor }: SessionDetailsProps) => {
  const [newComment, setNewComment] = useState("");
  const [newProblem, setNewProblem] = useState({
    description: "",
    priority: "medium" as const,
  });
  const [resolutionText, setResolutionText] = useState("");

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: CollectionComment = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      authorId: 1,
      authorName: "Current User",
      comment: newComment,
      timestamp: new Date().toISOString(),
      type: "general",
    };
    onUpdate({
      comments: [...(session.comments || []), comment]
    });
    setNewComment("");
  };

  const handleAddProblem = () => {
    if (!newProblem.description.trim()) return;

    const problem: CollectionProblem = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      reportedBy: "Current User",
      reportedDate: new Date().toISOString(),
      description: newProblem.description,
      priority: newProblem.priority,
      status: "open",
    };
    onUpdate({
      problems: [...(session.problems || []), problem]
    });
    setNewProblem({ description: "", priority: "medium" });
  };

  const handleResolveProblem = (problemId: string, resolution: string) => {
    if (!resolution.trim()) return;

    const updatedProblems = (session.problems || []).map(p =>
      p.id === problemId
        ? {
            ...p,
            status: "resolved" as const,
            resolvedBy: "Current User",
            resolvedDate: new Date().toISOString(),
            resolution
          }
        : p
    );
    onUpdate({ problems: updatedProblems });
    setResolutionText("");
  };

  const handleStatusChange = (status: ExtendedCollectionSession['status']) => {
    const updates: Partial<ExtendedCollectionSession> = { status };

    if (status === "in-progress" && !session.actualStartDate) {
      updates.actualStartDate = new Date().toISOString();
    } else if (status === "completed" && !session.actualEndDate) {
      updates.actualEndDate = new Date().toISOString();
      // Calculate total time spent
      if (session.actualStartDate) {
        const start = new Date(session.actualStartDate);
        const end = new Date();
        const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
        updates.total_time_spent = hours;
      }
      // Calculate performance metrics
      if (status === "completed") {
        const estimatedAmount = session.collection_data?.estimatedAmount || 0;
        const actualAmount = session.collection_data?.actualAmount || 0;
        const efficiency = estimatedAmount > 0 ? Math.round((actualAmount / estimatedAmount) * 100) : 0;
        const quality = 90; // Replace with your logic
        const punctuality = 100; // Replace with your logic
        updates.performance = {
          efficiency,
          quality,
          punctuality,
        };
      }
    }

    onUpdate(updates);
  };

  const handleUpdateCollectionData = (field: string, value: number) => {
    onUpdate({
      collection_data: {
        ...session.collection_data,
        [field]: value
      }
    });
  };

  const handleUpdatePaperType = (paperType: string, value: number) => {
    onUpdate({
      collection_data: {
        ...session.collection_data,
        paperTypes: {
          ...session.collection_data.paperTypes,
          [paperType]: value
        }
      }
    });
  };

  const handleSaveCollectionData = () => {
    // Calculate the sum of all paper types
    const { carton, mixed, sw, sc, np } = session.collection_data.paperTypes;
    const totalPaperTypes = carton + mixed + sw + sc + np;

    // If actualAmount is not provided, set it to the sum of paper types
    const updates: Partial<ExtendedCollectionSession> = {
      collection_data: {
        ...session.collection_data,
        actualAmount: session.collection_data.actualAmount || totalPaperTypes
      }
    };

    onUpdate(updates);
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-green-50">
        <TabsTrigger value="overview" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">Overview</TabsTrigger>
        <TabsTrigger value="collection" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">Collection Data</TabsTrigger>
        <TabsTrigger value="problems" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
          Problems
          {(session.problems || []).filter(p => p.status === 'open').length > 0 && (
            <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
              {(session.problems || []).filter(p => p.status === 'open').length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="comments" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">Comments</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-100">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-base text-green-800">Session Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <div className="flex gap-2">
                  <Badge className={`${getStatusColor(session.status || "planned")} capitalize`}>
                    {session.status || "planned"}
                  </Badge>
                  <Select value={session.status || "planned"} onValueChange={handleStatusChange} disabled={loading}>
                    <SelectTrigger className="w-32 h-6 border-green-200 focus:ring-green-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supplier:</span>
                <span>{session.supplier_name || "Unknown Supplier"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span>{session.site_location || "No location specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coordinator:</span>
                <span>{session.coordinator_name || "Unassigned"}</span>
              </div>
              {session.total_time_spent > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Spent:</span>
                  <span>{session.total_time_spent} hours</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-base text-green-800">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Efficiency:</span>
                <span className="font-medium text-green-600">{session.performance?.efficiency || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quality:</span>
                <span className="font-medium text-green-600">{session.performance?.quality || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Punctuality:</span>
                <span className="font-medium text-green-600">{session.performance?.punctuality || 0}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-green-100">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-base text-green-800">Collection Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-green-800">Estimated Amount</Label>
                <p className="text-sm">{formatWeight(session.estimatedAmount || 0)}</p>
              </div>
              <div>
                <Label className="text-green-800">Actual Amount</Label>
                <p className="text-sm">
                  {session.collection_data?.actualAmount
                    ? formatWeight(session.collection_data.actualAmount)
                    : 'Not recorded'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-base text-red-800">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Delete this session</p>
                <p className="text-sm text-muted-foreground">
                  Once deleted, this session cannot be recovered.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="collection" className="space-y-4">
        {session.status === "completed" && (
          <Card className="border-green-100">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-base text-green-800">Collection Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-green-800">Actual Collected Amount (kg)</Label>
                <Input
                  type="number"
                  value={session.collection_data?.actualAmount || ""}
                  onChange={(e) => handleUpdateCollectionData("actualAmount", parseFloat(e.target.value) || 0)}
                  placeholder="Enter actual collected amount"
                  className="border-green-200 focus:ring-green-500"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-green-800">Paper Types Breakdown (kg)</Label>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Carton</Label>
                    <Input
                      type="number"
                      value={session.collection_data?.paperTypes?.carton || 0}
                      onChange={(e) => handleUpdatePaperType("carton", parseFloat(e.target.value) || 0)}
                      className="border-green-200 focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mixed</Label>
                    <Input
                      type="number"
                      value={session.collection_data?.paperTypes?.mixed || 0}
                      onChange={(e) => handleUpdatePaperType("mixed", parseFloat(e.target.value) || 0)}
                      className="border-green-200 focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>SW (Sorted White)</Label>
                    <Input
                      type="number"
                      value={session.collection_data?.paperTypes?.sw || 0}
                      onChange={(e) => handleUpdatePaperType("sw", parseFloat(e.target.value) || 0)}
                      className="border-green-200 focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>SC (Sorted Colored)</Label>
                    <Input
                      type="number"
                      value={session.collection_data?.paperTypes?.sc || 0}
                      onChange={(e) => handleUpdatePaperType("sc", parseFloat(e.target.value) || 0)}
                      className="border-green-200 focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>NP (Newspaper)</Label>
                    <Input
                      type="number"
                      value={session.collection_data?.paperTypes?.np || 0}
                      onChange={(e) => handleUpdatePaperType("np", parseFloat(e.target.value) || 0)}
                      className="border-green-200 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <Button
                  onClick={handleSaveCollectionData}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Collection Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="problems" className="space-y-4">
        <Card className="border-green-100">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-base text-green-800">Report New Problem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-green-800">Problem Description</Label>
              <Textarea
                value={newProblem.description}
                onChange={(e) => setNewProblem({...newProblem, description: e.target.value})}
                placeholder="Describe the problem..."
                className="border-green-200 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-green-800">Priority</Label>
              <Select
                value={newProblem.priority}
                onValueChange={(value: any) => setNewProblem({...newProblem, priority: value})}
              >
                <SelectTrigger className="w-32 border-green-200 focus:ring-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddProblem} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Problem
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-3">
          {(session.problems || []).map((problem) => (
            <Card key={problem.id} className="border-green-100">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <Badge variant={problem.status === 'resolved' ? 'default' : 'destructive'}>
                      {problem.status}
                    </Badge>
                    <Badge variant="outline" className={
                      problem.priority === 'high' || problem.priority === 'critical'
                        ? "border-red-200 text-red-800"
                        : "border-green-200 text-green-800"
                    }>
                      {problem.priority}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(problem.reportedDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mb-2">{problem.description}</p>
                <p className="text-xs text-muted-foreground">Reported by: {problem.reportedBy}</p>

                {problem.status === 'open' && (
                  <div className="mt-3 space-y-2">
                    <Label className="text-green-800">Resolution</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter resolution..."
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        className="border-green-200 focus:ring-green-500"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleResolveProblem(problem.id, resolutionText)}
                        disabled={loading || !resolutionText.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {problem.resolution && (
                  <div className="mt-2 p-2 bg-green-50 rounded">
                    <p className="text-sm"><strong>Resolution:</strong> {problem.resolution}</p>
                    <p className="text-xs text-muted-foreground">
                      Resolved by {problem.resolvedBy} on {problem.resolvedDate && new Date(problem.resolvedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="comments" className="space-y-4">
        <Card className="border-green-100">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-base text-green-800">Add Comment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="border-green-200 focus:ring-green-500"
            />
            <Button onClick={handleAddComment} disabled={loading || !newComment.trim()} className="bg-green-600 hover:bg-green-700">
              <MessageSquare className="mr-2 h-4 w-4" />
              Add Comment
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-3">
          {(session.comments || []).map((comment) => (
            <Card key={comment.id} className="border-green-100">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-green-800">{comment.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{comment.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  FileText
} from "lucide-react";
import { CollectionSession, CollectionProblem, CollectionComment } from "@/types/supplier";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

interface CollectionSessionsProps {
  suppliers: any[];
  marketers: any[];
}

export const CollectionSessions = ({ suppliers, marketers }: CollectionSessionsProps) => {
  const [sessions, setSessions] = useState<CollectionSession[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CollectionSession | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/collection-sessions");
        setSessions(res.data.data || []);
      } catch (error) {
        handleApiError(error, "Failed to load collection sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleCreateSession = async (sessionData: Omit<CollectionSession, 'id' | 'sessionNumber'>) => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/collection-sessions", sessionData);
      setSessions([...sessions, res.data.data]);
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Collection session created successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      handleApiError(error, "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSession = async (sessionId: string, updates: Partial<CollectionSession>) => {
    try {
      setLoading(true);
      const res = await axios.put(`http://localhost:5000/collection-sessions/${sessionId}`, updates);
      setSessions(sessions.map(s => 
        s.id === sessionId ? res.data.data : s
      ));
      toast({
        title: "Success",
        description: "Session updated successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      handleApiError(error, "Failed to update session");
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error: unknown, defaultMessage: string) => {
    let errorMessage = defaultMessage;
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message || defaultMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessage,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned": return "secondary";
      case "in-progress": return "default";
      case "completed": return "default";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Collection Session</DialogTitle>
            </DialogHeader>
            <CreateSessionForm 
              suppliers={suppliers}
              marketers={marketers}
              onSubmit={handleCreateSession}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Sessions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Card 
            key={session.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedSession(session);
              setIsDetailsDialogOpen(true);
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{session.sessionNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground">{session.supplierName}</p>
                </div>
                <Badge variant={getStatusColor(session.status)}>
                  {session.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{session.siteLocation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{session.coordinatorName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(session.estimatedStartDate).toLocaleDateString()}</span>
                </div>
                {session.totalTimeSpent && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{session.totalTimeSpent}h spent</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="flex gap-1">
                  {session.problems.filter(p => p.status === 'open').length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {session.problems.filter(p => p.status === 'open').length} issues
                    </Badge>
                  )}
                  {session.comments.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {session.comments.length} comments
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {session.performance.efficiency}% efficiency
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No collection sessions found. Create your first session to get started.</p>
          </CardContent>
        </Card>
      )}

      {/* Session Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Details - {selectedSession?.sessionNumber}</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <SessionDetails 
              session={selectedSession} 
              onUpdate={(updates) => handleUpdateSession(selectedSession.id, updates)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CreateSessionFormProps {
  suppliers: any[];
  marketers: any[];
  onSubmit: (data: Omit<CollectionSession, 'id' | 'sessionNumber'>) => void;
}

const CreateSessionForm = ({ suppliers, marketers, onSubmit }: CreateSessionFormProps) => {
  const [formData, setFormData] = useState({
    supplierId: "",
    supplierName: "",
    marketerId: "",
    marketerName: "",
    coordinatorId: "1",
    coordinatorName: "Default Coordinator",
    siteLocation: "",
    estimatedStartDate: "",
    estimatedEndDate: "",
    status: "planned" as const,
    problems: [] as CollectionProblem[],
    comments: [] as CollectionComment[],
    performance: {
      efficiency: 0,
      quality: 0,
      punctuality: 0,
    },
    collectionData: {
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
          <Label>Supplier *</Label>
          <Select 
            value={formData.supplierId} 
            onValueChange={(value) => {
              const supplier = suppliers.find(s => s.id === value);
              setFormData({
                ...formData, 
                supplierId: value,
                supplierName: supplier?.name || ""
              });
            }}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map(supplier => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Marketer</Label>
          <Select 
            value={formData.marketerId} 
            onValueChange={(value) => {
              const marketer = marketers.find(m => m.id === value);
              setFormData({
                ...formData, 
                marketerId: value,
                marketerName: marketer?.name || ""
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select marketer" />
            </SelectTrigger>
            <SelectContent>
              {marketers.map(marketer => (
                <SelectItem key={marketer.id} value={marketer.id}>
                  {marketer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Site Location *</Label>
        <Input
          value={formData.siteLocation}
          onChange={(e) => setFormData({...formData, siteLocation: e.target.value})}
          placeholder="Enter collection site location"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Estimated Start Date *</Label>
          <Input
            type="date"
            value={formData.estimatedStartDate}
            onChange={(e) => setFormData({...formData, estimatedStartDate: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Estimated End Date *</Label>
          <Input
            type="date"
            value={formData.estimatedEndDate}
            onChange={(e) => setFormData({...formData, estimatedEndDate: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Estimated Collection Amount (tons)</Label>
        <Input
          type="number"
          value={formData.collectionData.estimatedAmount}
          onChange={(e) => setFormData({
            ...formData, 
            collectionData: {
              ...formData.collectionData,
              estimatedAmount: parseFloat(e.target.value) || 0
            }
          })}
          placeholder="0"
          min="0"
          step="0.1"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Create Session
        </Button>
      </div>
    </form>
  );
};

interface SessionDetailsProps {
  session: CollectionSession;
  onUpdate: (updates: Partial<CollectionSession>) => void;
}

const SessionDetails = ({ session, onUpdate }: SessionDetailsProps) => {
  const [newComment, setNewComment] = useState("");
  const [newProblem, setNewProblem] = useState({
    description: "",
    priority: "medium" as const,
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: CollectionComment = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      authorId: "1",
      authorName: "Current User",
      comment: newComment,
      timestamp: new Date().toISOString(),
      type: "general",
    };

    onUpdate({
      comments: [...session.comments, comment]
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
      problems: [...session.problems, problem]
    });
    setNewProblem({ description: "", priority: "medium" });
  };

  const handleResolveProblem = (problemId: string, resolution: string) => {
    const updatedProblems = session.problems.map(p => 
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
  };

  const handleStatusChange = (status: CollectionSession['status']) => {
    const updates: Partial<CollectionSession> = { status };
    
    if (status === "in-progress" && !session.actualStartDate) {
      updates.actualStartDate = new Date().toISOString();
    } else if (status === "completed" && !session.actualEndDate) {
      updates.actualEndDate = new Date().toISOString();
      // Calculate total time spent
      if (session.actualStartDate) {
        const start = new Date(session.actualStartDate);
        const end = new Date();
        const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
        updates.totalTimeSpent = hours;
      }
    }
    
    onUpdate(updates);
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="problems">
          Problems
          {session.problems.filter(p => p.status === 'open').length > 0 && (
            <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
              {session.problems.filter(p => p.status === 'open').length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Session Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <div className="flex gap-2">
                  <Badge variant={getStatusColor(session.status)}>{session.status}</Badge>
                  <Select value={session.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-32 h-6">
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
                <span>{session.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span>{session.siteLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coordinator:</span>
                <span>{session.coordinatorName}</span>
              </div>
              {session.totalTimeSpent && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Spent:</span>
                  <span>{session.totalTimeSpent} hours</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Efficiency:</span>
                <span>{session.performance.efficiency}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quality:</span>
                <span>{session.performance.quality}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Punctuality:</span>
                <span>{session.performance.punctuality}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="problems" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report New Problem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Problem Description</Label>
              <Textarea
                value={newProblem.description}
                onChange={(e) => setNewProblem({...newProblem, description: e.target.value})}
                placeholder="Describe the problem..."
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={newProblem.priority} 
                onValueChange={(value: any) => setNewProblem({...newProblem, priority: value})}
              >
                <SelectTrigger className="w-32">
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
            <Button onClick={handleAddProblem} className="bg-green-600 hover:bg-green-700">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Problem
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {session.problems.map((problem) => (
            <Card key={problem.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <Badge variant={problem.status === 'resolved' ? 'default' : 'destructive'}>
                      {problem.status}
                    </Badge>
                    <Badge variant="outline">{problem.priority}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(problem.reportedDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mb-2">{problem.description}</p>
                <p className="text-xs text-muted-foreground">Reported by: {problem.reportedBy}</p>
                
                {problem.status === 'open' && (
                  <div className="mt-3 space-y-2">
                    <Label>Resolution</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter resolution..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleResolveProblem(problem.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={(e) => {
                          const input = e.currentTarget.parentElement?.querySelector('input');
                          if (input?.value) {
                            handleResolveProblem(problem.id, input.value);
                            input.value = '';
                          }
                        }}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {problem.resolution && (
                  <div className="mt-2 p-2 bg-muted rounded">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Comment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <Button onClick={handleAddComment} className="bg-green-600 hover:bg-green-700">
              <MessageSquare className="mr-2 h-4 w-4" />
              Add Comment
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {session.comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{comment.authorName}</span>
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

      <TabsContent value="reports" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <p className="text-sm">{session.actualStartDate ? new Date(session.actualStartDate).toLocaleString() : 'Not started'}</p>
              </div>
              <div>
                <Label>End Time</Label>
                <p className="text-sm">{session.actualEndDate ? new Date(session.actualEndDate).toLocaleString() : 'Not completed'}</p>
              </div>
              <div>
                <Label>Problems Faced</Label>
                <p className="text-sm">{session.problems.length} total problems</p>
              </div>
              <div>
                <Label>Problems Resolved</Label>
                <p className="text-sm">{session.problems.filter(p => p.status === 'resolved').length} resolved</p>
              </div>
            </div>
            
            <div className="pt-4">
              <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                <FileText className="mr-2 h-4 w-4" />
                Generate Full Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

function getStatusColor(status: string) {
  switch (status) {
    case "planned": return "secondary";
    case "in-progress": return "default";
    case "completed": return "default";
    case "cancelled": return "destructive";
    default: return "secondary";
  }
}
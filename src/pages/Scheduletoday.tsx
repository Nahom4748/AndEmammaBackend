import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Truck, RefreshCw, X, User, Phone, Mail, Building, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ScheduleItem {
  supplier: string;
  location: string;
  assignedTo: string;
  type: string;
  status: string;
  // Additional details that might be available from the backend
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

interface UpcomingDay {
  day: string;
  count: number;
}

interface ScheduleData {
  schedule: ScheduleItem[];
  upcomingWeek: UpcomingDay[];
}

const ScheduleToday = () => {
  const { toast } = useToast();
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Format current date as YYYY-MM-DD
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setCurrentDate(formattedDate);
    
    fetchScheduleData(formattedDate);
  }, []);

  const fetchScheduleData = async (date: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/weekly-plan/${date}`);
      setScheduleData(response.data);
    } catch (error) {
      console.error("Error fetching schedule data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch schedule data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    fetchScheduleData(currentDate);
  };

  const handleViewDetails = (item: ScheduleItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "regular":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "instore":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading schedule data...</p>
        </div>
      </div>
    );
  }

  if (!scheduleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load schedule data</p>
          <Button onClick={refreshData} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const completedCount = scheduleData.schedule.filter(item => item.status === "completed").length;
  const inProgressCount = scheduleData.schedule.filter(item => item.status === "in-progress").length;
  const pendingCount = scheduleData.schedule.filter(item => item.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6 space-y-6">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Collection Schedule</h1>
              <p className="text-sm text-muted-foreground">Today's collection activities</p>
            </div>
          </div>
          <div className="ml-auto">
            <Button variant="outline" onClick={refreshData} size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Today's Schedule
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduleData.schedule.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No collections scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduleData.schedule.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.supplier}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{item.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate">{item.assignedTo}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Badge variant="outline" className={getTypeColor(item.type)}>
                          {item.type}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 sm:mt-0"
                          onClick={() => handleViewDetails(item)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Overview and Stats */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Weekly Overview</CardTitle>
              <CardDescription>Upcoming collections this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduleData.upcomingWeek.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm">
                    <div>
                      <div className="font-medium">{day.day}</div>
                      <div className="text-sm text-muted-foreground">
                        {day.count} collection{day.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {day.count > 0 && (
                      <Badge variant={day.count > 5 ? "destructive" : "secondary"}>
                        {day.count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                  <span className="text-sm">Today's Total</span>
                  <span className="font-medium text-lg">{scheduleData.schedule.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                  <span className="text-sm">Completed</span>
                  <span className="font-medium text-green-600">{completedCount}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50">
                  <span className="text-sm">In Progress</span>
                  <span className="font-medium text-blue-600">{inProgressCount}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-yellow-50">
                  <span className="text-sm">Pending</span>
                  <span className="font-medium text-yellow-600">{pendingCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Collection Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this collection
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedItem.supplier}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{selectedItem.location}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getTypeColor(selectedItem.type)}>
                    {selectedItem.type}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(selectedItem.status)}>
                    {selectedItem.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Assignment</h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedItem.assignedTo}</span>
                  </div>
                  
                  {selectedItem.contactPerson && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedItem.contactPerson}</span>
                    </div>
                  )}
                  
                  {selectedItem.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedItem.phone}</span>
                    </div>
                  )}
                  
                  {selectedItem.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedItem.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Location</h4>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedItem.location}</span>
                  </div>
                  
                  <Button variant="outline" size="sm" className="mt-2">
                    <Navigation className="mr-2 h-4 w-4" />
                    Open in Maps
                  </Button>
                </div>
              </div>
              
              {selectedItem.notes && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">Additional Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {selectedItem.notes}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Supplier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleToday;
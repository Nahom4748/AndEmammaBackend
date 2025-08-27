import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";


interface CollectionItem {
  id: number;
  plan_date: string;
  collection_type: string;
  company_name: string;
  contact_person: string;
  phone: string;
  location: string;
  status?: "pending" | "in-progress" | "completed";
}

interface WeeklyPlanResponse {
  success: boolean;
  data: CollectionItem[];
}

const Schedule = () => {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>("Monday");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Generate vibrant colors for different companies
  const companyColors: Record<string, string> = {
    "wolde bacnk": "bg-blue-100 text-blue-800",
    "Addis Ababa University": "bg-purple-100 text-purple-800",
    "FDRE Ministry of Justice": "bg-green-100 text-green-800",
    "Ethiopian Chamber of Commerce": "bg-orange-100 text-orange-800",
    "AACA Farms Commission": "bg-pink-100 text-pink-800",
    "Kotebe Educational University": "bg-indigo-100 text-indigo-800",
  };

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        setLoading(true);
        
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() - today.getDay() + 6); // Saturday
        
        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        
        const response = await axios.get<WeeklyPlanResponse>(
          `http://localhost:5000/api/weeklyplan?start_date=${formatDate(startOfWeek)}&end_date=${formatDate(endOfWeek)}`
        );
        
        if (!response.data.success) {
          throw new Error('Failed to fetch weekly plan data');
        }

        // Add random status for demo purposes
        const statuses: ("pending" | "in-progress" | "completed")[] = ["pending", "in-progress", "completed"];
        const dataWithStatus = response.data.data.map(item => ({
          ...item,
          status: statuses[Math.floor(Math.random() * statuses.length)]
        }));

        setCollections(dataWithStatus);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error("Error fetching weekly data:", err);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeeklyData();
  }, []);

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getCollectionsByDay = (day: string) => {
    return collections.filter(item => getDayName(item.plan_date) === day);
  };

  const getDaysUpToSaturday = () => {
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCompletionPercentage = (day: string) => {
    const dayCollections = getCollectionsByDay(day);
    if (dayCollections.length === 0) return 0;
    
    const completed = dayCollections.filter(c => c.status === "completed").length;
    return Math.round((completed / dayCollections.length) * 100);
  };

  const toggleDayExpand = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day);
    setSelectedDay(day);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl font-medium mb-4">Error: {error}</div>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Weekly Collection Schedule
            </h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {getDaysUpToSaturday().map((day) => {
          const dayCollections = getCollectionsByDay(day);
          const urgentCount = dayCollections.filter(c => c.collection_type === 'Instore').length;
          const completion = getCompletionPercentage(day);
          
          return (
            <div 
              key={day}
              className={`rounded-xl p-3 cursor-pointer transition-all shadow-sm ${
                selectedDay === day 
                  ? 'bg-white border-2 border-blue-400 shadow-md' 
                  : 'bg-white border hover:border-blue-200'
              }`}
              onClick={() => toggleDayExpand(day)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{day.substring(0, 3)}</h3>
                  <p className="text-xs text-muted-foreground">
                    {dayCollections.length} collections
                  </p>
                </div>
                {urgentCount > 0 && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                    {urgentCount}
                  </Badge>
                )}
              </div>
              
              <Progress 
                value={completion} 
                className="h-2 mt-2 bg-gray-200" 
                indicatorColor={completion > 70 ? "bg-green-500" : completion > 30 ? "bg-yellow-500" : "bg-red-500"}
              />
              
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted-foreground">
                  {completion}% done
                </span>
                {expandedDay === day ? (
                  <ChevronUp className="h-4 w-4 text-blue-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <Card className="rounded-xl shadow-sm border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className={`w-2 h-6 rounded-full ${
                  selectedDay === "Monday" ? "bg-blue-500" :
                  selectedDay === "Tuesday" ? "bg-purple-500" :
                  selectedDay === "Wednesday" ? "bg-green-500" :
                  selectedDay === "Thursday" ? "bg-yellow-500" :
                  selectedDay === "Friday" ? "bg-orange-500" : "bg-red-500"
                }`}></span>
                {selectedDay}'s Collections
              </CardTitle>
              <Badge variant="outline" className="px-3 py-1">
                {getCollectionsByDay(selectedDay).length} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {getCollectionsByDay(selectedDay).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No collections scheduled for {selectedDay}
              </div>
            ) : (
              <div className="space-y-3">
                {getCollectionsByDay(selectedDay).map((collection) => (
                  <div 
                    key={collection.id} 
                    className={`rounded-lg p-4 transition-all ${
                      companyColors[collection.company_name] || "bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{collection.company_name}</h4>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(collection.plan_date)}
                          <MapPin className="h-3 w-3 ml-1" />
                          {collection.location}
                        </div>
                      </div>
                      <Badge 
                        variant={collection.collection_type === 'Instore' ? 'destructive' : 'default'}
                        className="ml-2"
                      >
                        {collection.collection_type}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        <span>{collection.contact_person}</span>
                      </div>
                      <Badge className={getStatusColor(collection.status || "pending")}>
                        {collection.status}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>{collection.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Schedule;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Truck } from "lucide-react";

const Schedule = () => {
  const todaySchedule = [
    {
      time: "08:00",
      supplier: "Addis Ababa University",
      location: "4 Kilo Campus",
      carType: "sefu",
      type: "regular",
      status: "pending",
    },
    {
      time: "09:30",
      supplier: "FDRE Ministry of Justice",
      location: "Main Office",
      carType: "abrar",
      type: "regular",
      status: "in-progress",
    },
    {
      time: "11:00",
      supplier: "Ethiopian Chamber of Commerce",
      location: "Headquarters",
      carType: "sefu",
      type: "regular",
      status: "completed",
    },
    {
      time: "14:00",
      supplier: "AACA Farms Commission",
      location: "Head Office",
      carType: "adisu",
      type: "instore",
      status: "pending",
    },
    {
      time: "15:30",
      supplier: "Kotebe Educational University",
      location: "Main Campus",
      carType: "sefu",
      type: "regular",
      status: "pending",
    },
  ];

  const upcomingWeek = [
    { day: "Monday", count: 8, urgent: 2 },
    { day: "Tuesday", count: 12, urgent: 1 },
    { day: "Wednesday", count: 15, urgent: 3 },
    { day: "Thursday", count: 18, urgent: 2 },
    { day: "Friday", count: 10, urgent: 1 },
    { day: "Saturday", count: 6, urgent: 0 },
    { day: "Sunday", count: 3, urgent: 0 },
  ];

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold">Collection Schedule</h1>
            <p className="text-muted-foreground">Manage daily and weekly collection schedules</p>
          </div>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
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
              <div className="space-y-4">
                {todaySchedule.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground w-16">
                      {item.time}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.supplier}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                        <Truck className="h-3 w-3 ml-2" />
                        {item.carType}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{item.type}</Badge>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Overview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Overview</CardTitle>
              <CardDescription>Upcoming collections this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingWeek.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{day.day}</div>
                      <div className="text-sm text-muted-foreground">
                        {day.count} collections
                      </div>
                    </div>
                    {day.urgent > 0 && (
                      <Badge variant="destructive">{day.urgent} urgent</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Today's Total</span>
                  <span className="font-medium">5 collections</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completed</span>
                  <span className="font-medium text-green-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">In Progress</span>
                  <span className="font-medium text-blue-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pending</span>
                  <span className="font-medium text-yellow-600">3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Schedule;

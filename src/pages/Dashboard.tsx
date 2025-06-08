
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Truck, Users, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const Dashboard = () => {
  // Mock data for charts
  const weeklyData = [
    { day: 'Mon', regular: 12, instore: 8 },
    { day: 'Tue', regular: 15, instore: 12 },
    { day: 'Wed', regular: 18, instore: 15 },
    { day: 'Thu', regular: 22, instore: 18 },
    { day: 'Fri', regular: 14, instore: 10 },
    { day: 'Sat', regular: 8, instore: 5 },
    { day: 'Sun', regular: 4, instore: 2 },
  ];

  const collectionTypeData = [
    { name: 'Carton', value: 35, color: '#0088FE' },
    { name: 'Mixed', value: 28, color: '#00C49F' },
    { name: 'SW', value: 20, color: '#FFBB28' },
    { name: 'SC', value: 12, color: '#FF8042' },
    { name: 'NP', value: 5, color: '#8884D8' },
  ];

  const monthlyTrend = [
    { month: 'Jan', collections: 245 },
    { month: 'Feb', collections: 280 },
    { month: 'Mar', collections: 320 },
    { month: 'Apr', collections: 295 },
    { month: 'May', collections: 385 },
  ];

  const stats = [
    {
      title: "Total Collections",
      value: "1,247",
      description: "This month",
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Suppliers",
      value: "84",
      description: "Organizations",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Scheduled Today",
      value: "23",
      description: "Collections",
      icon: CalendarDays,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Monthly Reports",
      value: "12",
      description: "Generated",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Collection management overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Collections</CardTitle>
              <CardDescription>Regular vs In-store collections this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="regular" fill="#0088FE" name="Regular" />
                  <Bar dataKey="instore" fill="#00C49F" name="In-store" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collection Types</CardTitle>
              <CardDescription>Distribution of collection types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={collectionTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {collectionTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Collection Trends</CardTitle>
              <CardDescription>Total collections per month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="collections" stroke="#0088FE" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Top Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Addis Ababa University</span>
                    <span className="text-sm font-medium">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">FDRE Ministry of Justice</span>
                    <span className="text-sm font-medium">38</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">AACA Farms Commission</span>
                    <span className="text-sm font-medium">32</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Active Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Thursday</span>
                    <span className="text-sm font-medium">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Wednesday</span>
                    <span className="text-sm font-medium">142</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Friday</span>
                    <span className="text-sm font-medium">138</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">On Time</span>
                    <span className="text-sm font-medium text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Delayed</span>
                    <span className="text-sm font-medium text-yellow-600">4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Missed</span>
                    <span className="text-sm font-medium text-red-600">2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

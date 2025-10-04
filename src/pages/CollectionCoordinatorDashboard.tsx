import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Target, 
  Calendar, 
  Users, 
  Package, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  Clock,
  RefreshCw,
  Truck,
  MapPin,
  Star
} from "lucide-react";

interface DashboardData {
  month_total_kg: string;
  week_total_kg: string;
  today_total_kg: string;
  total_suppliers: number;
  month_suppliers: number;
  week_daily: {
    day_name: string;
    total_kg: string;
  }[];
}

const CollectionCoordinatorDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const monthlyTarget = 15000; // Monthly target in kg

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/collectioncorninatordashbord');
      const data = await response.json();
      
      if (data.message && data.message.includes("successfully")) {
        setDashboardData(data.data);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate performance metrics
  const monthlyAchieved = dashboardData ? parseFloat(dashboardData.month_total_kg) : 0;
  const achievementPercentage = (monthlyAchieved / monthlyTarget) * 100;
  const isTargetAchieved = monthlyAchieved >= monthlyTarget;
  const remainingKg = Math.max(0, monthlyTarget - monthlyAchieved);

  // Prepare chart data
  const weekChartData = dashboardData?.week_daily.map(day => ({
    name: day.day_name.substring(0, 3),
    kg: parseFloat(day.total_kg),
    fullName: day.day_name
  })) || [];

  const performanceData = [
    { name: 'Achieved', value: monthlyAchieved },
    { name: 'Remaining', value: Math.max(0, monthlyTarget - monthlyAchieved) }
  ];

  const COLORS = ['#10b981', '#ef4444'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Collection Dashboard
              </h1>
              <p className="text-green-700">Performance analytics and metrics</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Collection Coordinator Dashboard
            </h1>
            <p className="text-green-700">Real-time performance analytics and metrics</p>
          </div>
        </div>
        <Button 
          onClick={fetchDashboardData} 
          variant="outline" 
          className="border-green-200 text-green-700 hover:bg-green-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Monthly Performance */}
        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Monthly Collection</p>
                <h3 className="text-3xl font-bold mt-2">{dashboardData?.month_total_kg} kg</h3>
                <div className="flex items-center gap-2 mt-3">
                  <Target className="h-4 w-4" />
                  <span className="text-green-100 text-sm">Target: 15,000 kg</span>
                </div>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Award className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-green-100 mb-1">
                <span>Progress</span>
                <span>{achievementPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${Math.min(achievementPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Performance */}
        <Card className="bg-white shadow-lg border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Weekly Collection</p>
                <h3 className="text-3xl font-bold text-green-800 mt-2">{dashboardData?.week_total_kg} kg</h3>
                <div className="flex items-center gap-2 mt-3">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 text-sm">This Week</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Collection */}
        <Card className="bg-white shadow-lg border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Today's Collection</p>
                <h3 className="text-3xl font-bold text-green-800 mt-2">{dashboardData?.today_total_kg} kg</h3>
                <div className="flex items-center gap-2 mt-3">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 text-sm">Daily Performance</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers */}
        <Card className="bg-white shadow-lg border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Active Suppliers</p>
                <h3 className="text-3xl font-bold text-green-800 mt-2">{dashboardData?.total_suppliers}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 text-sm">{dashboardData?.month_suppliers} this month</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance Chart */}
        <Card className="shadow-lg border-green-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="h-5 w-5" />
              Weekly Collection Trend
            </CardTitle>
            <CardDescription>Daily collection performance for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `${value}kg`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} kg`, 'Collection']}
                    labelFormatter={(label) => `Day: ${label}`}
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #d1fae5',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="kg" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="Collection"
                  >
                    {weekChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.kg > 0 ? '#10b981' : '#d1fae5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Target Progress */}
        <Card className="shadow-lg border-green-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Target className="h-5 w-5" />
              Monthly Target Progress
            </CardTitle>
            <CardDescription>
              {isTargetAchieved ? (
                <span className="text-green-600 font-semibold">
                  🎉 Target Achieved! Excellent work!
                </span>
              ) : (
                <span>
                  {remainingKg.toLocaleString()} kg remaining to reach monthly target
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) => 
                      `${name}: ${value.toLocaleString()}kg (${(percent * 100).toFixed(1)}%)`
                    }
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} kg`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Achievement Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {monthlyAchieved.toLocaleString()} kg
                </div>
                <div className="text-sm text-green-600">Achieved</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">
                  {remainingKg.toLocaleString()} kg
                </div>
                <div className="text-sm text-red-600">Remaining</div>
              </div>
            </div>

            {/* Achievement Badge */}
            {isTargetAchieved && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white text-center">
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-6 w-6" />
                  <span className="font-bold">Monthly Target Achieved!</span>
                  <Star className="h-6 w-6" />
                </div>
                <p className="text-sm mt-1">
                  You've collected {monthlyAchieved.toLocaleString()} kg this month
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Score */}
        <Card className="shadow-lg border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-green-700 font-semibold">Performance Score</p>
                <div className="text-2xl font-bold text-green-800">
                  {Math.min(achievementPercentage, 100).toFixed(0)}/100
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Daily */}
        <Card className="shadow-lg border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-blue-700 font-semibold">Avg. Daily Collection</p>
                <div className="text-2xl font-bold text-blue-800">
                  {dashboardData ? (parseFloat(dashboardData.week_total_kg) / 7).toFixed(0) : 0} kg/day
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Rating */}
        <Card className="shadow-lg border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-purple-700 font-semibold">Efficiency Rating</p>
                <div className="text-2xl font-bold text-purple-800">
                  {achievementPercentage >= 100 ? 'Excellent' : 
                   achievementPercentage >= 75 ? 'Good' :
                   achievementPercentage >= 50 ? 'Average' : 'Needs Improvement'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Quick Actions</CardTitle>
          <CardDescription>Manage your collection activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Truck className="h-4 w-4 mr-2" />
              Start New Collection
            </Button>
            <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
              <MapPin className="h-4 w-4 mr-2" />
              View Collection Routes
            </Button>
            <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
              <Users className="h-4 w-4 mr-2" />
              Manage Suppliers
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionCoordinatorDashboard;
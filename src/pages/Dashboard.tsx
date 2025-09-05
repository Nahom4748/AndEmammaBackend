import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Truck, Users, FileText, BarChart3, Package, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { LucideProps } from 'lucide-react';

// API base URL
const API_BASE_URL = 'http://localhost:5000';

interface StatItem {
  title: string;
  value: string;
  description: string;
}

interface ProcessedCollectionTypeData {
  name: string;
  value: number;
  color: string;
}

interface WeeklyData {
  day: string;
  regular: number;
  instore: number;
}

interface MonthlyTrend {
  month: string;
  collections: number;
}

interface SupplierStat {
  name: string;
  value: number;
}

interface ActiveDay {
  day: string;
  total_collections: number;
  total_kg_collected: number;
}

interface StatConfig {
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  color: string;
  bgColor: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [collectionTypeData, setCollectionTypeData] = useState<ProcessedCollectionTypeData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<SupplierStat[]>([]);
  const [activeDays, setActiveDays] = useState<ActiveDay[]>([]);
  const [loading, setLoading] = useState({
    stats: true,
    collectionTypes: true,
    weeklyData: true,
    monthlyTrend: true,
    suppliers: true,
    activeDays: true
  });
  const [error, setError] = useState({
    stats: '',
    collectionTypes: '',
    weeklyData: '',
    monthlyTrend: '',
    suppliers: '',
    activeDays: ''
  });

  // Icons and colors for stats cards - updated to match the API response
  const statConfigs: Record<string, StatConfig> = {
    "Total Collections (kg)": { icon: Package, color: "text-blue-600", bgColor: "bg-blue-50" },
    "Active Suppliers": { icon: Users, color: "text-green-600", bgColor: "bg-green-50" },
    "Scheduled Today": { icon: CalendarDays, color: "text-orange-600", bgColor: "bg-orange-50" },
    "Monthly Reports": { icon: FileText, color: "text-purple-600", bgColor: "bg-purple-50" },
    "Weekly Regular Collections (kg)": { icon: BarChart3, color: "text-indigo-600", bgColor: "bg-indigo-50" },
    "Weekly Instore Collections (kg)": { icon: Target, color: "text-pink-600", bgColor: "bg-pink-50" }
  };

  // Default config for any unexpected stat titles
  const defaultConfig: StatConfig = { icon: BarChart3, color: "text-gray-600", bgColor: "bg-gray-50" };

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/getDashboardStats`);
        if (response.data.status === 'success') {
          setStats(response.data.data);
        }
      } catch (err) {
        setError(prev => ({...prev, stats: 'Failed to load dashboard statistics'}));
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(prev => ({...prev, stats: false}));
      }
    };

    fetchStats();
  }, []);

  // Fetch collection type data
  useEffect(() => {
    const fetchCollectionTypeData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/getCollectionTypeData`);
        if (response.data.status === 'success') {
          const processedData = response.data.data
            .map(item => ({
              ...item,
              value: parseFloat(item.value) || 0
            }))
            .filter(item => item.value > 0);

          setCollectionTypeData(processedData);
        }
      } catch (err) {
        setError(prev => ({...prev, collectionTypes: 'Failed to load collection type data'}));
        console.error("Error fetching collection type data:", err);
      } finally {
        setLoading(prev => ({...prev, collectionTypes: false}));
      }
    };

    fetchCollectionTypeData();
  }, []);

  // Fetch weekly data
  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/collection/getWeeklyCollectionData`);
        if (response.data.status === 'success') {
          setWeeklyData(response.data.data);
        }
      } catch (err) {
        setError(prev => ({...prev, weeklyData: 'Failed to load weekly collection data'}));
        console.error("Error fetching weekly data:", err);
      } finally {
        setLoading(prev => ({...prev, weeklyData: false}));
      }
    };

    fetchWeeklyData();
  }, []);

  // Fetch monthly trend data
  useEffect(() => {
    const fetchMonthlyTrend = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/getMonthlyTrendData`);
        if (response.data.status === 'success') {
          setMonthlyTrend(response.data.data);
        }
      } catch (err) {
        setError(prev => ({...prev, monthlyTrend: 'Failed to load monthly trend data'}));
        console.error("Error fetching monthly trend:", err);
      } finally {
        setLoading(prev => ({...prev, monthlyTrend: false}));
      }
    };

    fetchMonthlyTrend();
  }, []);

  // Fetch top suppliers
  useEffect(() => {
    const fetchTopSuppliers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/suppliers-stats`);
        if (response.data.status === 'success') {
          setTopSuppliers(response.data.data);
        }
      } catch (err) {
        setError(prev => ({...prev, suppliers: 'Failed to load top suppliers data'}));
        console.error("Error fetching top suppliers:", err);
      } finally {
        setLoading(prev => ({...prev, suppliers: false}));
      }
    };

    fetchTopSuppliers();
  }, []);

  // Fetch most active days
  useEffect(() => {
    const fetchActiveDays = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/most-active-days`);
        if (response.data.status === 'success') {
          setActiveDays(response.data.data);
        }
      } catch (err) {
        setError(prev => ({...prev, activeDays: 'Failed to load active days data'}));
        console.error("Error fetching active days:", err);
      } finally {
        setLoading(prev => ({...prev, activeDays: false}));
      }
    };

    fetchActiveDays();
  }, []);

  // Format large numbers with commas
  const formatNumber = (num: string) => {
    const number = parseFloat(num);
    if (isNaN(number)) return num;
    
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading.stats ? (
          Array(6).fill(0).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="p-2 rounded-lg bg-gray-200">
                  <div className="h-4 w-4 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-7 w-20 bg-gray-200 rounded mt-1" />
                <div className="h-3 w-28 bg-gray-200 rounded mt-2" />
              </CardContent>
            </Card>
          ))
        ) : error.stats ? (
          <div className="col-span-6 text-red-500 text-center py-4">{error.stats}</div>
        ) : (
          stats.map((stat, index) => {
            const config = statConfigs[stat.title] || defaultConfig;
            const Icon = config.icon;
            
            return (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stat.value)}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
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
              {loading.weeklyData ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-gray-500">Loading weekly data...</div>
                </div>
              ) : error.weeklyData ? (
                <div className="h-[300px] flex items-center justify-center text-red-500">
                  {error.weeklyData}
                </div>
              ) : weeklyData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-gray-500">No weekly data available</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(2)} kg`, 'Weight']}
                    />
                    <Legend />
                    <Bar dataKey="regular" fill="#0088FE" name="Regular" />
                    <Bar dataKey="instore" fill="#00C49F" name="In-store" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collection Types</CardTitle>
              <CardDescription>Distribution of collection types by weight</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.collectionTypes ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-gray-500">Loading collection types...</div>
                </div>
              ) : error.collectionTypes ? (
                <div className="h-[300px] flex items-center justify-center text-red-500">
                  {error.collectionTypes}
                </div>
              ) : collectionTypeData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-gray-500">No collection data available</div>
                </div>
              ) : (
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
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {collectionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(2)} kg`, 'Weight']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
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
              {loading.monthlyTrend ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-gray-500">Loading monthly trends...</div>
                </div>
              ) : error.monthlyTrend ? (
                <div className="h-[400px] flex items-center justify-center text-red-500">
                  {error.monthlyTrend}
                </div>
              ) : monthlyTrend.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-gray-500">No trend data available</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value}`, 'Collections']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="collections" 
                      stroke="#0088FE" 
                      strokeWidth={2} 
                      name="Collections"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Top Suppliers</CardTitle>
                <CardDescription>By collection volume</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.suppliers ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="flex justify-between">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : error.suppliers ? (
                  <div className="text-red-500">{error.suppliers}</div>
                ) : topSuppliers.length === 0 ? (
                  <div className="text-gray-500">No supplier data available</div>
                ) : (
                  <div className="space-y-3">
                    {topSuppliers.map((supplier, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{supplier.name}</span>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {supplier.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Active Days</CardTitle>
                <CardDescription>By collection count and weight</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.activeDays ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="flex justify-between">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : error.activeDays ? (
                  <div className="text-red-500">{error.activeDays}</div>
                ) : activeDays.length === 0 ? (
                  <div className="text-gray-500">No active days data available</div>
                ) : (
                  <div className="space-y-3">
                    {activeDays.map((day, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">{day.day}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">{day.total_collections} collections</div>
                          <div className="text-xs text-muted-foreground">{day.total_kg_collected} kg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection Efficiency</CardTitle>
                <CardDescription>Performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">On Time Rate</span>
                    <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Collection Completion</span>
                    <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">88%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Quality Issues</span>
                    <span className="text-sm font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Missed Collections</span>
                    <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">2%</span>
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
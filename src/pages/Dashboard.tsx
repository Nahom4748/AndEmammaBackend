import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Truck, Users, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { LucideProps } from 'lucide-react';

interface StatItem {
  title: string;
  value: string;
  description: string;
}

interface CollectionTypeData {
  name: string;
  value: string;
  color: string;
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

  // Icons and colors for stats cards
  const statConfigs: StatConfig[] = [
    { icon: Truck, color: "text-blue-600", bgColor: "bg-blue-50" },
    { icon: Users, color: "text-green-600", bgColor: "bg-green-50" },
    { icon: CalendarDays, color: "text-orange-600", bgColor: "bg-orange-50" },
    { icon: FileText, color: "text-purple-600", bgColor: "bg-purple-50" },
  ];

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/getDashboardStats');
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
        const response = await axios.get('http://localhost:5000/api/getCollectionTypeData');
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
        const response = await axios.get('http://localhost:5000/api/collection/getWeeklyCollectionData');
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
        const response = await axios.get('http://localhost:5000/api/getMonthlyTrendData');
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
        const response = await axios.get('http://localhost:5000/api/suppliers-stats');
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
        const response = await axios.get('http://localhost:5000/api/most-active-days');
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
        {loading.stats ? (
          Array(4).fill(0).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                <div className="p-2 rounded-lg bg-gray-50">
                  <div className="h-4 w-4 bg-gray-200 rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                <p className="h-4 w-24 bg-gray-200 rounded mt-2 animate-pulse" />
              </CardContent>
            </Card>
          ))
        ) : error.stats ? (
          <div className="col-span-4 text-red-500">{error.stats}</div>
        ) : (
          stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${statConfigs[index].bgColor}`}>
                  {(() => {
                    const Icon = statConfigs[index].icon;
                    return <Icon className={`h-4 w-4 ${statConfigs[index].color}`} />;
                  })()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))
        )}
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
              {loading.weeklyData ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-gray-500">Loading weekly data...</div>
                </div>
              ) : error.weeklyData ? (
                <div className="h-[300px] flex items-center justify-center text-red-500">
                  {error.weeklyData}
                </div>
              ) : (
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
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="collections" 
                      stroke="#0088FE" 
                      strokeWidth={2} 
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
                  <div className="space-y-2">
                    {topSuppliers.map((supplier, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm">{supplier.name}</span>
                        <span className="text-sm font-medium">{supplier.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Active Days</CardTitle>
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
                  <div className="space-y-2">
                    {activeDays.map((day, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm">{day.day}</span>
                        <span className="text-sm font-medium">
                          {day.total_collections} ({day.total_kg_collected} kg)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
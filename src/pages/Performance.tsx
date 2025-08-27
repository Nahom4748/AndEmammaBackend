import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, TrendingUp, Users, Store, FileText, Box, Target, CheckCircle, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const Performance = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [collectionTypes, setCollectionTypes] = useState([]);
  const [collectionSummary, setCollectionSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("marketers");

  // Collection targets
  const TARGETS = {
    INSTORE: 25000, // 25,000 kg target
    REGULAR: 15000  // 15,000 kg target
  };

  // Fetch data from backend APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await fetch('http://localhost:5000/users');
        const usersData = await usersResponse.json();
        if (usersData.status === 'success') {
          setUsers(usersData.data);
        }
        
        // Fetch collection types
        const typesResponse = await fetch('http://localhost:5000/collectionstype');
        const typesData = await typesResponse.json();
        if (typesData.status === 'success') {
          setCollectionTypes(typesData.data);
        }
        
        // Fetch collection summary
        const summaryResponse = await fetch('http://localhost:5000/api/collection/summary');
        const summaryData = await summaryResponse.json();
        if (summaryData.status === 'success') {
          setCollectionSummary(summaryData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter only marketers from users
  const marketers = users.filter(user => user.company_role_name === "Marketer");

  // Prepare data for charts
  const collectionTypeData = [
    { 
      name: 'InStore', 
      value: collectionSummary?.instoreKg || 0,
      target: TARGETS.INSTORE,
      progress: collectionSummary ? (collectionSummary.instoreKg / TARGETS.INSTORE) * 100 : 0
    },
    { 
      name: 'Regular', 
      value: collectionSummary?.regularKg || 0,
      target: TARGETS.REGULAR,
      progress: collectionSummary ? (collectionSummary.regularKg / TARGETS.REGULAR) * 100 : 0
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleExportReport = () => {
    console.log("Exporting performance report...");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-80" />
            </div>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(item => (
            <Card key={item}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="marketers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </TabsList>
          
          <TabsContent value="marketers" className="space-y-6">
            <Skeleton className="h-80 w-full" />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold">Performance Dashboard</h1>
            <p className="text-muted-foreground">
              Collection Performance Analytics
            </p>
          </div>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Marketers</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketers.length}</div>
            <p className="text-xs text-muted-foreground">Active personnel</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collection</CardTitle>
            <Box className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionSummary ? (collectionSummary.totalKg / 1000).toFixed(1) + 't' : '0t'}</div>
            <p className="text-xs text-muted-foreground">Total weight collected</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Types</CardTitle>
            <Store className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionTypes.length}</div>
            <p className="text-xs text-muted-foreground">InStore & Regular</p>
          </CardContent>
        </Card>
      </div>

      {/* Target Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Monthly Collection Targets
          </CardTitle>
          <CardDescription>Progress toward monthly collection goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {collectionTypeData.map((type, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{type.name} Collection</div>
                  <div className="flex items-center gap-2">
                    <div className={`text-sm font-semibold ${type.progress >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                      {type.value.toLocaleString()} / {type.target.toLocaleString()} kg
                    </div>
                    {type.progress >= 100 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </div>
                <Progress value={type.progress > 100 ? 100 : type.progress} 
                  className={type.progress >= 100 ? "bg-green-100" : ""} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Target: {type.target.toLocaleString()} kg</span>
                  <span>{Math.round(type.progress)}% Complete</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Performance Tabs */}
      <Tabs defaultValue="marketers" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="marketers">Marketer Performance</TabsTrigger>
          <TabsTrigger value="collections">Collection Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="marketers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketer Performance</CardTitle>
              <CardDescription>Current active marketers and their details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {marketers.map((marketer) => (
                  <Card key={marketer.user_id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold">
                            {marketer.first_name[0]}{marketer.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {marketer.first_name} {marketer.last_name}
                          </CardTitle>
                          <CardDescription>{marketer.phone_number}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Status</div>
                          <div className={`font-medium ${marketer.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                            {marketer.status.charAt(0).toUpperCase() + marketer.status.slice(1)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Join Date</div>
                          <div className="font-medium">
                            {new Date(marketer.join_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <div className="text-muted-foreground">Email</div>
                          <div className="font-medium truncate">{marketer.email}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Collection Distribution</CardTitle>
                <CardDescription>By collection type (kg)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={collectionTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {collectionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} kg`, 'Weight']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection vs Targets</CardTitle>
                <CardDescription>Performance against monthly goals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={collectionTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kg`, '']} />
                    <Legend />
                    <Bar dataKey="value" name="Collected" fill="#0088FE" />
                    <Bar dataKey="target" name="Target" fill="#FF8042" opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Collection Summary</CardTitle>
              <CardDescription>Detailed collection metrics with target progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {collectionSummary ? collectionSummary.totalKg.toLocaleString() : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Kg Collected</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {collectionSummary ? collectionSummary.totalSuppliers : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Suppliers</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Collection Types</h4>
                  {collectionTypeData.map((type, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{type.name} Collection</h4>
                            <p className="text-sm text-muted-foreground">
                              {type.value.toLocaleString()} kg of {type.target.toLocaleString()} kg target
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${type.progress >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                            {Math.round(type.progress)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Progress</div>
                        </div>
                      </div>
                      
                      <Progress value={type.progress > 100 ? 100 : type.progress} 
                        className={`h-2 ${type.progress >= 100 ? "bg-green-100" : ""}`} />
                      
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-muted-foreground">Target: {type.target.toLocaleString()} kg</span>
                        <span className="font-medium">{type.value.toLocaleString()} kg Collected</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Phone, Mail, Calendar, Package, DollarSign, TrendingUp, MapPin, Clock } from "lucide-react";
import { marketersData } from "@/data/marketersData";
import { suppliersData } from "@/data/suppliersData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const MamasPerformance = () => {
  // Weekly performance data for each mama
  const weeklyPerformance = [
    { week: 'Week 1', Sefu: 12, Abrar: 8, Adisu: 10, Aberar: 6 },
    { week: 'Week 2', Sefu: 15, Abrar: 11, Adisu: 9, Aberar: 7 },
    { week: 'Week 3', Sefu: 18, Abrar: 13, Adisu: 12, Aberar: 8 },
    { week: 'Week 4', Sefu: 20, Abrar: 15, Adisu: 14, Aberar: 9 },
  ];

  // Monthly earnings data
  const monthlyEarnings = [
    { month: 'Jan', Sefu: 11200, Abrar: 8400, Adisu: 7800, Aberar: 4200 },
    { month: 'Feb', Sefu: 11800, Abrar: 8900, Adisu: 8100, Aberar: 4500 },
    { month: 'Mar', Sefu: 12500, Abrar: 9200, Adisu: 8300, Aberar: 4800 },
    { month: 'Apr', Sefu: 12200, Abrar: 9400, Adisu: 8200, Aberar: 4700 },
    { month: 'May', Sefu: 12250, Abrar: 9450, Adisu: 8350, Aberar: 4900 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="h-8 w-8 text-pink-500" />
              Mamas Performance Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive performance tracking for all mamas (marketers)
            </p>
          </div>
        </div>
        <Button>
          <TrendingUp className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Performance</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Status</TabsTrigger>
          <TabsTrigger value="reports">Daily & Weekly Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Paper Collection Performance</CardTitle>
                <CardDescription>Collections per week by each mama</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Sefu" fill="#0088FE" />
                    <Bar dataKey="Abrar" fill="#00C49F" />
                    <Bar dataKey="Adisu" fill="#FFBB28" />
                    <Bar dataKey="Aberar" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings Trend</CardTitle>
                <CardDescription>Monthly earnings comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Sefu" stroke="#0088FE" strokeWidth={2} />
                    <Line type="monotone" dataKey="Abrar" stroke="#00C49F" strokeWidth={2} />
                    <Line type="monotone" dataKey="Adisu" stroke="#FFBB28" strokeWidth={2} />
                    <Line type="monotone" dataKey="Aberar" stroke="#FF8042" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            {marketersData.map((mama) => (
              <Card key={mama.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    {mama.name}
                  </CardTitle>
                  <Badge variant={mama.status === "active" ? "default" : "secondary"}>
                    {mama.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Collections</span>
                    <span className="font-medium">{mama.totalCollections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Earnings</span>
                    <span className="font-medium">{mama.monthlyEarnings.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Products Made</span>
                    <span className="font-medium">{mama.products.totalProducts}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <div className="grid gap-6">
            {marketersData.map((mama) => (
              <Card key={mama.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Heart className="h-6 w-6 text-pink-500" />
                        {mama.fullName}
                      </CardTitle>
                      <CardDescription className="text-base">{mama.account}</CardDescription>
                    </div>
                    <Badge 
                      variant={mama.status === "active" ? "default" : "secondary"}
                      className="text-sm px-3 py-1"
                    >
                      {mama.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Contact Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Contact Information
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{mama.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{mama.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Joined: {mama.joinDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Performance Metrics
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Collections</span>
                          <span className="font-medium">{mama.totalCollections}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Monthly Earnings</span>
                          <span className="font-medium">{mama.monthlyEarnings.toLocaleString()} ETB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Assigned Suppliers</span>
                          <span className="font-medium">{mama.assignedSuppliers.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Products Made */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Handicraft Products
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Mommas Handles</span>
                          <span className="font-medium">{mama.products.mommasHandles}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Gift Baskets</span>
                          <span className="font-medium">{mama.products.giftBaskets}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Wall Decor</span>
                          <span className="font-medium">{mama.products.wallDecor}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-sm">Total Products</span>
                          <span>{mama.products.totalProducts}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Training Status */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                      Training Status
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={mama.training.productTraining ? "default" : "outline"}>
                        Product Training
                      </Badge>
                      <Badge variant={mama.training.salesTraining ? "default" : "outline"}>
                        Sales Training
                      </Badge>
                      <Badge variant={mama.training.customerServiceTraining ? "default" : "outline"}>
                        Customer Service
                      </Badge>
                      {mama.training.completedDate && (
                        <Badge variant="secondary">
                          Completed: {mama.training.completedDate}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Ambassador Status */}
                  {mama.ambassador.isAmbassador && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                        Ambassador Status
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" className="bg-yellow-500">
                          {mama.ambassador.level} Ambassador
                        </Badge>
                        {mama.ambassador.achievementDate && (
                          <span className="text-sm text-muted-foreground">
                            Since: {mama.ambassador.achievementDate}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {mama.ambassador.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weekly Schedule */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                      Weekly Schedule
                    </h4>
                    <div className="grid gap-2 md:grid-cols-7">
                      {Object.entries(mama.weeklySchedule).map(([day, suppliers]) => (
                        <div key={day} className="p-2 border rounded text-center">
                          <div className="font-medium text-xs capitalize mb-1">{day}</div>
                          <div className="text-xs text-muted-foreground">
                            {suppliers.length} visits
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Status & Address Information</CardTitle>
              <CardDescription>Complete supplier information with collection performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliersData.map((supplier) => (
                  <div key={supplier.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{supplier.name}</h4>
                        <p className="text-sm text-muted-foreground">{supplier.type}</p>
                      </div>
                      <Badge variant={supplier.status === "active" ? "default" : "secondary"}>
                        {supplier.status}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Address
                        </h5>
                        <p className="text-sm text-muted-foreground">{supplier.address}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-2">Contact Person</h5>
                        <p className="text-sm">{supplier.contactPerson}</p>
                        <p className="text-xs text-muted-foreground">{supplier.phone}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm mb-2">Janitor Info</h5>
                        <p className="text-sm">{supplier.janitor.name}</p>
                        <p className="text-xs text-muted-foreground">{supplier.janitor.shift} Shift</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <span className="text-sm">
                            <strong>Total Collections:</strong> {supplier.totalCollections}
                          </span>
                          <span className="text-sm">
                            <strong>Monthly Avg:</strong> {supplier.monthlyAverage} kg
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{supplier.collectionType}</Badge>
                          {supplier.needsShredder && <Badge variant="destructive">Needs Shredder</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Daily Reports
                </CardTitle>
                <CardDescription>Today's collection summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketersData.map((mama) => (
                    <div key={mama.id} className="border-l-4 border-l-blue-500 pl-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{mama.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Scheduled visits: {mama.assignedSuppliers.length}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">12 kg collected</p>
                          <p className="text-sm text-muted-foreground">3 visits completed</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Reports
                </CardTitle>
                <CardDescription>This week's performance summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketersData.map((mama) => (
                    <div key={mama.id} className="border-l-4 border-l-green-500 pl-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{mama.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Weekly target: 50 kg
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">45 kg collected</p>
                          <p className="text-sm text-green-600">90% completion</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Collection Type Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Type Performance</CardTitle>
              <CardDescription>Breakdown by collection type and location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">In-Store Collections</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-blue-50 rounded">
                      <span>Carton</span>
                      <span className="font-medium">25 kg</span>
                    </div>
                    <div className="flex justify-between p-2 bg-green-50 rounded">
                      <span>Mixed Paper</span>
                      <span className="font-medium">18 kg</span>
                    </div>
                    <div className="flex justify-between p-2 bg-yellow-50 rounded">
                      <span>SW Paper</span>
                      <span className="font-medium">12 kg</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Regular Collections</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-purple-50 rounded">
                      <span>SC Paper</span>
                      <span className="font-medium">15 kg</span>
                    </div>
                    <div className="flex justify-between p-2 bg-pink-50 rounded">
                      <span>NP Paper</span>
                      <span className="font-medium">8 kg</span>
                    </div>
                    <div className="flex justify-between p-2 bg-orange-50 rounded">
                      <span>Other</span>
                      <span className="font-medium">5 kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MamasPerformance;

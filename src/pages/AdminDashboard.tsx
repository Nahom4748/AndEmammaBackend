
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Users, Building, FileText } from "lucide-react";
import { useState } from "react";
import { AdminStats } from "@/components/AdminStats";
import { MarketerDetailsCard } from "@/components/MarketerDetailsCard";
import { PaymentCalculator } from "@/components/PaymentCalculator";
import { CollectionReports } from "@/components/CollectionReports";
import { marketersData } from "@/data/marketersData";
import { suppliersData } from "@/data/suppliersData";
import { Marketer } from "@/types";

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMarketer, setSelectedMarketer] = useState<Marketer | null>(null);

  const filteredMarketers = marketersData.filter(marketer =>
    marketer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marketer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marketer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marketer.account.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditMarketer = (marketer: Marketer) => {
    console.log("Edit marketer:", marketer.name);
  };

  const handleDownloadExcel = () => {
    console.log("Downloading Excel report...");
  };

  // Sample payment data
  const paymentData = [
    { paperType: "sw", quantity: 125, rate: 5, amount: 625 },
    { paperType: "mixed", quantity: 98, rate: 5, amount: 490 },
    { paperType: "carton", quantity: 87, rate: 7, amount: 609 },
    { paperType: "sc", quantity: 64, rate: 5, amount: 320 },
    { paperType: "np", quantity: 12, rate: 30, amount: 360 },
  ];

  const totalPayment = paymentData.reduce((sum, item) => sum + item.amount, 0);

  const stats = {
    totalMarketers: marketersData.length,
    activeSuppliers: suppliersData.filter(s => s.status === "active").length,
    monthlyRevenue: 45280,
    totalCollections: 1247,
    scheduledToday: 23,
    reportsGenerated: 12
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive marketer management, performance tracking, and reporting system
            </p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Marketer
        </Button>
      </div>

      {/* Admin Stats */}
      <AdminStats {...stats} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="marketers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="marketers">Marketers</TabsTrigger>
          <TabsTrigger value="payments">Payment Calculator</TabsTrigger>
          <TabsTrigger value="reports">Collection Reports</TabsTrigger>
          <TabsTrigger value="overview">Weekly Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="marketers" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search marketers by name, account, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredMarketers.length} of {marketersData.length} marketers
            </p>
          </div>

          {/* Marketers Grid */}
          <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
            {filteredMarketers.map((marketer) => (
              <MarketerDetailsCard
                key={marketer.id}
                marketer={marketer}
                onEdit={handleEditMarketer}
              />
            ))}
          </div>

          {filteredMarketers.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No marketers found matching your search criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentCalculator
            data={paymentData}
            totalAmount={totalPayment}
            onDownloadExcel={handleDownloadExcel}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <CollectionReports />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Marketer Performance
                </CardTitle>
                <CardDescription>Weekly collection summary by marketer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketersData.map((marketer) => (
                    <div key={marketer.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{marketer.name}</p>
                        <p className="text-sm text-muted-foreground">{marketer.assignedSuppliers.length} suppliers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{marketer.totalCollections} collections</p>
                        <p className="text-sm text-muted-foreground">{marketer.monthlyEarnings.toLocaleString()} ETB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Department Schedule
                </CardTitle>
                <CardDescription>Today's collection schedule by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suppliersData.slice(0, 6).map((supplier) => (
                    <div key={supplier.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{supplier.name}</p>
                        <p className="text-xs text-muted-foreground">{supplier.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{supplier.janitor.name}</p>
                        <p className="text-xs text-muted-foreground">{supplier.janitor.shift} Shift</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;

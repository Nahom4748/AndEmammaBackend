import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Download, Filter, FileText, BarChart3, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MonthlyReport } from "@/components/MonthlyReport";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const [date, setDate] = useState<DateRange | undefined>();

  const monthlyReport = [
    { month: 'Jan', regular: 180, instore: 65, total: 245 },
    { month: 'Feb', regular: 220, instore: 60, total: 280 },
    { month: 'Mar', regular: 250, instore: 70, total: 320 },
    { month: 'Apr', regular: 210, instore: 85, total: 295 },
    { month: 'May', regular: 285, instore: 100, total: 385 },
  ];

  const supplierPerformance = [
    { name: 'Addis Ababa University', collections: 45, efficiency: 96 },
    { name: 'FDRE Ministry of Justice', collections: 38, efficiency: 94 },
    { name: 'Ethiopian Chamber', collections: 32, efficiency: 98 },
    { name: 'AACA Farms Commission', collections: 28, efficiency: 92 },
    { name: 'Kotebe University', collections: 25, efficiency: 95 },
  ];

  const collectionTypes = [
    { name: 'Carton', value: 145, color: '#0088FE' },
    { name: 'Mixed', value: 112, color: '#00C49F' },
    { name: 'SW', value: 89, color: '#FFBB28' },
    { name: 'SC', value: 67, color: '#FF8042' },
    { name: 'NP', value: 34, color: '#8884D8' },
  ];

  const reportTemplates = [
    {
      title: "Monthly Collection Summary",
      description: "Comprehensive monthly overview of all collections",
      icon: FileText,
      lastGenerated: "2025-05-30",
      status: "ready",
    },
    {
      title: "Supplier Performance Report",
      description: "Analysis of supplier efficiency and collection volumes",
      icon: BarChart3,
      lastGenerated: "2025-05-28",
      status: "ready",
    },
    {
      title: "Collection Type Analysis",
      description: "Breakdown of collection types and trends",
      icon: TrendingUp,
      lastGenerated: "2025-05-29",
      status: "processing",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
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
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Professional reporting and performance evaluation</p>
          </div>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-6">
          <MonthlyReport />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Report Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Summary</SelectItem>
                      <SelectItem value="supplier">Supplier Performance</SelectItem>
                      <SelectItem value="collection">Collection Analysis</SelectItem>
                      <SelectItem value="custom">Custom Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button>Generate Report</Button>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Collection Trends</CardTitle>
                <CardDescription>Regular vs in-store collections over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyReport}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
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
                <CardTitle>Collection Types Distribution</CardTitle>
                <CardDescription>Breakdown by collection type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={collectionTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {collectionTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Supplier Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Suppliers</CardTitle>
              <CardDescription>Suppliers ranked by collection volume and efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Supplier</th>
                      <th className="text-right p-2">Collections</th>
                      <th className="text-right p-2">Efficiency</th>
                      <th className="text-right p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierPerformance.map((supplier, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{supplier.name}</td>
                        <td className="p-2 text-right">{supplier.collections}</td>
                        <td className="p-2 text-right">
                          <Badge variant={supplier.efficiency >= 95 ? "default" : "outline"}>
                            {supplier.efficiency}%
                          </Badge>
                        </td>
                        <td className="p-2 text-right">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Report Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Pre-configured report templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {reportTemplates.map((template, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <template.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{template.title}</h4>
                        <Badge className={getStatusColor(template.status)} variant="outline">
                          {template.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Last: {template.lastGenerated}
                      </span>
                      <Button variant="outline" size="sm">
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, TrendingUp, Trophy, Target, Truck } from "lucide-react";
import { useState } from "react";

export const MonthlyReport = () => {
  const [selectedMonth, setSelectedMonth] = useState("may-2025");

  const monthlyData = {
    totalCollections: 1247,
    totalKg: 312000,
    totalRevenue: 156000,
    targetAchievement: 94.7,
    topPerformers: [
      { name: "Addis Ababa University", collections: 45, kg: 11250, revenue: 5625, efficiency: 96 },
      { name: "FDRE Ministry of Justice", collections: 38, kg: 9500, revenue: 4750, efficiency: 94 },
      { name: "Ethiopian Chamber", collections: 32, kg: 8000, revenue: 4000, efficiency: 98 },
      { name: "AACA Farms Commission", collections: 28, kg: 7000, revenue: 3500, efficiency: 92 },
      { name: "Kotebe University", collections: 25, kg: 6250, revenue: 3125, efficiency: 95 }
    ]
  };

  const employeePerformance = [
    { name: "Aschlew", target: 150000, achieved: 142000, percentage: 94.7 },
    { name: "Sefu", target: 150000, achieved: 138500, percentage: 92.3 },
    { name: "Zelalem", target: 50000, achieved: 48500, percentage: 97.0 },
    { name: "Manzefro", target: 30000, achieved: 28900, percentage: 96.3 }
  ];

  const collectionTrends = [
    { week: "Week 1", collections: 78, kg: 19500 },
    { week: "Week 2", collections: 85, kg: 21250 },
    { week: "Week 3", collections: 92, kg: 23000 },
    { week: "Week 4", collections: 89, kg: 22250 }
  ];

  const collectionTypes = [
    { name: "Carton", value: 145, revenue: 1015, color: "#0088FE" },
    { name: "Mixed", value: 112, revenue: 560, color: "#00C49F" },
    { name: "SW", value: 89, revenue: 445, color: "#FFBB28" },
    { name: "SC", value: 67, revenue: 335, color: "#FF8042" },
    { name: "NP", value: 34, revenue: 1020, color: "#8884D8" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monthly Performance Report</h2>
          <p className="text-gray-600">Comprehensive evaluation and analysis</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="may-2025">May 2025</SelectItem>
              <SelectItem value="april-2025">April 2025</SelectItem>
              <SelectItem value="march-2025">March 2025</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Collections</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyData.totalCollections}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-800">+12% from last month</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Weight (kg)</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyData.totalKg.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-800">+8.5% from target</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue (ETB)</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyData.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2">
              <Badge className="bg-purple-100 text-purple-800">+15.2% growth</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Target Achievement</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyData.targetAchievement}%</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2">
              <Badge className="bg-orange-100 text-orange-800">Excellent</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Suppliers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Top Performing Suppliers
              </CardTitle>
              <p className="text-sm text-gray-600">Highest collection volumes and efficiency ratings</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-semibold">Rank</th>
                  <th className="text-left p-3 font-semibold">Supplier</th>
                  <th className="text-center p-3 font-semibold">Collections</th>
                  <th className="text-center p-3 font-semibold">Weight (kg)</th>
                  <th className="text-center p-3 font-semibold">Revenue (ETB)</th>
                  <th className="text-center p-3 font-semibold">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.topPerformers.map((supplier, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        {index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                        {index === 2 && <Trophy className="h-4 w-4 text-orange-400" />}
                        <span className="font-semibold">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="p-3 font-medium">{supplier.name}</td>
                    <td className="text-center p-3">{supplier.collections}</td>
                    <td className="text-center p-3">{supplier.kg.toLocaleString()}</td>
                    <td className="text-center p-3">{supplier.revenue.toLocaleString()}</td>
                    <td className="text-center p-3">
                      <Badge className={
                        supplier.efficiency >= 95 ? "bg-green-100 text-green-800" :
                        supplier.efficiency >= 90 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }>
                        {supplier.efficiency}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Employee Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Performance vs Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'target' ? `${Number(value).toLocaleString()} kg` : `${Number(value).toLocaleString()} kg`,
                  name === 'target' ? 'Target' : 'Achieved'
                ]} />
                <Legend />
                <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                <Bar dataKey="achieved" fill="#3b82f6" name="Achieved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Collection Types */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Types Distribution</CardTitle>
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
                <Tooltip formatter={(value, name, props) => [
                  `${value} collections`,
                  `Revenue: ${props.payload.revenue} ETB`
                ]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Collection Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={collectionTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="collections" stroke="#3b82f6" name="Collections" />
              <Line type="monotone" dataKey="kg" stroke="#10b981" name="Weight (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

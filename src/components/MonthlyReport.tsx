import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, TrendingUp, Trophy, Target, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';

export const MonthlyReport = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("may");
  const [monthlyData, setMonthlyData] = useState({
    totalCollections: 0,
    totalKg: 0,
    totalRevenue: 0,
    targetAchievement: 0,
    topPerformers: []
  });
  const [employeePerformance, setEmployeePerformance] = useState([]);
  const [collectionTrends, setCollectionTrends] = useState([]);
  const [collectionTypes, setCollectionTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Target constants
  const INSTORE_TARGET = 150000; // kg
  const REGULAR_TARGET = 50000; // kg
  const TOTAL_TARGET = INSTORE_TARGET + REGULAR_TARGET;

  useEffect(() => {
    fetchAllData();
  }, [selectedYear, selectedMonth]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMonthlyData(),
        fetchEmployeePerformance(),
        fetchWeeklyCollectionTrends(),
        fetchCollectionTypeBreakdown()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/getMonthlyData?year=${selectedYear}&month=${selectedMonth}`);
      const data = await response.json();
      
      if (data.status === "success") {
        setMonthlyData({
          totalCollections: data.data.totalCollections,
          totalKg: parseFloat(data.data.totalKg),
          totalRevenue: parseFloat(data.data.totalRevenue),
          targetAchievement: parseFloat(data.data.targetAchievement),
          topPerformers: data.data.topPerformers.map(performer => ({
            ...performer,
            kg: parseFloat(performer.kg),
            revenue: parseFloat(performer.revenue),
            efficiency: parseFloat(performer.efficiency)
          }))
        });
      }
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    }
  };

  const fetchEmployeePerformance = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/getEmployeePerformance?year=${selectedYear}&month=${selectedMonth}`);
      const data = await response.json();
      
      if (data.status === "success") {
        // Combine instore and regular performance
        const allEmployees = [
          ...data.data.instorePerformance.map(emp => ({
            ...emp,
            target: parseFloat(emp.target) || 0,
            achieved: parseFloat(emp.achieved) || 0,
            percentage: parseFloat(emp.percentage) || 0
          })),
          ...data.data.regularPerformance.map(emp => ({
            ...emp,
            target: parseFloat(emp.target) || 0,
            achieved: parseFloat(emp.achieved) || 0,
            percentage: parseFloat(emp.percentage) || 0
          }))
        ];
        
        setEmployeePerformance(allEmployees);
      }
    } catch (error) {
      console.error("Error fetching employee performance:", error);
    }
  };

  const fetchWeeklyCollectionTrends = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/getWeeklyCollectionTrends?year=${selectedYear}&month=${selectedMonth}`);
      const data = await response.json();
      
      if (data.status === "success") {
        setCollectionTrends(data.data.map(week => ({
          ...week,
          collections: parseInt(week.collections),
          kg: parseFloat(week.kg)
        })));
      }
    } catch (error) {
      console.error("Error fetching weekly trends:", error);
    }
  };

  const fetchCollectionTypeBreakdown = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/getCollectionTypeBreakdown?year=${selectedYear}&month=${selectedMonth}`);
      const data = await response.json();
      
      if (data.status === "success") {
        setCollectionTypes(data.data.map(item => ({
          name: item.name,
          value: parseFloat(item.value),
          revenue: parseFloat(item.value) * 0.5, // Assuming average revenue per kg
          color: item.color
        })));
      }
    } catch (error) {
      console.error("Error fetching collection types:", error);
    }
  };

  const exportToExcel = () => {
    // Prepare data for export
    const workbook = XLSX.utils.book_new();
    
    // Key Metrics Sheet
    const metricsData = [
      ["Metric", "Value", "Target", "Achievement %"],
      ["Total Collections", monthlyData.totalCollections, "-", "-"],
      ["Total Weight (kg)", monthlyData.totalKg, TOTAL_TARGET, `${((monthlyData.totalKg / TOTAL_TARGET) * 100).toFixed(1)}%`],
      ["Total Revenue (ETB)", monthlyData.totalRevenue, "-", "-"],
      ["Target Achievement", `${monthlyData.targetAchievement}%`, "100%", `${monthlyData.targetAchievement}%`]
    ];
    const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(workbook, metricsSheet, "Key Metrics");
    
    // Top Performers Sheet
    const performersData = [
      ["Rank", "Supplier", "Collections", "Weight (kg)", "Revenue (ETB)", "Efficiency %"]
    ];
    monthlyData.topPerformers.forEach((performer, index) => {
      performersData.push([
        index + 1,
        performer.name,
        performer.collections,
        performer.kg,
        performer.revenue,
        performer.efficiency
      ]);
    });
    const performersSheet = XLSX.utils.aoa_to_sheet(performersData);
    XLSX.utils.book_append_sheet(workbook, performersSheet, "Top Performers");
    
    // Employee Performance Sheet
    const employeeData = [
      ["Employee", "Target (kg)", "Achieved (kg)", "Achievement %"]
    ];
    employeePerformance.forEach(emp => {
      employeeData.push([
        emp.name,
        emp.target,
        emp.achieved,
        emp.percentage
      ]);
    });
    const employeeSheet = XLSX.utils.aoa_to_sheet(employeeData);
    XLSX.utils.book_append_sheet(workbook, employeeSheet, "Employee Performance");
    
    // Collection Trends Sheet
    const trendsData = [
      ["Week", "Collections", "Weight (kg)"]
    ];
    collectionTrends.forEach(trend => {
      trendsData.push([
        trend.week,
        trend.collections,
        trend.kg
      ]);
    });
    const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
    XLSX.utils.book_append_sheet(workbook, trendsSheet, "Weekly Trends");
    
    // Collection Types Sheet
    const typesData = [
      ["Type", "Weight (kg)", "Revenue (ETB)"]
    ];
    collectionTypes.forEach(type => {
      typesData.push([
        type.name,
        type.value,
        type.revenue
      ]);
    });
    const typesSheet = XLSX.utils.aoa_to_sheet(typesData);
    XLSX.utils.book_append_sheet(workbook, typesSheet, "Collection Types");
    
    // Generate and download the file
    const fileName = `Monthly_Report_${selectedMonth}_${selectedYear}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const getTargetStatus = (achievement) => {
    if (achievement >= 100) return "bg-green-100 text-green-800";
    if (achievement >= 90) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getTargetStatusText = (achievement) => {
    if (achievement >= 100) return "Target Exceeded";
    if (achievement >= 90) return "On Track";
    return "Needs Improvement";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monthly Performance Report</h2>
          <p className="text-gray-600">Comprehensive evaluation and analysis</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="january">January</SelectItem>
              <SelectItem value="february">February</SelectItem>
              <SelectItem value="march">March</SelectItem>
              <SelectItem value="april">April</SelectItem>
              <SelectItem value="may">May</SelectItem>
              <SelectItem value="june">June</SelectItem>
              <SelectItem value="july">July</SelectItem>
              <SelectItem value="august">August</SelectItem>
              <SelectItem value="september">September</SelectItem>
              <SelectItem value="october">October</SelectItem>
              <SelectItem value="november">November</SelectItem>
              <SelectItem value="december">December</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Target Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Monthly Target Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-700">In-Store Target</h3>
              <p className="text-2xl font-bold">{INSTORE_TARGET.toLocaleString()} kg</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-blue-600 rounded-full" 
                  style={{ width: `${Math.min(100, (monthlyData.totalKg / INSTORE_TARGET) * 100)}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">
                {((monthlyData.totalKg / INSTORE_TARGET) * 100).toFixed(1)}% Achieved
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-700">Regular Target</h3>
              <p className="text-2xl font-bold">{REGULAR_TARGET.toLocaleString()} kg</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-green-600 rounded-full" 
                  style={{ width: `${Math.min(100, (monthlyData.totalKg / REGULAR_TARGET) * 100)}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">
                {((monthlyData.totalKg / REGULAR_TARGET) * 100).toFixed(1)}% Achieved
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-700">Total Target</h3>
              <p className="text-2xl font-bold">{TOTAL_TARGET.toLocaleString()} kg</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-purple-600 rounded-full" 
                  style={{ width: `${Math.min(100, (monthlyData.totalKg / TOTAL_TARGET) * 100)}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">
                {((monthlyData.totalKg / TOTAL_TARGET) * 100).toFixed(1)}% Achieved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <Badge className="bg-blue-100 text-blue-800">+12% from last month</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Weight (kg)</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyData.totalKg.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Target: {TOTAL_TARGET.toLocaleString()} kg</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <Badge className={getTargetStatus((monthlyData.totalKg / TOTAL_TARGET) * 100)}>
                {((monthlyData.totalKg / TOTAL_TARGET) * 100).toFixed(1)}% of target
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue (ETB)</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyData.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">≈ {(monthlyData.totalRevenue / monthlyData.totalKg).toFixed(2)} ETB/kg</p>
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
              <Badge className={getTargetStatus(monthlyData.targetAchievement)}>
                {getTargetStatusText(monthlyData.targetAchievement)}
              </Badge>
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
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)} {selectedYear}
            </Badge>
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
                  `${Number(value).toLocaleString()} kg`,
                  `Revenue: ${props.payload.revenue.toLocaleString()} ETB`
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
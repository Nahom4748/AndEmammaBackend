
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, FileText, MapPin, User, Phone, Scissors, Package } from "lucide-react";
import { useState } from "react";
import { CollectionReport, DailyReport, WeeklyReport } from "@/types";

export const CollectionReports = () => {
  const [selectedDate, setSelectedDate] = useState("2025-06-28");
  const [selectedWeek, setSelectedWeek] = useState("2025-W26");

  // Sample data
  const dailyReports: DailyReport[] = [
    {
      date: "2025-06-28",
      totalCollections: 15,
      totalWeight: 3250,
      completedReports: [],
      pendingReports: [],
      issues: ["Shredder needed at AAU", "Contact person unavailable at Ministry"]
    }
  ];

  const weeklyReports: WeeklyReport[] = [
    {
      weekStart: "2025-06-23",
      weekEnd: "2025-06-29",
      totalCollections: 89,
      totalWeight: 22150,
      supplierPerformance: [
        { supplierId: 1, supplierName: "Addis Ababa University", collections: 12, weight: 3000 },
        { supplierId: 2, supplierName: "FDRE Ministry of Justice", collections: 10, weight: 2500 },
        { supplierId: 3, supplierName: "Ethiopian Chamber", collections: 8, weight: 2000 }
      ],
      marketerPerformance: [
        { marketerId: 1, marketerName: "Sefu Tekle", collections: 35, efficiency: 96 },
        { marketerId: 2, marketerName: "Abrar Mohammed", collections: 28, efficiency: 94 },
        { marketerId: 3, marketerName: "Adisu Bekele", collections: 26, efficiency: 92 }
      ]
    }
  ];

  const collectionReports: CollectionReport[] = [
    {
      id: 1,
      supplierId: 1,
      supplierName: "Addis Ababa University",
      date: "2025-06-28",
      type: "regular",
      contactPerson: "Dr. Alemayehu Tadese",
      description: "Regular weekly collection of mixed paper and cartons from administration building",
      needsShredder: true,
      collectionTypes: ["mixed", "carton", "sw"],
      totalWeight: 450,
      marketerId: 1,
      status: "completed",
      followUpRequired: true,
      notes: "Large volume expected next week due to semester end"
    },
    {
      id: 2,
      supplierId: 2,
      supplierName: "FDRE Ministry of Justice",
      date: "2025-06-28",
      type: "instore",
      contactPerson: "Ato Bekele Mamo",
      description: "In-store collection of confidential documents requiring shredding",
      needsShredder: true,
      collectionTypes: ["sc", "mixed"],
      totalWeight: 320,
      marketerId: 1,
      status: "scheduled",
      followUpRequired: false
    },
    {
      id: 3,
      supplierId: 3,
      supplierName: "Ethiopian Chamber",
      date: "2025-06-28",
      type: "regular",
      contactPerson: "W/ro Hanan Ahmed",
      description: "Regular collection of office waste paper and packaging materials",
      needsShredder: false,
      collectionTypes: ["carton", "mixed"],
      totalWeight: 280,
      marketerId: 2,
      status: "pending",
      followUpRequired: true,
      notes: "Coordinate with security for after-hours access"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "instore" 
      ? "bg-purple-100 text-purple-800" 
      : "bg-orange-100 text-orange-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Collection Reports</h2>
          <p className="text-muted-foreground">Daily and weekly collection performance reports</p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Daily Reports</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Reports</TabsTrigger>
          <TabsTrigger value="collections">Collection Details</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Daily Collection Report</CardTitle>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-06-28">June 28, 2025</SelectItem>
                    <SelectItem value="2025-06-27">June 27, 2025</SelectItem>
                    <SelectItem value="2025-06-26">June 26, 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {dailyReports.map((report, index) => (
                <div key={index} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{report.totalCollections}</div>
                      <div className="text-sm text-blue-600">Total Collections</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{report.totalWeight} kg</div>
                      <div className="text-sm text-green-600">Total Weight</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{report.issues.length}</div>
                      <div className="text-sm text-orange-600">Issues Reported</div>
                    </div>
                  </div>
                  
                  {report.issues.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Issues & Follow-ups</h4>
                      <div className="space-y-2">
                        {report.issues.map((issue, issueIndex) => (
                          <div key={issueIndex} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">{issue}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Weekly Performance Summary</CardTitle>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-W26">Week 26, 2025</SelectItem>
                    <SelectItem value="2025-W25">Week 25, 2025</SelectItem>
                    <SelectItem value="2025-W24">Week 24, 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {weeklyReports.map((report, index) => (
                <div key={index} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{report.totalCollections}</div>
                      <div className="text-sm text-purple-600">Weekly Collections</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{report.totalWeight} kg</div>
                      <div className="text-sm text-green-600">Weekly Weight</div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-3">Supplier Performance</h4>
                      <div className="space-y-2">
                        {report.supplierPerformance.map((supplier, supplierIndex) => (
                          <div key={supplierIndex} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{supplier.supplierName}</p>
                              <p className="text-xs text-muted-foreground">{supplier.collections} collections</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{supplier.weight} kg</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Marketer Performance</h4>
                      <div className="space-y-2">
                        {report.marketerPerformance.map((marketer, marketerIndex) => (
                          <div key={marketerIndex} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{marketer.marketerName}</p>
                              <p className="text-xs text-muted-foreground">{marketer.collections} collections</p>
                            </div>
                            <div className="text-right">
                              <Badge className={marketer.efficiency >= 95 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                {marketer.efficiency}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          <div className="grid gap-4">
            {collectionReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.supplierName}</CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {report.date}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      <Badge className={getTypeColor(report.type)}>
                        {report.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3 w-3" />
                        <span className="font-medium">Contact:</span>
                        <span>{report.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-3 w-3" />
                        <span className="font-medium">Weight:</span>
                        <span>{report.totalWeight} kg</span>
                      </div>
                      {report.needsShredder && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <Scissors className="h-3 w-3" />
                          <span className="font-medium">Shredder Required</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Collection Types:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {report.collectionTypes.map((type, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {type.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {report.followUpRequired && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Follow-up Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-sm"><span className="font-medium">Description:</span> {report.description}</p>
                    {report.notes && (
                      <p className="text-sm mt-2"><span className="font-medium">Notes:</span> {report.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit Report
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {report.followUpRequired && (
                      <Button size="sm">
                        Schedule Follow-up
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

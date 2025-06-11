
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, TrendingUp, DollarSign, Calendar, FileText } from "lucide-react";

interface AdminStatsProps {
  totalMarketers: number;
  activeSuppliers: number;
  monthlyRevenue: number;
  totalCollections: number;
  scheduledToday: number;
  reportsGenerated: number;
}

export const AdminStats = ({
  totalMarketers,
  activeSuppliers,
  monthlyRevenue,
  totalCollections,
  scheduledToday,
  reportsGenerated
}: AdminStatsProps) => {
  const stats = [
    {
      title: "Total Marketers",
      value: totalMarketers.toString(),
      description: "Active marketers",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Suppliers",
      value: activeSuppliers.toString(),
      description: "Organizations",
      icon: Building,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Monthly Revenue",
      value: `${monthlyRevenue.toLocaleString()} ETB`,
      description: "This month",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Collections",
      value: totalCollections.toString(),
      description: "This month",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Scheduled Today",
      value: scheduledToday.toString(),
      description: "Collections",
      icon: Calendar,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Reports Generated",
      value: reportsGenerated.toString(),
      description: "This week",
      icon: FileText,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

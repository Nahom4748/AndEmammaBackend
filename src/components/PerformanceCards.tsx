
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react";
import { EmployeePerformance } from "@/types/performance";

interface PerformanceCardsProps {
  employees: EmployeePerformance[];
}

export const PerformanceCards = ({ employees }: PerformanceCardsProps) => {
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 95) return "text-green-600 bg-green-50";
    if (percentage >= 85) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 95) return "bg-green-500";
    if (percentage >= 85) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {employees.map((employee) => (
        <Card key={employee.id} className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">{employee.name}</CardTitle>
                <Badge variant="outline" className="mt-1 capitalize">
                  {employee.role}
                </Badge>
              </div>
              <div className={`p-2 rounded-lg ${getPerformanceColor(employee.monthlyPercentage)}`}>
                {employee.monthlyPercentage >= 90 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Monthly Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Monthly Target
                </span>
                <span className="font-medium">{employee.monthlyPercentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={employee.monthlyPercentage} 
                className="h-2"
                style={{
                  background: `linear-gradient(to right, ${getProgressColor(employee.monthlyPercentage)} 0%, ${getProgressColor(employee.monthlyPercentage)} ${employee.monthlyPercentage}%, #e5e7eb ${employee.monthlyPercentage}%, #e5e7eb 100%)`
                }}
              />
              <div className="text-xs text-muted-foreground">
                {employee.currentMonthCollection.toLocaleString()} / {employee.monthlyTarget.toLocaleString()} kg
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Weekly Target
                </span>
                <span className="font-medium">{employee.weeklyPercentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={employee.weeklyPercentage} 
                className="h-2"
                style={{
                  background: `linear-gradient(to right, ${getProgressColor(employee.weeklyPercentage)} 0%, ${getProgressColor(employee.weeklyPercentage)} ${employee.weeklyPercentage}%, #e5e7eb ${employee.weeklyPercentage}%, #e5e7eb 100%)`
                }}
              />
              <div className="text-xs text-muted-foreground">
                {employee.currentWeekCollection.toLocaleString()} / {employee.weeklyTarget.toLocaleString()} kg
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">{employee.totalCollections}</div>
                <div className="text-muted-foreground">Collections</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">{employee.efficiency}%</div>
                <div className="text-muted-foreground">Efficiency</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

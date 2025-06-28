
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, User } from "lucide-react";
import { SupplierPerformance } from "@/types/performance";

interface SupplierPerformanceTableProps {
  suppliers: SupplierPerformance[];
}

export const SupplierPerformanceTable = ({ suppliers }: SupplierPerformanceTableProps) => {
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 95) return "bg-green-100 text-green-800";
    if (efficiency >= 90) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Performance & Addresses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Supplier Details</th>
                <th className="text-center p-3">Collections</th>
                <th className="text-center p-3">Weight (kg)</th>
                <th className="text-center p-3">Weekly</th>
                <th className="text-center p-3">Efficiency</th>
                <th className="text-center p-3">Collector</th>
                <th className="text-center p-3">Last Collection</th>
                <th className="text-center p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="space-y-1">
                      <div className="font-medium">{supplier.name}</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {supplier.address}
                      </div>
                    </div>
                  </td>
                  <td className="text-center p-3">
                    <div className="font-medium">{supplier.totalCollections}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </td>
                  <td className="text-center p-3">
                    <div className="font-medium">{supplier.totalKg.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </td>
                  <td className="text-center p-3">
                    <div className="font-medium">{supplier.weeklyCollections}</div>
                    <div className="text-xs text-muted-foreground">{supplier.weeklyKg} kg</div>
                  </td>
                  <td className="text-center p-3">
                    <Badge className={getEfficiencyColor(supplier.efficiency)} variant="outline">
                      {supplier.efficiency}%
                    </Badge>
                  </td>
                  <td className="text-center p-3">
                    <div className="flex items-center justify-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="text-sm">{supplier.preferredCollector}</span>
                    </div>
                  </td>
                  <td className="text-center p-3">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">{supplier.lastCollection}</span>
                    </div>
                  </td>
                  <td className="text-center p-3">
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
  );
};

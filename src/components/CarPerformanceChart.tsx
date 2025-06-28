
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CarPerformance } from "@/types/performance";

interface CarPerformanceChartProps {
  data: CarPerformance[];
}

export const CarPerformanceChart = ({ data }: CarPerformanceChartProps) => {
  const chartData = data.map(car => ({
    name: car.carName,
    collections: car.totalCollections,
    weight: car.totalKg / 1000, // Convert to tons
    efficiency: car.efficiency,
    routes: car.routesCompleted,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Car Performance Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'weight') return [`${value} tons`, 'Weight Collected'];
                if (name === 'efficiency') return [`${value}%`, 'Efficiency'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="collections" fill="#0088FE" name="Collections" />
            <Bar yAxisId="left" dataKey="weight" fill="#00C49F" name="Weight (tons)" />
            <Bar yAxisId="right" dataKey="efficiency" fill="#FFBB28" name="Efficiency %" />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Car Details */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {data.map((car, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold">{car.carName}</h4>
                  <p className="text-sm text-muted-foreground">Driver: {car.driver}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{car.efficiency}%</div>
                  <div className="text-xs text-muted-foreground">Efficiency</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-medium">{car.totalCollections}</div>
                  <div className="text-muted-foreground">Total Collections</div>
                </div>
                <div>
                  <div className="font-medium">{(car.totalKg / 1000).toFixed(1)}t</div>
                  <div className="text-muted-foreground">Total Weight</div>
                </div>
                <div>
                  <div className="font-medium">{car.routesCompleted}</div>
                  <div className="text-muted-foreground">Routes Completed</div>
                </div>
                <div>
                  <div className="font-medium">{car.fuelCost.toLocaleString()} ETB</div>
                  <div className="text-muted-foreground">Fuel Cost</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Calculator } from "lucide-react";
import { PAYMENT_RATES } from "@/types";

interface PaymentData {
  paperType: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface PaymentCalculatorProps {
  data: PaymentData[];
  totalAmount: number;
  onDownloadExcel: () => void;
}

export const PaymentCalculator = ({ data, totalAmount, onDownloadExcel }: PaymentCalculatorProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Payment Calculator
          </CardTitle>
          <Button onClick={onDownloadExcel} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <h4 className="font-medium text-sm text-muted-foreground">Payment Rates</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PAYMENT_RATES).map(([type, rate]) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type.toUpperCase()}: {rate} ETB
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Paper Type</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Rate (ETB)</th>
                  <th className="text-right p-2">Amount (ETB)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{item.paperType.toUpperCase()}</td>
                    <td className="p-2 text-right">{item.quantity}</td>
                    <td className="p-2 text-right">{item.rate}</td>
                    <td className="p-2 text-right font-medium">{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="border-b-2 border-primary">
                  <td className="p-2 font-bold">Total</td>
                  <td className="p-2"></td>
                  <td className="p-2"></td>
                  <td className="p-2 text-right font-bold text-lg">{totalAmount.toLocaleString()} ETB</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

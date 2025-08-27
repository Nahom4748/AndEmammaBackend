import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, Package, Truck } from "lucide-react";

interface Transaction {
  id: number;
  receiptNumber: string;
  itemName: string;
  quantity: number;
  totalAmount: number;
  date: string;
  [key: string]: any; // Additional properties
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  type: 'collections' | 'sales';
  title: string;
  emptyMessage: string;
}

export function RecentTransactions({
  transactions,
  type,
  title,
  emptyMessage
}: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'collections' ? <Truck className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentTransactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                {type === 'sales' && <TableHead>Payment</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.receiptNumber}</TableCell>
                  <TableCell>{transaction.itemName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {transaction.quantity} kg
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.totalAmount} ETB</TableCell>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  {type === 'sales' && (
                    <TableCell>
                      <Badge variant="secondary">
                        {transaction.paymentMethod}
                      </Badge>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">{emptyMessage}</h3>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
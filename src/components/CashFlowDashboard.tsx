import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBankAccounts, getFinancialSummary } from '@/lib/cashflowStorage';
import { BankAccount, FinancialSummary } from '@/types/cashflow';
import { Banknote, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export function CashFlowDashboard() {
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);

  useEffect(() => {
    setBanks(getBankAccounts());
    setSummary(getFinancialSummary());
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalBalance = banks.reduce((sum, bank) => sum + bank.balance, 0);

  return (
    <div className="space-y-6">
      {/* Bank Balances Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Across {banks.length} banks
            </p>
          </CardContent>
        </Card>

        {summary && (
          <>
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Total Payables</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">
                  {formatCurrency(summary.totalPayable)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total Receivables</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {formatCurrency(summary.totalReceivable)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Net Position</CardTitle>
                <Banknote className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.difference >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {formatCurrency(summary.difference)}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Individual Bank Balances */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Bank Account Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banks.map((bank) => (
              <div
                key={bank.id}
                className="p-4 border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-green-800">{bank.name}</h3>
                  <Banknote className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-xl font-bold text-green-900 mt-2">
                  {formatCurrency(bank.balance)}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Last updated: {new Date(bank.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary Report */}
      {summary && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Financial Summary Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-green-200">
                    <th className="text-left py-2 text-green-800 font-medium">No.</th>
                    <th className="text-left py-2 text-green-800 font-medium">Description</th>
                    <th className="text-right py-2 text-green-800 font-medium">Cost & Expense Amount (ETB)</th>
                    <th className="text-right py-2 text-green-800 font-medium">Cash Amount (ETB)</th>
                    <th className="text-right py-2 text-green-800 font-medium">Receivable Amount (ETB)</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-green-100">
                    <td className="py-2 text-green-900">1</td>
                    <td className="py-2 text-green-900">Payable</td>
                    <td className="py-2 text-right text-green-900 font-medium">
                      {formatCurrency(summary.totalPayable)}
                    </td>
                    <td className="py-2 text-right text-green-900">-</td>
                    <td className="py-2 text-right text-green-900">-</td>
                  </tr>
                  <tr className="border-b border-green-100">
                    <td className="py-2 text-green-900">2</td>
                    <td className="py-2 text-green-900">Receivable</td>
                    <td className="py-2 text-right text-green-900">-</td>
                    <td className="py-2 text-right text-green-900">-</td>
                    <td className="py-2 text-right text-green-900 font-medium">
                      {formatCurrency(summary.totalReceivable)}
                    </td>
                  </tr>
                  <tr className="border-b border-green-100">
                    <td className="py-2 text-green-900">3</td>
                    <td className="py-2 text-green-900">Bank Balance</td>
                    <td className="py-2 text-right text-green-900">-</td>
                    <td className="py-2 text-right text-green-900 font-medium">
                      {formatCurrency(summary.totalBankBalance)}
                    </td>
                    <td className="py-2 text-right text-green-900">-</td>
                  </tr>
                  <tr className="border-b border-green-200 bg-green-50">
                    <td className="py-2 text-green-900 font-medium"></td>
                    <td className="py-2 text-green-900 font-medium">Difference</td>
                    <td className="py-2 text-right text-green-900">-</td>
                    <td className="py-2 text-right text-green-900">-</td>
                    <td className="py-2 text-right text-green-900 font-bold">
                      {formatCurrency(summary.difference)}
                    </td>
                  </tr>
                  <tr className="border-b border-green-100">
                    <td className="py-2 text-green-900"></td>
                    <td className="py-2 text-green-900 font-medium">Cash Balance</td>
                    <td className="py-2 text-right text-green-900">-</td>
                    <td className="py-2 text-right text-green-900 font-medium">
                      {formatCurrency(summary.cashBalance)}
                    </td>
                    <td className="py-2 text-right text-green-900">-</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="py-2 text-green-900"></td>
                    <td className="py-2 text-green-900 font-medium">Cash + Receivable Balance</td>
                    <td className="py-2 text-right text-green-900">-</td>
                    <td className="py-2 text-right text-green-900">-</td>
                    <td className="py-2 text-right text-green-900 font-bold">
                      {formatCurrency(summary.cashReceivableBalance)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
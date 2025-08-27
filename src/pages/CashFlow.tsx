import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CashFlowDashboard } from '@/components/CashFlowDashboard';
import { 
  getBankAccounts, 
  getCashFlowTransactions, 
  saveCashFlowTransaction,
  getPayables,
  savePayable,
  updatePayable,
  getReceivables,
  saveReceivable,
  updateReceivable
} from '@/lib/cashflowStorage';
import { BankAccount, CashFlowTransaction, Payable, Receivable } from '@/types/cashflow';
import { toast } from '@/hooks/use-toast';

export default function CashFlow() {
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<CashFlowTransaction[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [selectedTab, setSelectedTab] = useState('dashboard');

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    date: new Date(),
    transactionType: 'withdrawal' as 'deposit' | 'withdrawal' | 'transfer',
    bankId: '',
    paidTo: '',
    receivedFrom: '',
    description: '',
    pvNumber: '',
    chequeNumber: '',
    fsNumber: '',
    amount: '',
    remark: ''
  });

  // Payable form state
  const [payableForm, setPayableForm] = useState({
    dueDate: new Date(),
    paidTo: '',
    purpose: '',
    amount: '',
    paid: '',
    firstPriority: '',
    secondPriority: '',
    thirdPriority: '',
    remark: ''
  });

  // Receivable form state
  const [receivableForm, setReceivableForm] = useState({
    dueDate: new Date(),
    receivableFrom: '',
    purpose: '',
    amount: '',
    bank: '',
    remark: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBanks(getBankAccounts());
    setTransactions(getCashFlowTransactions());
    setPayables(getPayables());
    setReceivables(getReceivables());
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(transactionForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    const transactionData = {
      date: transactionForm.date.toISOString(),
      bankId: transactionForm.bankId,
      bankName: banks.find(b => b.id === transactionForm.bankId)?.name || '',
      transactionType: transactionForm.transactionType,
      paidTo: transactionForm.transactionType === 'withdrawal' ? transactionForm.paidTo : undefined,
      receivedFrom: transactionForm.transactionType === 'deposit' ? transactionForm.receivedFrom : undefined,
      description: transactionForm.description,
      pvNumber: transactionForm.pvNumber,
      chequeNumber: transactionForm.chequeNumber,
      fsNumber: transactionForm.fsNumber,
      debit: transactionForm.transactionType === 'withdrawal' ? amount : 0,
      credit: transactionForm.transactionType === 'deposit' ? amount : 0,
      remark: transactionForm.remark
    };

    const savedTransaction = saveCashFlowTransaction(transactionData);
    if (savedTransaction) {
      loadData();
      setTransactionForm({
        date: new Date(),
        transactionType: 'withdrawal',
        bankId: '',
        paidTo: '',
        receivedFrom: '',
        description: '',
        pvNumber: '',
        chequeNumber: '',
        fsNumber: '',
        amount: '',
        remark: ''
      });
      toast({
        title: "Success",
        description: "Transaction added successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive"
      });
    }
  };

  const handlePayableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(payableForm.amount);
    const paid = parseFloat(payableForm.paid) || 0;
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    const payableData = {
      dueDate: payableForm.dueDate.toISOString(),
      paidTo: payableForm.paidTo,
      purpose: payableForm.purpose,
      amount: amount,
      paid: paid,
      status: (paid >= amount ? 'paid' : paid > 0 ? 'partial' : 'unpaid') as 'paid' | 'unpaid' | 'partial',
      firstPriority: parseFloat(payableForm.firstPriority) || 0,
      secondPriority: parseFloat(payableForm.secondPriority) || 0,
      thirdPriority: parseFloat(payableForm.thirdPriority) || 0,
      remark: payableForm.remark
    };

    savePayable(payableData);
    loadData();
    setPayableForm({
      dueDate: new Date(),
      paidTo: '',
      purpose: '',
      amount: '',
      paid: '',
      firstPriority: '',
      secondPriority: '',
      thirdPriority: '',
      remark: ''
    });
    toast({
      title: "Success",
      description: "Payable added successfully"
    });
  };

  const handleReceivableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(receivableForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    const receivableData = {
      dueDate: receivableForm.dueDate.toISOString(),
      receivableFrom: receivableForm.receivableFrom,
      purpose: receivableForm.purpose,
      amount: amount,
      bank: receivableForm.bank,
      status: 'unpaid' as const,
      remark: receivableForm.remark
    };

    saveReceivable(receivableData);
    loadData();
    setReceivableForm({
      dueDate: new Date(),
      receivableFrom: '',
      purpose: '',
      amount: '',
      bank: '',
      remark: ''
    });
    toast({
      title: "Success",
      description: "Receivable added successfully"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const DatePicker = ({ date, setDate, placeholder }: { date: Date; setDate: (date: Date) => void; placeholder: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal border-green-200",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-green-600" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => date && setDate(date)}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">Cash Flow Management</h1>
        <Button className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5 bg-green-50 border-green-200">
          <TabsTrigger value="dashboard" className="text-green-700 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-green-700 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="payables" className="text-green-700 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Payables
          </TabsTrigger>
          <TabsTrigger value="receivables" className="text-green-700 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Receivables
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-green-700 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <CashFlowDashboard />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transaction Form */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Add New Transaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-green-700">Date</Label>
                    <DatePicker 
                      date={transactionForm.date}
                      setDate={(date) => setTransactionForm(prev => ({ ...prev, date }))}
                      placeholder="Select date"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="transactionType" className="text-green-700">Transaction Type</Label>
                    <Select 
                      value={transactionForm.transactionType} 
                      onValueChange={(value) => setTransactionForm(prev => ({ ...prev, transactionType: value as any }))}
                    >
                      <SelectTrigger className="border-green-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deposit">Deposit</SelectItem>
                        <SelectItem value="withdrawal">Withdrawal</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bankId" className="text-green-700">Bank</Label>
                    <Select 
                      value={transactionForm.bankId} 
                      onValueChange={(value) => setTransactionForm(prev => ({ ...prev, bankId: value }))}
                    >
                      <SelectTrigger className="border-green-200">
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transactionForm.transactionType === 'withdrawal' && (
                    <div>
                      <Label htmlFor="paidTo" className="text-green-700">Paid To</Label>
                      <Input
                        id="paidTo"
                        value={transactionForm.paidTo}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, paidTo: e.target.value }))}
                        className="border-green-200 focus:border-green-400"
                        placeholder="Enter payee name"
                      />
                    </div>
                  )}

                  {transactionForm.transactionType === 'deposit' && (
                    <div>
                      <Label htmlFor="receivedFrom" className="text-green-700">Received From</Label>
                      <Input
                        id="receivedFrom"
                        value={transactionForm.receivedFrom}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, receivedFrom: e.target.value }))}
                        className="border-green-200 focus:border-green-400"
                        placeholder="Enter payer name"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="description" className="text-green-700">Description</Label>
                    <Input
                      id="description"
                      value={transactionForm.description}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="Enter description"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="pvNumber" className="text-green-700">PV Number</Label>
                    <Input
                      id="pvNumber"
                      value={transactionForm.pvNumber}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, pvNumber: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="PV Number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="chequeNumber" className="text-green-700">Cheque Number</Label>
                    <Input
                      id="chequeNumber"
                      value={transactionForm.chequeNumber}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, chequeNumber: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="Cheque Number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fsNumber" className="text-green-700">FS Number</Label>
                    <Input
                      id="fsNumber"
                      value={transactionForm.fsNumber}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, fsNumber: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="FS Number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount" className="text-green-700">Amount (ETB)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="remark" className="text-green-700">Remark</Label>
                  <Textarea
                    id="remark"
                    value={transactionForm.remark}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, remark: e.target.value }))}
                    className="border-green-200 focus:border-green-400"
                    placeholder="Enter remarks"
                  />
                </div>

                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-green-200">
                      <TableHead className="text-green-700">Date</TableHead>
                      <TableHead className="text-green-700">Paid To</TableHead>
                      <TableHead className="text-green-700">Received From</TableHead>
                      <TableHead className="text-green-700">Description</TableHead>
                      <TableHead className="text-green-700">PV No</TableHead>
                      <TableHead className="text-green-700">Cheque No</TableHead>
                      <TableHead className="text-green-700">Debit</TableHead>
                      <TableHead className="text-green-700">Credit</TableHead>
                      <TableHead className="text-green-700">Balance</TableHead>
                      <TableHead className="text-green-700">Bank</TableHead>
                      <TableHead className="text-green-700">Remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id} className="border-green-100">
                        <TableCell className="text-green-900">
                          {format(new Date(transaction.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="text-green-900">{transaction.paidTo || '-'}</TableCell>
                        <TableCell className="text-green-900">{transaction.receivedFrom || '-'}</TableCell>
                        <TableCell className="text-green-900">{transaction.description}</TableCell>
                        <TableCell className="text-green-900">{transaction.pvNumber || '-'}</TableCell>
                        <TableCell className="text-green-900">{transaction.chequeNumber || '-'}</TableCell>
                        <TableCell className="text-green-900 text-right">
                          {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                        </TableCell>
                        <TableCell className="text-green-900 text-right">
                          {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                        </TableCell>
                        <TableCell className="text-green-900 text-right font-medium">
                          {formatCurrency(transaction.balance)}
                        </TableCell>
                        <TableCell className="text-green-900">{transaction.bankName}</TableCell>
                        <TableCell className="text-green-900">{transaction.remark || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payables" className="space-y-6">
          {/* Payable Form */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <TrendingDown className="mr-2 h-5 w-5" />
                Add New Payable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayableSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="payableDueDate" className="text-green-700">Due Date</Label>
                    <DatePicker 
                      date={payableForm.dueDate}
                      setDate={(date) => setPayableForm(prev => ({ ...prev, dueDate: date }))}
                      placeholder="Select due date"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="payablePaidTo" className="text-green-700">Paid To</Label>
                    <Input
                      id="payablePaidTo"
                      value={payableForm.paidTo}
                      onChange={(e) => setPayableForm(prev => ({ ...prev, paidTo: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="Enter payee name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="payablePurpose" className="text-green-700">Purpose</Label>
                    <Input
                      id="payablePurpose"
                      value={payableForm.purpose}
                      onChange={(e) => setPayableForm(prev => ({ ...prev, purpose: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="Enter purpose"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payableAmount" className="text-green-700">Total Amount (ETB)</Label>
                    <Input
                      id="payableAmount"
                      type="number"
                      step="0.01"
                      value={payableForm.amount}
                      onChange={(e) => setPayableForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="payablePaid" className="text-green-700">Paid Amount (ETB)</Label>
                    <Input
                      id="payablePaid"
                      type="number"
                      step="0.01"
                      value={payableForm.paid}
                      onChange={(e) => setPayableForm(prev => ({ ...prev, paid: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="firstPriority" className="text-green-700">First Priority (ETB)</Label>
                    <Input
                      id="firstPriority"
                      type="number"
                      step="0.01"
                      value={payableForm.firstPriority}
                      onChange={(e) => setPayableForm(prev => ({ ...prev, firstPriority: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondPriority" className="text-green-700">Second Priority (ETB)</Label>
                    <Input
                      id="secondPriority"
                      type="number"
                      step="0.01"
                      value={payableForm.secondPriority}
                      onChange={(e) => setPayableForm(prev => ({ ...prev, secondPriority: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="thirdPriority" className="text-green-700">Third Priority (ETB)</Label>
                    <Input
                      id="thirdPriority"
                      type="number"
                      step="0.01"
                      value={payableForm.thirdPriority}
                      onChange={(e) => setPayableForm(prev => ({ ...prev, thirdPriority: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="payableRemark" className="text-green-700">Remark</Label>
                  <Textarea
                    id="payableRemark"
                    value={payableForm.remark}
                    onChange={(e) => setPayableForm(prev => ({ ...prev, remark: e.target.value }))}
                    className="border-green-200 focus:border-green-400"
                    placeholder="Enter remarks"
                  />
                </div>

                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payable
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Payables Table */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Payables List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-green-200">
                      <TableHead className="text-green-700">Due Date</TableHead>
                      <TableHead className="text-green-700">Paid To</TableHead>
                      <TableHead className="text-green-700">Purpose</TableHead>
                      <TableHead className="text-green-700">Status</TableHead>
                      <TableHead className="text-green-700">Pending Total</TableHead>
                      <TableHead className="text-green-700">First Priority</TableHead>
                      <TableHead className="text-green-700">Second Priority</TableHead>
                      <TableHead className="text-green-700">Third Priority</TableHead>
                      <TableHead className="text-green-700">Remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payables.map((payable) => (
                      <TableRow key={payable.id} className="border-green-100">
                        <TableCell className="text-green-900">
                          {format(new Date(payable.dueDate), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="text-green-900">{payable.paidTo}</TableCell>
                        <TableCell className="text-green-900">{payable.purpose}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={payable.status === 'paid' ? 'default' : payable.status === 'partial' ? 'secondary' : 'destructive'}
                            className={
                              payable.status === 'paid' ? 'bg-green-100 text-green-800' :
                              payable.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {payable.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-900 text-right font-medium">
                          {formatCurrency(payable.pending)}
                        </TableCell>
                        <TableCell className="text-green-900 text-right">
                          {payable.firstPriority > 0 ? formatCurrency(payable.firstPriority) : '-'}
                        </TableCell>
                        <TableCell className="text-green-900 text-right">
                          {payable.secondPriority > 0 ? formatCurrency(payable.secondPriority) : '-'}
                        </TableCell>
                        <TableCell className="text-green-900 text-right">
                          {payable.thirdPriority > 0 ? formatCurrency(payable.thirdPriority) : '-'}
                        </TableCell>
                        <TableCell className="text-green-900">{payable.remark || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receivables" className="space-y-6">
          {/* Receivable Form */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Add New Receivable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReceivableSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="receivableDueDate" className="text-green-700">Due Date</Label>
                    <DatePicker 
                      date={receivableForm.dueDate}
                      setDate={(date) => setReceivableForm(prev => ({ ...prev, dueDate: date }))}
                      placeholder="Select due date"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="receivableFrom" className="text-green-700">Receivable From</Label>
                    <Input
                      id="receivableFrom"
                      value={receivableForm.receivableFrom}
                      onChange={(e) => setReceivableForm(prev => ({ ...prev, receivableFrom: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="Enter payer name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="receivablePurpose" className="text-green-700">Purpose</Label>
                    <Input
                      id="receivablePurpose"
                      value={receivableForm.purpose}
                      onChange={(e) => setReceivableForm(prev => ({ ...prev, purpose: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="Enter purpose"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="receivableAmount" className="text-green-700">Amount (ETB)</Label>
                    <Input
                      id="receivableAmount"
                      type="number"
                      step="0.01"
                      value={receivableForm.amount}
                      onChange={(e) => setReceivableForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="receivableBank" className="text-green-700">Bank</Label>
                    <Input
                      id="receivableBank"
                      value={receivableForm.bank}
                      onChange={(e) => setReceivableForm(prev => ({ ...prev, bank: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="Enter bank"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="receivableRemark" className="text-green-700">Remark</Label>
                    <Input
                      id="receivableRemark"
                      value={receivableForm.remark}
                      onChange={(e) => setReceivableForm(prev => ({ ...prev, remark: e.target.value }))}
                      className="border-green-200 focus:border-green-400"
                      placeholder="Enter remarks"
                    />
                  </div>
                </div>

                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Receivable
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Receivables Table */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Receivables List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-green-200">
                      <TableHead className="text-green-700">No.</TableHead>
                      <TableHead className="text-green-700">Due Date</TableHead>
                      <TableHead className="text-green-700">Receivable From</TableHead>
                      <TableHead className="text-green-700">Purpose</TableHead>
                      <TableHead className="text-green-700">Amount</TableHead>
                      <TableHead className="text-green-700">Bank</TableHead>
                      <TableHead className="text-green-700">Status</TableHead>
                      <TableHead className="text-green-700">Remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivables.map((receivable, index) => (
                      <TableRow key={receivable.id} className="border-green-100">
                        <TableCell className="text-green-900">{index + 1}</TableCell>
                        <TableCell className="text-green-900">
                          {format(new Date(receivable.dueDate), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="text-green-900">{receivable.receivableFrom}</TableCell>
                        <TableCell className="text-green-900">{receivable.purpose}</TableCell>
                        <TableCell className="text-green-900 text-right font-medium">
                          {formatCurrency(receivable.amount)}
                        </TableCell>
                        <TableCell className="text-green-900">{receivable.bank}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={receivable.status === 'paid' ? 'default' : 'destructive'}
                            className={receivable.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {receivable.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-900">{receivable.remark || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <CashFlowDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
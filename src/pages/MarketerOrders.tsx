import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Plus, ShoppingCart, Phone, Mail, ChevronDown, ChevronUp, Scale, RefreshCw, Package, Menu, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/contexts/AuthContext";
import axios from "axios";

interface Supplier {
  supplierId: number;
  companyName: string;
  contactPerson: string;
  phone: string;
}

interface MarketerOrder {
  id: number;
  supplier_id: number;
  company_name: string;
  intention_date: string;
  contact_person: string;
  phone_number: string;
  estimated_kg: string;
  require_shredder: number;
  additional_notes: string;
  status: string;
  created_at: string;
}

const MarketerOrders = () => {
  const [orders, setOrders] = useState<MarketerOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    supplierId: "",
    intentionDate: new Date(),
    contactPerson: "",
    phoneNumber: "",
    estimatedKg: "",
    requireShredder: false,
    additionalNotes: "",
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchSuppliers();
    fetchOrders();
  }, [user?.user_id]);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/suppliers/with-marketer/${user?.user_id}`
      );
      setSuppliers(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch suppliers",
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/marketer-orders/${user?.user_id}`
      );
      // Handle both response formats
      if (response.data.orders) {
        setOrders(response.data.orders);
      } else if (response.data.data) {
        setOrders(response.data.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSupplierChange = (supplierId: string) => {
    const selectedSupplier = suppliers.find(s => s.supplierId.toString() === supplierId);
    if (selectedSupplier) {
      setFormData(prev => ({
        ...prev,
        supplierId,
        contactPerson: selectedSupplier.contactPerson,
        phoneNumber: selectedSupplier.phone
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplierId || !formData.estimatedKg) {
      toast({
        title: "Missing Information",
        description: "Please select a supplier and provide estimated weight",
        variant: "destructive",
      });
      return;
    }

    try {
      const newOrder = {
        supplierId: parseInt(formData.supplierId),
        intentionDate: formData.intentionDate,
        contactPerson: formData.contactPerson,
        phoneNumber: formData.phoneNumber,
        estimatedKg: parseFloat(formData.estimatedKg),
        requireShredder: formData.requireShredder,
        additionalNotes: formData.additionalNotes,
        marketerId: user?.user_id
      };

      await axios.post("http://localhost:5000/api/marketer-orders", newOrder);
      
      setFormData({
        supplierId: "",
        intentionDate: new Date(),
        contactPerson: "",
        phoneNumber: "",
        estimatedKg: "",
        requireShredder: false,
        additionalNotes: "",
      });

      fetchOrders();

      toast({
        title: "Success",
        description: "Order created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  const toggleOrderExpand = (orderId: number) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  // Safe date parsing function to prevent "Invalid time value" errors
  const safeParseDate = (dateString: string): Date => {
    try {
      // Try ISO string parsing first
      const date = parseISO(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      // Try other common formats if ISO fails
      const timestamp = Date.parse(dateString);
      if (!isNaN(timestamp)) {
        return new Date(timestamp);
      }
      
      // Return current date as fallback
      return new Date();
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date();
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'onprocess':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'completed':
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case 'rejected':
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 md:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 md:p-6 rounded-lg md:rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">
                Order Management
              </h1>
              <p className="text-slate-600 mt-1 text-sm md:text-base">
                Create and manage collection orders
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block mt-3 md:mt-0`}>
            <Button 
              variant="outline" 
              onClick={fetchOrders} 
              className="w-full md:w-auto border-slate-200 hover:bg-slate-100 flex items-center gap-2 text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Orders
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Order Form - Left Side */}
          <div className="w-full lg:w-2/5">
            <Card className="bg-white border-slate-200 shadow-sm h-full">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 p-4 md:p-6">
                <CardTitle className="flex items-center justify-center text-slate-800 text-lg md:text-xl">
                  <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-500" />
                  Create New Order
                </CardTitle>
                <CardDescription className="text-center text-slate-600 text-xs md:text-sm">
                  Fill in the order details for collection intention
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier" className="text-slate-700 text-sm md:text-base">Select Supplier *</Label>
                    <Select onValueChange={handleSupplierChange} value={formData.supplierId}>
                      <SelectTrigger className="bg-slate-50 border-slate-200 text-sm md:text-base">
                        <SelectValue placeholder="Choose supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem
                            key={supplier.supplierId}
                            value={supplier.supplierId.toString()}
                            className="text-sm md:text-base"
                          >
                            {supplier.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="intention-date" className="text-slate-700 text-sm md:text-base">Intention Date *</Label>
                      <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-slate-50 border-slate-200 text-xs md:text-sm",
                              !formData.intentionDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                            {formData.intentionDate ? (
                              format(formData.intentionDate, "MMM dd, yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.intentionDate}
                            onSelect={(date) => {
                              if (date) {
                                handleInputChange("intentionDate", date);
                                setShowCalendar(false);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimated-kg" className="text-slate-700 text-sm md:text-base">Estimated Weight (kg) *</Label>
                      <Input
                        id="estimated-kg"
                        type="number"
                        placeholder="Enter estimated weight"
                        value={formData.estimatedKg}
                        onChange={(e) => handleInputChange("estimatedKg", e.target.value)}
                        min="0"
                        step="0.1"
                        className="bg-slate-50 border-slate-200 text-sm md:text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-person" className="text-slate-700 text-sm md:text-base">Contact Person *</Label>
                      <Input
                        id="contact-person"
                        placeholder="Enter contact person name"
                        value={formData.contactPerson}
                        onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                        className="bg-slate-50 border-slate-200 text-sm md:text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone-number" className="text-slate-700 text-sm md:text-base">Phone Number *</Label>
                      <Input
                        id="phone-number"
                        placeholder="Enter phone number"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        className="bg-slate-50 border-slate-200 text-sm md:text-base"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                    <Switch
                      id="require-shredder"
                      checked={formData.requireShredder}
                      onCheckedChange={(checked) => handleInputChange("requireShredder", checked)}
                    />
                    <Label htmlFor="require-shredder" className="text-slate-700 cursor-pointer text-sm md:text-base">Require Shredder Service</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additional-notes" className="text-slate-700 text-sm md:text-base">Additional Notes</Label>
                    <Textarea
                      id="additional-notes"
                      placeholder="Enter any additional notes or requirements"
                      value={formData.additionalNotes}
                      onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                      rows={2}
                      className="bg-slate-50 border-slate-200 text-sm md:text-base"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2 text-sm md:text-base">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Create Order
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Orders List - Right Side */}
          <div className="w-full lg:w-3/5">
            <Card className="bg-white border-slate-200 shadow-sm h-full">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="text-center md:text-left">
                    <CardTitle className="text-slate-800 text-lg md:text-xl">Order History</CardTitle>
                    <CardDescription className="text-slate-600 text-xs md:text-sm">
                      {orders.length} order{orders.length !== 1 ? 's' : ''} found
                    </CardDescription>
                  </div>
                  <div className="mt-3 md:mt-0 flex justify-center">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                      <TabsList className="bg-slate-100 grid grid-cols-3 md:flex md:inline-flex w-full">
                        <TabsTrigger value="all" className="text-xs md:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white">All</TabsTrigger>
                        <TabsTrigger value="active" className="text-xs md:text-sm data-[state=active]:bg-green-600 data-[state=active]:text-white">Active</TabsTrigger>
                        <TabsTrigger value="onprocess" className="text-xs md:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white">On Process</TabsTrigger>
                        <TabsTrigger value="completed" className="text-xs md:text-sm data-[state=active]:bg-gray-600 data-[state=active]:text-white">Completed</TabsTrigger>
                        <TabsTrigger value="rejected" className="text-xs md:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white">Rejected</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8 md:py-12">
                    <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-blue-500 mb-3 md:mb-4"></div>
                    <p className="text-slate-600 text-sm md:text-base">Loading orders...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8 md:py-12 px-4">
                    <ShoppingCart className="h-8 w-8 md:h-12 md:w-12 text-slate-400 mx-auto mb-3 md:mb-4" />
                    <h3 className="text-base md:text-lg font-medium text-slate-900">No orders found</h3>
                    <p className="text-slate-500 text-sm md:text-base">
                      {activeTab === "all" 
                        ? "You haven't created any orders yet." 
                        : `You don't have any ${activeTab} orders.`}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[500px] md:max-h-[600px] overflow-y-auto">
                    {filteredOrders.map((order) => {
                      // Safely parse dates to avoid "Invalid time value" errors
                      const intentionDate = safeParseDate(order.intention_date);
                      const createdAt = safeParseDate(order.created_at);
                      
                      return (
                        <div key={order.id} className="p-3 md:p-4 hover:bg-slate-50 transition-colors">
                          <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleOrderExpand(order.id)}
                          >
                            <div className="flex items-center space-x-3 md:space-x-4">
                              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Package className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                              </div>
                              <div className="max-w-[120px] md:max-w-none">
                                <p className="font-medium text-slate-900 text-sm md:text-base truncate">{order.company_name}</p>
                                <p className="text-xs md:text-sm text-slate-500 truncate">{order.contact_person}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 md:space-x-4">
                              <div className="text-right hidden sm:block">
                                <p className="font-medium text-sm md:text-base">{order.estimated_kg} kg</p>
                                <p className="text-xs md:text-sm text-slate-500">
                                  {format(intentionDate, "MMM dd, yyyy")}
                                </p>
                              </div>
                              <Badge 
                                className={`text-xs md:text-sm ${getStatusBadgeColor(order.status)}`}
                              >
                                {order.status}
                              </Badge>
                              {expandedOrder === order.id ? (
                                <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-slate-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-slate-500" />
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-2 sm:hidden">
                            <div className="flex items-center">
                              <Scale className="h-3 w-3 md:h-4 md:w-4 text-slate-500 mr-1" />
                              <span className="text-xs md:text-sm text-slate-700">{order.estimated_kg} kg</span>
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-slate-500 mr-1" />
                              <span className="text-xs md:text-sm text-slate-700">
                                {format(intentionDate, "MMM dd")}
                              </span>
                            </div>
                          </div>
                          
                          {expandedOrder === order.id && (
                            <div className="mt-3 pl-0 md:pl-11 space-y-2 md:space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 md:h-4 md:w-4 text-slate-500 mr-2" />
                                  <span className="text-xs md:text-sm text-slate-700 truncate">{order.phone_number}</span>
                                </div>
                                <div className="flex items-center">
                                  <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-slate-500 mr-2" />
                                  <span className="text-xs md:text-sm text-slate-700">
                                    Created: {format(createdAt, "MMM dd, HH:mm")}
                                  </span>
                                </div>
                              </div>
                              
                              {order.require_shredder === 1 && (
                                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg w-fit">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-xs md:text-sm text-blue-600">Shredder Required</span>
                                </div>
                              )}
                              
                              {order.additional_notes && (
                                <div className="bg-slate-50 p-2 md:p-3 rounded-lg">
                                  <p className="text-xs md:text-sm font-medium text-slate-700 mb-1">Additional Notes:</p>
                                  <p className="text-xs md:text-sm text-slate-600">
                                    {order.additional_notes}
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex space-x-2 pt-2">
                                <Button size="sm" variant="outline" className="flex items-center gap-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-xs">
                                  <Phone className="h-3 w-3" />
                                  Call
                                </Button>
                                <Button size="sm" variant="outline" className="flex items-center gap-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 text-xs">
                                  <Mail className="h-3 w-3" />
                                  Email
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketerOrders;
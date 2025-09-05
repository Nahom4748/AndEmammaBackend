import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Save, Trash2, Loader2, X, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

interface Mama {
  id: number;
  status: string;
  joinName: string;
  fullName: string;
  woreda: string;
  phone: string;
  accountNumber: string;
  createdAt: string;
  updatedAt: string;
}

interface AndammaProduct {
  id: number;
  name: string;
  price_with_tube: string;
  price_without_tube: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface CurrentProduct {
  productId: number | null;
  type: "withTube" | "withoutTube" | "";
  quantity: number;
  notes: string;
}

interface AddedProduct {
  productId: number;
  productName: string;
  type: "withTube" | "withoutTube";
  quantity: number;
  unitPrice: number;
  total: number;
  notes: string;
}

const MamaProductEntry = () => {
  const [mamas, setMamas] = useState<Mama[]>([]);
  const [andammaProducts, setAndammaProducts] = useState<AndammaProduct[]>([]);
  const [selectedMama, setSelectedMama] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentProduct, setCurrentProduct] = useState<CurrentProduct>({
    productId: null,
    type: "",
    quantity: 0,
    notes: ""
  });
  const [addedProducts, setAddedProducts] = useState<AddedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [mamaSearch, setMamaSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // Fetch mamas and andamma products from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [mamasResponse, productsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/mamas`),
          axios.get(`${API_BASE_URL}/api/mammasproduct`)
        ]);

        setMamas(mamasResponse.data.data);
        setAndammaProducts(productsResponse.data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter mamas based on search
  const filteredMamas = mamas.filter(mama => 
    mama.fullName.toLowerCase().includes(mamaSearch.toLowerCase()) ||
    mama.phone.includes(mamaSearch) ||
    mama.accountNumber.includes(mamaSearch)
  );

  // Filter products based on search
  const filteredProducts = andammaProducts.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.description?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addProductToList = () => {
    if (!currentProduct.productId || !currentProduct.type || currentProduct.quantity <= 0) {
      toast({
        title: "Error",
        description: "Please select a product, type, and enter quantity",
        variant: "destructive"
      });
      return;
    }

    const productData = andammaProducts.find(p => p.id === currentProduct.productId);
    if (!productData) return;

    const unitPrice = parseFloat(
      currentProduct.type === "withTube" 
        ? productData.price_with_tube 
        : productData.price_without_tube
    );
    
    const total = unitPrice * currentProduct.quantity;

    setAddedProducts([
      ...addedProducts,
      {
        productId: currentProduct.productId,
        productName: productData.name,
        type: currentProduct.type,
        quantity: currentProduct.quantity,
        unitPrice,
        total,
        notes: currentProduct.notes
      }
    ]);

    // Reset current product form
    setCurrentProduct({
      productId: null,
      type: "",
      quantity: 0,
      notes: ""
    });
    
    setIsAddingProduct(false);
    setProductSearch("");

    toast({
      title: "Success",
      description: "Product added to list"
    });
  };

  const removeProductFromList = (index: number) => {
    setAddedProducts(addedProducts.filter((_, i) => i !== index));
  };

  const calculateGrandTotal = () => {
    return addedProducts.reduce((total, product) => total + product.total, 0);
  };

  const handleSave = async () => {
    if (!selectedMama) {
      toast({
        title: "Error",
        description: "Please select a mama",
        variant: "destructive"
      });
      return;
    }

    if (addedProducts.length === 0) {
      toast({
        title: "Error", 
        description: "Please add at least one product to the list",
        variant: "destructive"
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    
    try {
      const selectedMamaData = mamas.find(m => m.id === selectedMama);
      
      // Prepare data for backend
      const payload = {
        mamaId: selectedMama,
        mamaName: selectedMamaData?.fullName,
        date: format(selectedDate, "yyyy-MM-dd"),
        products: addedProducts.map(product => ({
          productId: product.productId,
          productName: product.productName,
          type: product.type,
          quantity: product.quantity,
          unitPrice: product.unitPrice,
          totalAmount: product.total,
          notes: product.notes
        })),
        grandTotal: calculateGrandTotal()
      };

      // Send to backend
      await axios.post(`${API_BASE_URL}/api/mammas-products`, payload);

      toast({
        title: "Success",
        description: `Saved ${addedProducts.length} products for ${selectedMamaData?.fullName}`,
      });

      // Reset form
      setAddedProducts([]);
      setSelectedMama(null);
      setCurrentProduct({
        productId: null,
        type: "",
        quantity: 0,
        notes: ""
      });
      setSelectedDate(new Date());
      setMamaSearch("");
    } catch (error) {
      console.error("Error saving products:", error);
      toast({
        title: "Error",
        description: "Failed to save products",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-sm p-6 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="p-2 bg-primary/10 rounded-full">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Mama Products Entry</h1>
            <p className="text-sm text-gray-500">Record daily production for mamas</p>
          </div>
        </div>

        <Card className="shadow-sm border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-lg font-semibold text-gray-800">Record Daily Production</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {/* Mama and Date Selection */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Mama</Label>
                <Select 
                  value={selectedMama?.toString()} 
                  onValueChange={(value) => setSelectedMama(Number(value))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose a mama" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-auto">
                    <div className="sticky top-0 z-10 bg-white p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search mamas..."
                          value={mamaSearch}
                          onChange={(e) => setMamaSearch(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    {filteredMamas.length > 0 ? (
                      filteredMamas.map((mama) => (
                        <SelectItem key={mama.id} value={mama.id.toString()}>
                          <div className="flex flex-col">
                            <span>{mama.fullName}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {mama.status !== 'active' && (
                                <Badge variant="outline" className="text-xs">
                                  {mama.status}
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {mama.phone}
                              </Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No mamas found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-11 justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Add Product Button */}
            {!isAddingProduct && (
              <div className="flex justify-center">
                <Button 
                  onClick={() => setIsAddingProduct(true)}
                  className="w-full max-w-xs"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Product
                </Button>
              </div>
            )}

            {/* Single Product Form */}
            {isAddingProduct && (
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">Add Product</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setIsAddingProduct(false);
                      setCurrentProduct({
                        productId: null,
                        type: "",
                        quantity: 0,
                        notes: ""
                      });
                      setProductSearch("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select 
                      value={currentProduct.productId?.toString() || ""} 
                      onValueChange={(value) => {
                        setCurrentProduct({...currentProduct, productId: Number(value)});
                        setProductSearch("");
                      }}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-auto">
                        <div className="sticky top-0 z-10 bg-white p-2 border-b">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search products..."
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              className="pl-8"
                            />
                          </div>
                        </div>
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{product.name}</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    With Tube: {product.price_with_tube} Birr
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Without Tube: {product.price_without_tube} Birr
                                  </Badge>
                                </div>
                                {product.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{product.description}</p>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            No products found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Product Type Selection */}
                  {currentProduct.productId && (
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select 
                        value={currentProduct.type} 
                        onValueChange={(value) => setCurrentProduct({...currentProduct, type: value as "withTube" | "withoutTube"})}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="withTube">
                            With Tube - {
                              andammaProducts.find(p => p.id === currentProduct.productId)?.price_with_tube
                            } Birr
                          </SelectItem>
                          <SelectItem value="withoutTube">
                            Without Tube - {
                              andammaProducts.find(p => p.id === currentProduct.productId)?.price_without_tube
                            } Birr
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={currentProduct.quantity || ""}
                      onChange={(e) => setCurrentProduct({...currentProduct, quantity: Number(e.target.value)})}
                      placeholder="0"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      value={currentProduct.notes}
                      onChange={(e) => setCurrentProduct({...currentProduct, notes: e.target.value})}
                      placeholder="Add any notes here..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button 
                    onClick={addProductToList}
                    className="w-full h-11"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add to List
                  </Button>
                </div>
              </div>
            )}

            {/* Added Products Table */}
            {addedProducts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Products to Save</h3>
                  <Badge variant="secondary" className="text-sm">
                    {addedProducts.length} item{addedProducts.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="px-3 py-3 text-xs sm:text-sm">Product</TableHead>
                          <TableHead className="px-2 py-3 text-xs sm:text-sm text-center">Qty</TableHead>
                          <TableHead className="px-2 py-3 text-xs sm:text-sm text-right">Price</TableHead>
                          <TableHead className="px-2 py-3 text-xs sm:text-sm text-right">Total</TableHead>
                          <TableHead className="px-2 py-3 text-xs sm:text-sm text-center">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {addedProducts.map((product, index) => (
                          <TableRow key={index} className="group">
                            <TableCell className="px-3 py-3">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium text-sm">{product.productName}</span>
                                <Badge variant="outline" className="w-fit text-xs">
                                  {product.type === "withTube" ? "With Tube" : "Without Tube"}
                                </Badge>
                                {product.notes && (
                                  <p className="text-xs text-muted-foreground mt-1">{product.notes}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-2 py-3 text-center">
                              <Badge variant="secondary" className="text-xs">{product.quantity}</Badge>
                            </TableCell>
                            <TableCell className="px-2 py-3 text-right font-mono text-sm">
                              {product.unitPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="px-2 py-3 text-right font-mono font-semibold text-primary text-sm">
                              {product.total.toFixed(2)}
                            </TableCell>
                            <TableCell className="px-2 py-3 text-center">
                              <Button
                                onClick={() => removeProductFromList(index)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium text-muted-foreground">Grand Total</span>
                  <span className="text-xl font-bold text-primary">{calculateGrandTotal().toFixed(2)} Birr</span>
                </div>
              </div>
            )}

            {/* Save Button */}
            {addedProducts.length > 0 && (
              <Button 
                onClick={handleSave} 
                className="w-full" 
                size="lg"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save {addedProducts.length} Product{addedProducts.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Save Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Confirm Save</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowConfirmModal(false)}
                  disabled={saving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="mb-4 text-gray-600">
                Are you sure you want to save {addedProducts.length} product{addedProducts.length !== 1 ? 's' : ''} for {
                  mamas.find(m => m.id === selectedMama)?.fullName
                } on {format(selectedDate, "PPP")}?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmModal(false)}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Confirm Save"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MamaProductEntry;
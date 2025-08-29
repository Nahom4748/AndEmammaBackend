import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { toast } from 'sonner';
import axios from 'axios';

// API base URL - adjust according to your backend
const API_BASE_URL ='http://localhost:5000';

// Configure axios
// axios.defaults.baseURL = API_BASE_URL;

interface CartItem extends InventoryItem {
  cartQuantity: number;
}

interface ModernShoppingCartProps {
  // Optional prop if you want to pass items from a parent component
  items?: InventoryItem[];
  // Optional callback for when a sale is completed
  onSaleComplete?: () => void;
}

export function ModernShoppingCart({ items: propItems, onSaleComplete }: ModernShoppingCartProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [items, setItems] = useState<InventoryItem[]>(propItems || []);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(!propItems);

  // Fetch inventory items if not passed as props
  useEffect(() => {
    if (!propItems) {
      fetchInventoryItems();
    }
  }, [propItems]);

  const fetchInventoryItems = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/inventory');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast.error('Failed to load inventory items');
    } finally {
      setIsLoading(false);
    }
  };

  const availableItems = items.filter(item => item.currentStock > 0);

  const addToCart = (item: InventoryItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        if (existingItem.cartQuantity >= item.currentStock) {
          toast.error('Cannot add more than available stock');
          return prev;
        }
        return prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, cartQuantity: cartItem.cartQuantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, cartQuantity: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    const item = items.find(i => i.id === itemId);
    if (item && newQuantity > item.currentStock) {
      toast.error('Cannot exceed available stock');
      return;
    }

    setCart(prev => prev.map(cartItem => 
      cartItem.id === itemId 
        ? { ...cartItem, cartQuantity: newQuantity }
        : cartItem
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(cartItem => cartItem.id !== itemId));
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.salePrice * item.cartQuantity), 0);
  };

  const calculateVAT = () => {
    return cart.reduce((sum, item) => sum + (item.salePrice * item.cartQuantity * (item.vatRate / 100)), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    try {
      // Prepare sale data
      const saleData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.cartQuantity,
          unitPrice: item.salePrice,
          vatRate: item.vatRate
        })),
        paymentMethod,
        customerName: customerName || undefined,
        subtotal: calculateSubtotal(),
        vat: calculateVAT(),
        total: calculateTotal()
      };

      // Send sale data to backend
    //   await axios.post(`${API_BASE_URL}/sales`, saleData);
      await axios.post('http://localhost:5000/sales', saleData);
      // Clear cart and form
      
      setCart([]);
      setPaymentMethod('');
      setCustomerName('');
      
      // Refresh inventory to get updated stock levels
      if (!propItems) {
        await fetchInventoryItems();
      }
      
      // Notify parent component if needed
      if (onSaleComplete) {
        onSaleComplete();
      }
      
      toast.success('Sale completed successfully!');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to process sale');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'mobile', label: 'Mobile Money', icon: Smartphone },
    { value: 'bank', label: 'Bank Transfer', icon: CreditCard },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Available Items */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-xl font-semibold">Available Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
          {availableItems.map(item => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Stock: {item.currentStock} • {item.salePrice.toFixed(2)} ETB
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {item.category.replace('_', ' ')}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => addToCart(item)}
                      className="mt-2 w-full"
                      disabled={item.currentStock === 0}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Shopping Cart */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Cart is empty
              </p>
            ) : (
              <>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-2 p-2 border rounded-lg">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.salePrice.toFixed(2)} ETB each
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-8 text-center">{item.cartQuantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 w-6 p-0 ml-1"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{calculateSubtotal().toFixed(2)} ETB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>VAT (15%):</span>
                    <span>{calculateVAT().toFixed(2)} ETB</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{calculateTotal().toFixed(2)} ETB</span>
                  </div>
                </div>

                <Separator />

                {/* Customer & Payment */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="customerName">Customer Name (Optional)</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map(method => {
                          const Icon = method.icon;
                          return (
                            <SelectItem key={method.value} value={method.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {method.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? 'Processing...' : 'Checkout'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    disabled={isProcessing}
                  >
                    Clear
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
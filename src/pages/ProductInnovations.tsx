import { useState, useEffect, useRef } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Lightbulb, 
  Plus, 
  Image as ImageIcon, 
  Trash2, 
  Search, 
  Filter, 
  Download,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Package,
  Ruler,
  Palette,
  Zap,
  Eye,
  Edit3,
  Loader2,
  FileText
} from "lucide-react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Innovation {
  id: string;
  product_name: string;
  material: string;
  color: string;
  shape: string;
  height: string;
  length: string;
  width: string;
  void_length: string;
  void_height: string;
  print_type: string;
  technique: string;
  finishing_material: string;
  special_feature: string;
  image_path?: string;
  additional_notes: string;
  created_date: string;
  status: "active" | "archived";
}

const API_BASE_URL = "http://localhost:5000";

const ProductInnovations = () => {
  const { toast } = useToast();
  const [innovations, setInnovations] = useState<Innovation[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [innovationToDelete, setInnovationToDelete] = useState<Innovation | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const productsPerPage = 8;

  const pdfRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    product_name: "",
    material: "",
    color: "",
    shape: "",
    height: "",
    length: "",
    width: "",
    void_length: "",
    void_height: "",
    print_type: "",
    technique: "",
    finishing_material: "",
    special_feature: "",
    additional_notes: "",
  });

  // Fetch products from backend
  const fetchInnovations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/innovations`);
      const innovationsData = response.data.data || response.data;
      setInnovations(innovationsData);
    } catch (error) {
      console.error("Error fetching innovations:", error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check if the backend is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInnovations();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.product_name.trim() || !formData.material.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in product name and material",
        variant: "destructive",
      });
      return;
    }

    try {
      const submitData = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      // Append image file if exists
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const response = await axios.post(`${API_BASE_URL}/innovations`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast({
        title: "🎉 Product Registered Successfully",
        description: `${formData.product_name} has been added to your innovation portfolio`,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
      });

      fetchInnovations();
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving innovation:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save product innovation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: "",
      material: "",
      color: "",
      shape: "",
      height: "",
      length: "",
      width: "",
      void_length: "",
      void_height: "",
      print_type: "",
      technique: "",
      finishing_material: "",
      special_feature: "",
      additional_notes: "",
    });
    setImagePreview("");
    setImageFile(null);
  };

  const confirmDelete = (innovation: Innovation) => {
    setInnovationToDelete(innovation);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!innovationToDelete) return;

    setDeleteLoading(innovationToDelete.id);
    try {
      await axios.delete(`${API_BASE_URL}/innovations/${innovationToDelete.id}`);
      
      setInnovations(prev => prev.filter(item => item.id !== innovationToDelete.id));
      toast({
        title: "Product Deleted",
        description: `${innovationToDelete.product_name} has been removed from your portfolio`,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
      });
    } catch (error) {
      console.error("Error deleting innovation:", error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(null);
      setDeleteDialogOpen(false);
      setInnovationToDelete(null);
    }
  };

  // Filter and search
  const filteredInnovations = innovations.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.technique.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterMaterial === "all" || item.material === filterMaterial;
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredInnovations.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredInnovations.length / productsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Unique materials for filter
  const uniqueMaterials = [...new Set(innovations.map(item => item.material))];

  const exportData = () => {
    const dataStr = JSON.stringify(innovations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product-innovations.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Product innovations data has been downloaded successfully",
      className: "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200",
    });
  };

  // Modern PDF Export Function
  const exportToPDF = async () => {
    if (!currentProducts.length) {
      toast({
        title: "No Products",
        description: "There are no products to export",
        variant: "destructive",
      });
      return;
    }

    setPdfLoading(true);
    try {
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add modern header with gradient background
      pdf.setFillColor(16, 185, 129);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      // Add title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INNOVATION PORTFOLIO', pageWidth / 2, 18, { align: 'center' });
      
      // Add subtitle
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 25, { align: 'center' });

      // Add modern grid layout for products
      const margin = 15;
      const cardWidth = (pageWidth - (margin * 3)) / 2;
      const cardHeight = (pageHeight - (margin * 3) - 30) / 4;
      
      let yPosition = 40;
      let xPosition = margin;

      for (let i = 0; i < currentProducts.length; i++) {
        const product = currentProducts[i];
        
        // Add card background with modern design
        pdf.setDrawColor(229, 231, 235);
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(xPosition, yPosition, cardWidth, cardHeight, 3, 3, 'FD');
        
        // Add product image if available
        if (product.image_path) {
          try {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = `http://localhost:5000${product.image_path}`;
            
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve; // Continue even if image fails to load
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              
              const imgData = canvas.toDataURL('image/jpeg', 0.7);
              pdf.addImage(imgData, 'JPEG', xPosition + 5, yPosition + 5, 40, 40);
            }
          } catch (error) {
            console.warn('Could not load image for PDF:', product.image_path);
            // Add placeholder for image
            pdf.setFillColor(243, 244, 246);
            pdf.roundedRect(xPosition + 5, yPosition + 5, 40, 40, 2, 2, 'F');
            pdf.setTextColor(156, 163, 175);
            pdf.setFontSize(8);
            pdf.text('No Image', xPosition + 25, yPosition + 25, { align: 'center' });
          }
        } else {
          // Add placeholder for image
          pdf.setFillColor(243, 244, 246);
          pdf.roundedRect(xPosition + 5, yPosition + 5, 40, 40, 2, 2, 'F');
          pdf.setTextColor(156, 163, 175);
          pdf.setFontSize(8);
          pdf.text('No Image', xPosition + 25, yPosition + 25, { align: 'center' });
        }

        // Add product details
        pdf.setTextColor(0, 0, 0);
        
        // Product Name
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        const productName = product.product_name.length > 25 
          ? product.product_name.substring(0, 25) + '...' 
          : product.product_name;
        pdf.text(productName, xPosition + 50, yPosition + 12);
        
        // Material
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(16, 185, 129);
        pdf.text(`Material: ${product.material}`, xPosition + 50, yPosition + 20);
        
        // Dimensions
        pdf.setTextColor(75, 85, 99);
        pdf.text(`H: ${product.height || 'N/A'} L: ${product.length || 'N/A'} W: ${product.width || 'N/A'}`, xPosition + 50, yPosition + 27);
        
        // Technique
        pdf.text(`Technique: ${product.technique || 'N/A'}`, xPosition + 50, yPosition + 34);
        
        // Special Feature (truncated)
        if (product.special_feature) {
          const feature = product.special_feature.length > 40 
            ? product.special_feature.substring(0, 40) + '...' 
            : product.special_feature;
          pdf.text(`Features: ${feature}`, xPosition + 5, yPosition + cardHeight - 10);
        }

        // Add decorative accent
        pdf.setDrawColor(16, 185, 129);
        pdf.setLineWidth(0.5);
        pdf.line(xPosition, yPosition + cardHeight - 2, xPosition + cardWidth, yPosition + cardHeight - 2);

        // Update positions for next card
        xPosition += cardWidth + margin;
        
        // Move to next row after 2 cards
        if ((i + 1) % 2 === 0) {
          xPosition = margin;
          yPosition += cardHeight + margin;
        }
        
        // Add new page if we reach the end and there are more products
        if (yPosition + cardHeight > pageHeight - margin && i < currentProducts.length - 1) {
          pdf.addPage();
          yPosition = 40;
          xPosition = margin;
          
          // Add header to new page
          pdf.setFillColor(16, 185, 129);
          pdf.rect(0, 0, pageWidth, 30, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(24);
          pdf.setFont('helvetica', 'bold');
          pdf.text('INNOVATION PORTFOLIO', pageWidth / 2, 18, { align: 'center' });
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Page ${Math.floor(i / 8) + 2} - Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 25, { align: 'center' });
        }
      }

      // Add footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setTextColor(107, 114, 128);
        pdf.setFontSize(8);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10);
        pdf.text(`Total Products: ${currentProducts.length}`, 20, pageHeight - 10);
      }

      // Save the PDF
      pdf.save(`innovation-portfolio-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Exported Successfully",
        description: `Portfolio with ${currentProducts.length} products has been downloaded`,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const getColorBadge = (color: string) => {
    const colorMap: { [key: string]: string } = {
      natural: "bg-amber-100 text-amber-800 border-amber-200",
      colorful: "bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 border-purple-200",
      painted: "bg-blue-100 text-blue-800 border-blue-200",
      mixed: "bg-gradient-to-r from-green-100 to-teal-100 text-teal-800 border-teal-200"
    };
    return colorMap[color] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100/20">
      {/* Header */}
      <div className="border-b bg-white/90 backdrop-blur-xl border-gray-200/60 shadow-sm sticky top-0 z-30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Innovation Portfolio
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Manage your recycled product innovations
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`${viewMode === "grid" ? "bg-white shadow-sm" : ""} transition-all duration-200`}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`${viewMode === "list" ? "bg-white shadow-sm" : ""} transition-all duration-200`}
              >
                List
              </Button>
            </div>
            
            <Button 
              onClick={exportData}
              variant="outline" 
              className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>

            <Button 
              onClick={exportToPDF}
              disabled={pdfLoading || currentProducts.length === 0}
              variant="outline" 
              className="border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 transition-all duration-200"
            >
              {pdfLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {pdfLoading ? "Generating PDF..." : "Export PDF"}
            </Button>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-105">
                  <Plus className="mr-2 h-4 w-4" />
                  Register Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
                <DialogHeader className="pb-6 border-b border-gray-100">
                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    Register New Innovation
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-base mt-2">
                    Complete all details to add your innovative recycled product to the portfolio
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-8 py-6">
                  {/* Basic Information */}
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Package className="h-5 w-5 text-emerald-600" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <Label htmlFor="product_name" className="text-gray-700 font-medium flex items-center gap-2">
                              Product Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="product_name"
                              value={formData.product_name}
                              onChange={(e) => handleInputChange("product_name", e.target.value)}
                              placeholder="e.g., Eco-friendly Pen Stand"
                              className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors duration-200"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="material" className="text-gray-700 font-medium flex items-center gap-2">
                              Material <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="material"
                              value={formData.material}
                              onChange={(e) => handleInputChange("material", e.target.value)}
                              placeholder="e.g., Recycled Newspaper"
                              className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors duration-200"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <Label htmlFor="color" className="text-gray-700 font-medium flex items-center gap-2">
                                <Palette className="h-4 w-4 text-gray-500" />
                                Color
                              </Label>
                              <Select value={formData.color} onValueChange={(value) => handleInputChange("color", value)}>
                                <SelectTrigger className="border-gray-300 focus:border-emerald-500 transition-colors duration-200">
                                  <SelectValue placeholder="Select color" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="natural">Natural</SelectItem>
                                  <SelectItem value="colorful">Colorful</SelectItem>
                                  <SelectItem value="painted">Painted</SelectItem>
                                  <SelectItem value="mixed">Mixed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-3">
                              <Label htmlFor="shape" className="text-gray-700 font-medium">Shape</Label>
                              <Input
                                id="shape"
                                value={formData.shape}
                                onChange={(e) => handleInputChange("shape", e.target.value)}
                                placeholder="e.g., Cylindrical"
                                className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors duration-200"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label htmlFor="image" className="text-gray-700 font-medium">Product Image</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-all duration-300 bg-white">
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <label htmlFor="image" className="cursor-pointer block">
                              {imagePreview ? (
                                <div className="space-y-4">
                                  <div className="relative mx-auto w-48 h-48">
                                    <img 
                                      src={imagePreview} 
                                      alt="Preview" 
                                      className="w-full h-full object-cover rounded-lg shadow-lg" 
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                                      <Edit3 className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
                                    </div>
                                  </div>
                                  <p className="text-sm text-emerald-600 font-medium">Click to change image</p>
                                </div>
                              ) : (
                                <div className="space-y-4 py-8">
                                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto">
                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Drop your product image here</p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                                  </div>
                                  <Button variant="outline" className="border-gray-300 hover:border-emerald-400 transition-colors duration-200">
                                    Browse Files
                                  </Button>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dimensions */}
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Ruler className="h-5 w-5 text-emerald-600" />
                        Dimensions (cm)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="height" className="text-gray-700 font-medium">Height</Label>
                          <Input
                            id="height"
                            type="number"
                            value={formData.height}
                            onChange={(e) => handleInputChange("height", e.target.value)}
                            placeholder="0.0"
                            className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors duration-200"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="length" className="text-gray-700 font-medium">Length</Label>
                          <Input
                            id="length"
                            type="number"
                            value={formData.length}
                            onChange={(e) => handleInputChange("length", e.target.value)}
                            placeholder="0.0"
                            className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors duration-200"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="width" className="text-gray-700 font-medium">Width</Label>
                          <Input
                            id="width"
                            type="number"
                            value={formData.width}
                            onChange={(e) => handleInputChange("width", e.target.value)}
                            placeholder="0.0"
                            className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors duration-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-3">
                          <Label htmlFor="void_length" className="text-gray-700 font-medium">Void Length</Label>
                          <Input
                            id="void_length"
                            type="number"
                            value={formData.void_length}
                            onChange={(e) => handleInputChange("void_length", e.target.value)}
                            placeholder="0.0"
                            className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors duration-200"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="void_height" className="text-gray-700 font-medium">Void Height</Label>
                          <Input
                            id="void_height"
                            type="number"
                            value={formData.void_height}
                            onChange={(e) => handleInputChange("void_height", e.target.value)}
                            placeholder="0.0"
                            className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors duration-200"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Production Details */}
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-emerald-600" />
                        Production Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="print_type" className="text-gray-700 font-medium">Print Type</Label>
                          <Input
                            id="print_type"
                            value={formData.print_type}
                            onChange={(e) => handleInputChange("print_type", e.target.value)}
                            placeholder="e.g., Digital Print"
                            className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors duration-200"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="technique" className="text-gray-700 font-medium">Technique</Label>
                          <Input
                            id="technique"
                            value={formData.technique}
                            onChange={(e) => handleInputChange("technique", e.target.value)}
                            placeholder="e.g., Coiling, Weaving"
                            className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors duration-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 mt-6">
                        <Label htmlFor="finishing_material" className="text-gray-700 font-medium">Finishing Material</Label>
                        <Input
                          id="finishing_material"
                          value={formData.finishing_material}
                          onChange={(e) => handleInputChange("finishing_material", e.target.value)}
                          placeholder="e.g., Eco-friendly Varnish"
                          className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors duration-200"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Information */}
                  <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-emerald-600" />
                        Additional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="special_feature" className="text-gray-700 font-medium">Special Features</Label>
                          <Textarea
                            id="special_feature"
                            value={formData.special_feature}
                            onChange={(e) => handleInputChange("special_feature", e.target.value)}
                            placeholder="Describe unique features, benefits, and innovative aspects of your product..."
                            rows={3}
                            className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none transition-colors duration-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="additional_notes" className="text-gray-700 font-medium">Additional Notes</Label>
                          <Textarea
                            id="additional_notes"
                            value={formData.additional_notes}
                            onChange={(e) => handleInputChange("additional_notes", e.target.value)}
                            placeholder="Any additional information, manufacturing notes, or special comments..."
                            rows={3}
                            className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none transition-colors duration-200"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button 
                    onClick={handleSubmit} 
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 text-lg font-semibold shadow-xl hover:shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <Plus className="mr-3 h-5 w-5" />
                    Register Product Innovation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Card className="bg-white/90 backdrop-blur-sm border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Innovation Portfolio
                </CardTitle>
                <CardDescription className="text-gray-600 flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>{filteredInnovations.length} of {innovations.length} products</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Updated just now</span>
                  </div>
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products, materials, techniques..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors duration-200"
                  />
                </div>
                <Select value={filterMaterial} onValueChange={setFilterMaterial}>
                  <SelectTrigger className="border-gray-300 focus:border-emerald-500 w-full sm:w-48 transition-colors duration-200">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by Material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Materials</SelectItem>
                    {uniqueMaterials.map(material => (
                      <SelectItem key={material} value={material}>{material}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 text-lg font-medium">Loading innovation portfolio...</p>
                <p className="text-gray-500 text-sm">Fetching your creative products</p>
              </div>
            ) : filteredInnovations.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Lightbulb className="h-16 w-16 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Innovations Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                  {searchTerm || filterMaterial !== "all" 
                    ? "No products match your search criteria. Try adjusting your filters."
                    : "Start your sustainability journey by registering your first innovative product"
                  }
                </p>
                <Button 
                  onClick={() => setDialogOpen(true)} 
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl px-8 py-3 text-lg"
                >
                  <Plus className="mr-3 h-5 w-5" />
                  Register First Product
                </Button>
              </div>
            ) : viewMode === "list" ? (
              // List View
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 hover:bg-gray-50 border-b-2 border-gray-200">
                        <TableHead className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Product</TableHead>
                        <TableHead className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Material</TableHead>
                        <TableHead className="text-gray-700 font-semibold text-sm uppercase tracking-wide hidden lg:table-cell">Dimensions</TableHead>
                        <TableHead className="text-gray-700 font-semibold text-sm uppercase tracking-wide hidden md:table-cell">Technique</TableHead>
                        <TableHead className="text-gray-700 font-semibold text-sm uppercase tracking-wide hidden xl:table-cell">Features</TableHead>
                        <TableHead className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Date</TableHead>
                        <TableHead className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentProducts.map((item) => (
                        <TableRow key={item.id} className="border-gray-100 hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-teal-50/30 transition-all duration-200 group">
                          <TableCell>
                            <div className="flex items-center gap-4">
                              {item.image_path ? (
                                <div className="relative">
                                  <img 
                                    src={`http://localhost:5000${item.image_path}`} 
                                    alt={item.product_name} 
                                    className="h-14 w-14 object-cover rounded-xl border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow duration-200" 
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </div>
                              ) : (
                                <div className="h-14 w-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duration-200">
                                  {item.product_name}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={`${getColorBadge(item.color)} text-xs`}>
                                    {item.color}
                                  </Badge>
                                  <span>•</span>
                                  <span>{item.shape}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200 hover:from-emerald-200 hover:to-teal-200 transition-all duration-200 shadow-sm">
                              {item.material}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="text-sm text-gray-700">
                              <div className="font-medium">H: {item.height || '–'} × L: {item.length || '–'} × W: {item.width || '–'}</div>
                              {(item.void_length || item.void_height) && (
                                <div className="text-gray-500 text-xs mt-1">
                                  Void: {item.void_length || '–'} × {item.void_height || '–'}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="text-sm text-gray-700">
                              <div className="font-medium">{item.technique || '–'}</div>
                              <div className="text-gray-500 text-sm">{item.print_type || '–'}</div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell max-w-xs">
                            <div className="text-sm text-gray-700 line-clamp-2" title={item.special_feature}>
                              {item.special_feature || '–'}
                            </div>
                            {item.finishing_material && (
                              <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                {item.finishing_material}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-700 font-medium">
                              {formatDate(item.created_date)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(item.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => confirmDelete(item)}
                                disabled={deleteLoading === item.id}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                              >
                                {deleteLoading === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-6 border-t border-gray-200/60 bg-gray-50/50">
                    <div className="text-sm text-gray-600">
                      Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredInnovations.length)} of {filteredInnovations.length} innovations
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all duration-200"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => paginate(page)}
                            className={`transition-all duration-200 ${
                              currentPage === page 
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-sm" 
                                : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                            }`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all duration-200"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Grid View
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentProducts.map((item) => (
                    <Card key={item.id} className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50/50">
                      <CardContent className="p-0">
                        <div className="relative">
                          {item.image_path ? (
                            <img 
                              src={`http://localhost:5000${item.image_path}`} 
                              alt={item.product_name} 
                              className="h-48 w-full object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-white/90 backdrop-blur-sm text-gray-700 border-0 shadow-sm">
                              {item.color}
                            </Badge>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duration-200 line-clamp-1">
                              {item.product_name}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => confirmDelete(item)}
                              disabled={deleteLoading === item.id}
                              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            >
                              {deleteLoading === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          
                          <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200 mb-3">
                            {item.material}
                          </Badge>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Ruler className="h-3 w-3" />
                              <span>H: {item.height || '–'} × L: {item.length || '–'} × W: {item.width || '–'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Zap className="h-3 w-3" />
                              <span className="truncate">{item.technique || 'No technique'}</span>
                            </div>
                            {item.special_feature && (
                              <p className="text-xs text-gray-500 line-clamp-2 mt-2">
                                {item.special_feature}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                              {formatDate(item.created_date)}
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination for Grid View */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 mt-6 border-t border-gray-200/60">
                    <div className="text-sm text-gray-600">
                      Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredInnovations.length)} of {filteredInnovations.length} products
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all duration-200"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => paginate(page)}
                            className={`transition-all duration-200 ${
                              currentPage === page 
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-sm" 
                                : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                            }`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all duration-200"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              Delete Innovation?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-lg mt-4">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{innovationToDelete?.product_name}"</span>? This action cannot be undone and the product will be permanently removed from your portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading !== null}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Yes, Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductInnovations;
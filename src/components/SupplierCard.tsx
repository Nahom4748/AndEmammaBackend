
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Phone, Mail, MapPin, User, Clock } from "lucide-react";
import { Supplier } from "@/data/suppliersData";

interface SupplierCardProps {
  supplier: Supplier;
  onSchedule: (supplier: Supplier) => void;
  onViewDetails: (supplier: Supplier) => void;
}

export const SupplierCard = ({ supplier, onSchedule, onViewDetails }: SupplierCardProps) => {
  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Educational":
        return "bg-blue-100 text-blue-800";
      case "Government":
        return "bg-purple-100 text-purple-800";
      case "Private":
        return "bg-orange-100 text-orange-800";
      case "Healthcare":
        return "bg-red-100 text-red-800";
      case "Financial":
        return "bg-green-100 text-green-800";
      case "Insurance":
        return "bg-yellow-100 text-yellow-800";
      case "Legal":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{supplier.name}</CardTitle>
          </div>
          <Badge className={getStatusColor(supplier.status)}>
            {supplier.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Badge className={getTypeColor(supplier.type)} variant="outline">
            {supplier.type}
          </Badge>
          {supplier.preferredCollectionTypes.slice(0, 2).map((type, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {type.toUpperCase()}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Contact Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              {supplier.contact}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              {supplier.phone}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              {supplier.email}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              {supplier.address}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Janitor Details</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              {supplier.janitor.name}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              {supplier.janitor.phone}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {supplier.janitor.shift} Shift
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Collections</span>
            <span className="font-medium">{supplier.totalCollections}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Last Collection</span>
            <span className="font-medium">{supplier.lastCollection}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails(supplier)}
          >
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onSchedule(supplier)}
          >
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

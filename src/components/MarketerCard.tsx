
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, Building, DollarSign } from "lucide-react";
import { Marketer } from "@/types";

interface MarketerCardProps {
  marketer: Marketer;
  onViewDetails: (marketer: Marketer) => void;
  onEditMarketer: (marketer: Marketer) => void;
}

export const MarketerCard = ({ marketer, onViewDetails, onEditMarketer }: MarketerCardProps) => {
  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{marketer.name}</CardTitle>
          </div>
          <Badge className={getStatusColor(marketer.status)}>
            {marketer.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Contact Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              {marketer.phone}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              {marketer.email}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Assigned Suppliers</span>
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span className="font-medium">{marketer.assignedSuppliers.length}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Total Collections</span>
            <span className="font-medium">{marketer.totalCollections}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Monthly Earnings</span>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span className="font-medium">{marketer.monthlyEarnings.toLocaleString()} ETB</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails(marketer)}
          >
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEditMarketer(marketer)}
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

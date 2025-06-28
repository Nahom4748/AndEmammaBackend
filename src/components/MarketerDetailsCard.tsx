
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Phone, Mail, Calendar, Award, Package, Users, MapPin } from "lucide-react";
import { Marketer } from "@/types";

interface MarketerDetailsCardProps {
  marketer: Marketer;
  onEdit: (marketer: Marketer) => void;
}

export const MarketerDetailsCard = ({ marketer, onEdit }: MarketerDetailsCardProps) => {
  const getAmbassadorColor = (level?: string) => {
    switch (level) {
      case "Platinum": return "bg-purple-100 text-purple-800";
      case "Gold": return "bg-yellow-100 text-yellow-800";
      case "Silver": return "bg-gray-100 text-gray-800";
      case "Bronze": return "bg-orange-100 text-orange-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{marketer.fullName}</CardTitle>
              <p className="text-sm text-muted-foreground">Account: {marketer.account}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={marketer.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
              {marketer.status}
            </Badge>
            {marketer.ambassador.isAmbassador && (
              <Badge className={getAmbassadorColor(marketer.ambassador.level)}>
                <Award className="mr-1 h-3 w-3" />
                {marketer.ambassador.level} Ambassador
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {marketer.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {marketer.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Joined: {marketer.joinDate}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Performance Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Assigned Suppliers:</span>
                    <span className="font-medium">{marketer.assignedSuppliers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Collections:</span>
                    <span className="font-medium">{marketer.totalCollections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Earnings:</span>
                    <span className="font-medium">{marketer.monthlyEarnings.toLocaleString()} ETB</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Product Performance
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Mommas Handles</span>
                    <Badge variant="secondary">{marketer.products.mommasHandles}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Gift Baskets</span>
                    <Badge variant="secondary">{marketer.products.giftBaskets}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">Wall Decor</span>
                    <Badge variant="secondary">{marketer.products.wallDecor}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Total Production</h4>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{marketer.products.totalProducts}</div>
                  <div className="text-sm text-blue-600">Total Products Made</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="training" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium">Training Status</h4>
              <div className="grid gap-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span>Product Training</span>
                  <Badge className={marketer.training.productTraining ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {marketer.training.productTraining ? "Completed" : "Pending"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span>Sales Training</span>
                  <Badge className={marketer.training.salesTraining ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {marketer.training.salesTraining ? "Completed" : "Pending"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span>Customer Service Training</span>
                  <Badge className={marketer.training.customerServiceTraining ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {marketer.training.customerServiceTraining ? "Completed" : "Pending"}
                  </Badge>
                </div>
              </div>
              
              {marketer.ambassador.isAmbassador && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <h5 className="font-medium flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4" />
                    Ambassador Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <Badge className={getAmbassadorColor(marketer.ambassador.level)}>
                        {marketer.ambassador.level}
                      </Badge>
                    </div>
                    {marketer.ambassador.achievementDate && (
                      <div className="flex justify-between">
                        <span>Achievement Date:</span>
                        <span>{marketer.ambassador.achievementDate}</span>
                      </div>
                    )}
                    <div className="mt-2">
                      <span className="font-medium">Specialties:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {marketer.ambassador.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <h4 className="font-medium">Weekly Schedule</h4>
            <div className="space-y-3">
              {weekDays.map((day) => (
                <div key={day} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="min-w-20 font-medium capitalize text-sm">
                    {day}
                  </div>
                  <div className="flex-1">
                    {marketer.weeklySchedule[day as keyof typeof marketer.weeklySchedule].length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {marketer.weeklySchedule[day as keyof typeof marketer.weeklySchedule].map((supplier, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {supplier}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No scheduled collections</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex gap-2 mt-6">
          <Button onClick={() => onEdit(marketer)} className="flex-1">
            Edit Marketer
          </Button>
          <Button variant="outline" className="flex-1">
            View Full Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

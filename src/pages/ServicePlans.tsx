import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Wifi, 
  Zap, 
  Users,
  DollarSign,
  Check,
  X
} from 'lucide-react';

interface ServicePlan {
  id: string;
  name: string;
  description?: string;
  type: 'residential' | 'business' | 'enterprise';
  speed_mbps: number;
  data_limit_gb?: number;
  monthly_price: number;
  setup_fee: number;
  is_active: boolean;
  created_at: string;
  customer_subscriptions?: Array<{ id: string }>;
}

export default function ServicePlans() {
  const { isAdmin } = useAuth();
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null);

  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    type: 'residential' as 'residential' | 'business' | 'enterprise',
    speed_mbps: '',
    data_limit_gb: '',
    monthly_price: '',
    setup_fee: '',
    is_active: true
  });

  useEffect(() => {
    if (isAdmin) {
      fetchPlans();
    }
  }, [isAdmin]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('service_plans')
        .select(`
          *,
          customer_subscriptions (id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch service plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      const { error } = await supabase
        .from('service_plans')
        .insert([{
          name: newPlan.name,
          description: newPlan.description || null,
          type: newPlan.type,
          speed_mbps: parseInt(newPlan.speed_mbps),
          data_limit_gb: newPlan.data_limit_gb ? parseInt(newPlan.data_limit_gb) : null,
          monthly_price: parseFloat(newPlan.monthly_price),
          setup_fee: parseFloat(newPlan.setup_fee),
          is_active: newPlan.is_active
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service plan created successfully"
      });

      setDialogOpen(false);
      setNewPlan({
        name: '',
        description: '',
        type: 'residential',
        speed_mbps: '',
        data_limit_gb: '',
        monthly_price: '',
        setup_fee: '',
        is_active: true
      });
      fetchPlans();
    } catch (error: any) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service plan",
        variant: "destructive"
      });
    }
  };

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('service_plans')
        .update({ is_active: !currentStatus })
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });

      fetchPlans();
    } catch (error: any) {
      console.error('Error updating plan status:', error);
      toast({
        title: "Error",
        description: "Failed to update plan status",
        variant: "destructive"
      });
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('service_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service plan deleted successfully"
      });

      fetchPlans();
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete service plan",
        variant: "destructive"
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'residential': return 'bg-blue-100 text-blue-800';
      case 'business': return 'bg-green-100 text-green-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
        <p className="text-muted-foreground">
          This page is only accessible to administrators.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Plans</h1>
          <p className="text-muted-foreground">
            Manage your WiFi service packages
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Service Plan</DialogTitle>
              <DialogDescription>
                Add a new WiFi service package for customers
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                    placeholder="Basic Home WiFi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Plan Type</Label>
                  <Select 
                    value={newPlan.type} 
                    onValueChange={(value: any) => setNewPlan({...newPlan, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                  placeholder="Perfect for basic internet usage..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speed_mbps">Speed (Mbps)</Label>
                  <Input
                    id="speed_mbps"
                    type="number"
                    value={newPlan.speed_mbps}
                    onChange={(e) => setNewPlan({...newPlan, speed_mbps: e.target.value})}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_limit_gb">Data Limit (GB)</Label>
                  <Input
                    id="data_limit_gb"
                    type="number"
                    value={newPlan.data_limit_gb}
                    onChange={(e) => setNewPlan({...newPlan, data_limit_gb: e.target.value})}
                    placeholder="100 (leave empty for unlimited)"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly_price">Monthly Price (KES)</Label>
                  <Input
                    id="monthly_price"
                    type="number"
                    step="0.01"
                    value={newPlan.monthly_price}
                    onChange={(e) => setNewPlan({...newPlan, monthly_price: e.target.value})}
                    placeholder="2500.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup_fee">Setup Fee (KES)</Label>
                  <Input
                    id="setup_fee"
                    type="number"
                    step="0.01"
                    value={newPlan.setup_fee}
                    onChange={(e) => setNewPlan({...newPlan, setup_fee: e.target.value})}
                    placeholder="1000.00"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlan}>
                Create Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {plans.filter(p => p.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.reduce((sum, plan) => sum + (plan.customer_subscriptions?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {Math.round(plans.reduce((sum, plan) => 
                sum + (plan.monthly_price * (plan.customer_subscriptions?.length || 0)), 0
              )).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${!plan.is_active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(plan.type)}>
                    {plan.type}
                  </Badge>
                  {plan.is_active ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
              {plan.description && (
                <CardDescription>
                  {plan.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Speed */}
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">{plan.speed_mbps} Mbps</span>
                </div>
                
                {/* Data Limit */}
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    {plan.data_limit_gb ? `${plan.data_limit_gb} GB/month` : 'Unlimited Data'}
                  </span>
                </div>
                
                {/* Subscribers */}
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    {plan.customer_subscriptions?.length || 0} subscribers
                  </span>
                </div>
                
                {/* Pricing */}
                <div className="border-t pt-4">
                  <div className="text-2xl font-bold">
                    KES {plan.monthly_price.toLocaleString()}/month
                  </div>
                  {plan.setup_fee > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Setup fee: KES {plan.setup_fee.toLocaleString()}
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                    className="flex-1"
                  >
                    {plan.is_active ? (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deletePlan(plan.id)}
                    disabled={(plan.customer_subscriptions?.length || 0) > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {(plan.customer_subscriptions?.length || 0) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Cannot delete - has active subscribers
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {plans.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Wifi className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Service Plans</h3>
            <p className="text-muted-foreground mb-4">
              Create your first service plan to start offering WiFi services
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
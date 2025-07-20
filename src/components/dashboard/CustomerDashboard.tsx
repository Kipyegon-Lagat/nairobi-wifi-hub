import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Wifi, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Download,
  Upload,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface CustomerData {
  customer: any;
  subscription: any;
  plan: any;
  recentInvoices: any[];
  usageData: any[];
}

export function CustomerDashboard() {
  const { user, profile } = useAuth();
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock usage data for demo
  const usageData = [
    { day: 'Mon', download: 2.5, upload: 0.8, speed: 45 },
    { day: 'Tue', download: 3.2, upload: 1.1, speed: 48 },
    { day: 'Wed', download: 2.8, upload: 0.9, speed: 47 },
    { day: 'Thu', download: 4.1, upload: 1.3, speed: 46 },
    { day: 'Fri', download: 5.2, upload: 1.8, speed: 44 },
    { day: 'Sat', download: 6.8, upload: 2.1, speed: 43 },
    { day: 'Sun', download: 4.5, upload: 1.4, speed: 46 },
  ];

  const monthlyUsage = [
    { month: 'Jan', usage: 65 },
    { month: 'Feb', usage: 72 },
    { month: 'Mar', usage: 68 },
    { month: 'Apr', usage: 85 },
    { month: 'May', usage: 78 },
    { month: 'Jun', usage: 82 },
  ];

  useEffect(() => {
    if (user) {
      fetchCustomerData();
    }
  }, [user]);

  const fetchCustomerData = async () => {
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Use Promise.allSettled to handle failures gracefully
      const [customerResult, invoicesResult] = await Promise.allSettled([
        supabase.from('customers').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      const customer = customerResult.status === 'fulfilled' ? customerResult.value.data : null;
      const recentInvoices = invoicesResult.status === 'fulfilled' ? invoicesResult.value.data : [];

      let subscription = null;
      let plan = null;

      if (customer?.id) {
        const { data: subscriptionData } = await supabase
          .from('customer_subscriptions')
          .select(`
            *,
            service_plans (*)
          `)
          .eq('customer_id', customer.id)
          .eq('is_active', true)
          .maybeSingle();

        subscription = subscriptionData;
        plan = subscriptionData?.service_plans;
      }

      setData({
        customer,
        subscription,
        plan,
        recentInvoices: recentInvoices || [],
        usageData
      });
    } catch (error) {
      console.error('Error fetching customer data:', error);
      // Set empty data to prevent infinite load
      setData({
        customer: null,
        subscription: null,
        plan: null,
        recentInvoices: [],
        usageData
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const currentPlan = data?.plan;
  const customer = data?.customer;
  const recentInvoices = data?.recentInvoices || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name}!</h1>
          <p className="text-muted-foreground">
            Here's your WiFi service overview
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Phone className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
          <Button>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Bill
          </Button>
        </div>
      </div>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentPlan?.name || 'No Plan'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentPlan?.speed_mbps}Mbps • KES {currentPlan?.monthly_price}/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              Connected since 6:30 AM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Bill</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {currentPlan?.monthly_price || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Due in 5 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage</CardTitle>
            <CardDescription>
              Your internet usage over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  `${value} GB`, 
                  name === 'download' ? 'Download' : 'Upload'
                ]} />
                <Area 
                  type="monotone" 
                  dataKey="download" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="upload" 
                  stackId="1"
                  stroke="hsl(var(--secondary))" 
                  fill="hsl(var(--secondary))"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage Trend</CardTitle>
            <CardDescription>
              Data usage percentage over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                <Line 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Usage Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Current Month Usage</CardTitle>
          <CardDescription>
            {currentPlan?.data_limit_gb ? `Your data usage this month (${currentPlan.data_limit_gb}GB limit)` : 'Unlimited data plan'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan?.data_limit_gb ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Used</span>
                <span className="text-sm text-muted-foreground">45.2GB / {currentPlan.data_limit_gb}GB</span>
              </div>
              <Progress value={(45.2 / currentPlan.data_limit_gb) * 100} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4 text-blue-500" />
                  <span>Download: 38.1GB</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4 text-green-500" />
                  <span>Upload: 7.1GB</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Wifi className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Unlimited Data</h3>
              <p className="text-muted-foreground">Enjoy unlimited internet usage with your current plan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Bills */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
          <CardDescription>
            Your billing history and payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentInvoices.length > 0 ? (
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Invoice #{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">KES {Number(invoice.total_amount).toLocaleString()}</p>
                    <Badge variant={
                      invoice.status === 'paid' ? 'default' :
                      invoice.status === 'sent' ? 'secondary' :
                      invoice.status === 'overdue' ? 'destructive' : 'outline'
                    }>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Bills Yet</h3>
              <p className="text-muted-foreground">Your billing history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{profile?.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Service Address</p>
                  <p className="text-sm text-muted-foreground">{customer?.address || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Customer Since</p>
                  <p className="text-sm text-muted-foreground">
                    {customer?.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

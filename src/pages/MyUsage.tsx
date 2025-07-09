import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Download, 
  Upload, 
  Wifi, 
  TrendingUp,
  Calendar,
  Gauge
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface UsageData {
  day: string;
  download: number;
  upload: number;
  total: number;
  speed: number;
}

interface CustomerData {
  customer: any;
  subscription: any;
  plan: any;
}

export default function MyUsage() {
  const { user } = useAuth();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock usage data - in real app, this would come from network monitoring
  const usageData: UsageData[] = [
    { day: 'Mon', download: 2.5, upload: 0.8, total: 3.3, speed: 45 },
    { day: 'Tue', download: 3.2, upload: 1.1, total: 4.3, speed: 48 },
    { day: 'Wed', download: 2.8, upload: 0.9, total: 3.7, speed: 47 },
    { day: 'Thu', download: 4.1, upload: 1.3, total: 5.4, speed: 46 },
    { day: 'Fri', download: 5.2, upload: 1.8, total: 7.0, speed: 44 },
    { day: 'Sat', download: 6.8, upload: 2.1, total: 8.9, speed: 43 },
    { day: 'Sun', download: 4.5, upload: 1.4, total: 5.9, speed: 46 },
  ];

  const monthlyTrend = [
    { month: 'Jan', usage: 65 },
    { month: 'Feb', usage: 72 },
    { month: 'Mar', usage: 68 },
    { month: 'Apr', usage: 85 },
    { month: 'May', usage: 78 },
    { month: 'Jun', usage: 82 },
  ];

  const currentUsage = 45.2; // GB used this month
  const speedTests = [
    { time: '09:00', download: 48, upload: 12 },
    { time: '12:00', download: 46, upload: 11 },
    { time: '15:00', download: 47, upload: 12 },
    { time: '18:00', download: 44, upload: 10 },
    { time: '21:00', download: 45, upload: 11 },
  ];

  useEffect(() => {
    fetchCustomerData();
  }, [user]);

  const fetchCustomerData = async () => {
    if (!user?.id) return;
    
    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customer?.id) {
        const { data: subscription } = await supabase
          .from('customer_subscriptions')
          .select(`
            *,
            service_plans (*)
          `)
          .eq('customer_id', customer.id)
          .eq('is_active', true)
          .maybeSingle();

        setCustomerData({
          customer,
          subscription,
          plan: subscription?.service_plans
        });
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Usage Monitor</h1>
          <p className="text-muted-foreground">Loading your usage data...</p>
        </div>
        <div className="grid gap-4">
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

  const currentPlan = customerData?.plan;
  const hasDataLimit = currentPlan?.data_limit_gb;
  const usagePercentage = hasDataLimit ? (currentUsage / currentPlan.data_limit_gb) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usage Monitor</h1>
        <p className="text-muted-foreground">
          Track your internet usage and performance
        </p>
      </div>

      {/* Current Plan & Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPlan?.name || 'No Plan'}</div>
            <p className="text-xs text-muted-foreground">
              {currentPlan?.speed_mbps}Mbps • KES {currentPlan?.monthly_price}/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Used</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUsage} GB</div>
            <p className="text-xs text-muted-foreground">
              {hasDataLimit ? `of ${currentPlan.data_limit_gb}GB limit` : 'Unlimited'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Speed</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">46 Mbps</div>
            <p className="text-xs text-muted-foreground">
              Download speed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              Connected since 6:30 AM
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Usage Progress */}
      {hasDataLimit && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Data Usage</CardTitle>
            <CardDescription>
              Your data consumption for this billing period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Usage Progress</span>
                <span className="text-sm text-muted-foreground">
                  {currentUsage}GB / {currentPlan.data_limit_gb}GB ({usagePercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={usagePercentage} className="h-3" />
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
              {usagePercentage > 80 && (
                <div className="flex items-center space-x-2 text-orange-600 text-sm">
                  <Activity className="h-4 w-4" />
                  <span>You're approaching your data limit</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage (Last 7 Days)</CardTitle>
            <CardDescription>
              Your internet usage breakdown by day
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

        {/* Speed Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Speed Performance Today</CardTitle>
            <CardDescription>
              Download and upload speeds throughout the day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={speedTests}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  `${value} Mbps`, 
                  name === 'download' ? 'Download' : 'Upload'
                ]} />
                <Bar dataKey="download" fill="hsl(var(--primary))" />
                <Bar dataKey="upload" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trend (6 Months)</CardTitle>
          <CardDescription>
            Your monthly usage pattern over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
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
  );
}
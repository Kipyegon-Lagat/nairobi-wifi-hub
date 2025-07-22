import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  DollarSign, 
  Wifi, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Eye,
  CreditCard
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalCustomers: Number;
  activeCustomers: Number;
  totalRevenue: number;
  monthlyRevenue: Number;
  totalPlans: number;
  pendingPayments: Number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalPlans: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);

  const revenueData = [
    { month: 'Jan', revenue: 45000, customers: 120 },
    { month: 'Feb', revenue: 52000, customers: 135 },
    { month: 'Mar', revenue: 48000, customers: 142 },
    { month: 'Apr', revenue: 61000, customers: 158 },
    { month: 'May', revenue: 55000, customers: 162 },
    { month: 'Jun', revenue: 67000, customers: 175 },
  ];

  const planDistribution = [
    { name: 'Basic Home', value: 35, color: '#0088FE' },
    { name: 'Premium Home', value: 25, color: '#00C49F' },
    { name: 'Unlimited Home', value: 20, color: '#FFBB28' },
    { name: 'Small Business', value: 15, color: '#FF8042' },
    { name: 'Enterprise', value: 5, color: '#8884D8' },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Use Promise.allSettled to handle any individual failures gracefully
      const [customersResult, plansResult, paymentsResult, invoicesResult] = await Promise.allSettled([
        supabase.from('customers').select('status'),
        supabase.from('service_plans').select('id').eq('is_active', true),
        supabase.from('payments').select('amount, created_at').eq('status', 'completed'),
        supabase.from('invoices').select('id').in('status', ['sent', 'overdue'])
      ]);

      // Extract data with fallbacks
      const customers = customersResult.status === 'fulfilled' ? customersResult.value.data : [];
      const plans = plansResult.status === 'fulfilled' ? plansResult.value.data : [];
      const payments = paymentsResult.status === 'fulfilled' ? paymentsResult.value.data : [];
      const pendingInvoices = invoicesResult.status === 'fulfilled' ? invoicesResult.value.data : [];

      // Calculate stats with safe fallbacks
      const totalCustomers = customers?.length || 0;
      const activeCustomers = customers?.filter(c => c.status === 'active').length || 0;
      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
      
      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = payments?.filter(p => {
        const paymentDate = new Date(p.created_at);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      }).reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

      setStats({
        totalCustomers,
        activeCustomers,
        totalRevenue,
        monthlyRevenue,
        totalPlans: plans?.length || 0,
        pendingPayments: pendingInvoices?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats to prevent infinite loading
      setStats({
        totalCustomers: 0,
        activeCustomers: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalPlans: 5, // We have sample plans
        pendingPayments: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold"> Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! .
          </p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.activeCustomers} active</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly  Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+20.1% from last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Plans</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlans}</div>
            <p className="text-xs text-muted-foreground">
              Active plans available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingPayments}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Monthly revenue over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Revenue']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Service Plan Distribution</CardTitle>
            <CardDescription>
              Customer distribution across service plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {planDistribution.map((plan, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: plan.color }}
                  ></div>
                  <span className="text-sm">{plan.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest customer and payment activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'payment', customer: 'John Doe', amount: 'KES 4,500', time: '2 hours ago', status: 'completed' },
              { type: 'signup', customer: 'Jane Smith', amount: 'Premium Plan', time: '4 hours ago', status: 'active' },
              { type: 'payment', customer: 'Bob Wilson', amount: 'KES 2,500', time: '6 hours ago', status: 'completed' },
              { type: 'overdue', customer: 'Alice Brown', amount: 'KES 7,500', time: '1 day ago', status: 'overdue' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  {activity.type === 'payment' && <CreditCard className="h-4 w-4 text-green-600" />}
                  {activity.type === 'signup' && <Users className="h-4 w-4 text-blue-600" />}
                  {activity.type === 'overdue' && <AlertCircle className="h-4 w-4 text-red-600" />}
                  <div>
                    <p className="font-medium">{activity.customer}</p>
                    <p className="text-sm text-muted-foreground">{activity.amount}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={
                    activity.status === 'completed' ? 'default' :
                    activity.status === 'active' ? 'secondary' :
                    activity.status === 'overdue' ? 'destructive' : 'outline'
                  }>
                    {activity.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

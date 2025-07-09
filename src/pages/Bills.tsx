import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { 
  Receipt, 
  Download, 
  CreditCard, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  status: string;
  due_date: string;
  issued_date: string;
  paid_date?: string;
  created_at: string;
}

export default function Bills() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const fetchInvoices = async () => {
    if (!user?.id) return;
    
    try {
      // First get customer data
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customer?.id) {
        const { data: invoicesData } = await supabase
          .from('invoices')
          .select('*')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false });

        setInvoices(invoicesData || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Receipt className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'overdue':
        return 'destructive';
      case 'sent':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Bills</h1>
          <p className="text-muted-foreground">Loading your billing history...</p>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Bills</h1>
          <p className="text-muted-foreground">
            View and manage your billing history
          </p>
        </div>
        <Button>
          <CreditCard className="mr-2 h-4 w-4" />
          Make Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              KES {invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + Number(i.total_amount), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(i => i.status !== 'paid').length} unpaid bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {invoices.filter(i => {
                const invoiceDate = new Date(i.created_at);
                const currentDate = new Date();
                return invoiceDate.getMonth() === currentDate.getMonth() && 
                       invoiceDate.getFullYear() === currentDate.getFullYear();
              }).reduce((sum, i) => sum + Number(i.total_amount), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month charges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KES {invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total_amount), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bills List */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            All your bills and payment records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(invoice.status)}
                    <div>
                      <div className="font-medium">Invoice #{invoice.invoice_number}</div>
                      <div className="text-sm text-muted-foreground">
                        Issued: {new Date(invoice.issued_date).toLocaleDateString()}
                        {invoice.due_date && (
                          <> • Due: {new Date(invoice.due_date).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">
                        KES {Number(invoice.total_amount).toLocaleString()}
                      </div>
                      <Badge variant={getStatusVariant(invoice.status)} className="text-xs">
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      {invoice.status !== 'paid' && (
                        <Button size="sm">
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Bills Yet</h3>
              <p className="text-muted-foreground">Your billing history will appear here once you have active services.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
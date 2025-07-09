import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Headphones,
  FileText,
  Settings,
  Wifi
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  category: string;
}

export default function Support() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  // Mock support tickets - in real app, this would come from database
  const tickets: Ticket[] = [
    {
      id: '1',
      subject: 'Slow internet connection',
      status: 'in-progress',
      priority: 'high',
      created_at: '2024-01-15T10:00:00Z',
      category: 'technical'
    },
    {
      id: '2',
      subject: 'Billing inquiry',
      status: 'resolved',
      priority: 'medium',
      created_at: '2024-01-10T14:30:00Z',
      category: 'billing'
    }
  ];

  const handleSubmitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Support ticket created",
        description: "We've received your ticket and will respond within 24 hours.",
      });
      
      setTicketForm({
        subject: '',
        category: '',
        priority: 'medium',
        description: ''
      });
      setShowNewTicket(false);
      setLoading(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'open':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'open':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Center</h1>
          <p className="text-muted-foreground">
            Get help with your WiFi service and account
          </p>
        </div>
        <Button onClick={() => setShowNewTicket(true)}>
          <MessageCircle className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phone Support</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+254 700 000 000</div>
            <p className="text-xs text-muted-foreground">
              Available 24/7 for emergencies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Support</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">support@nairobiwifi.com</div>
            <p className="text-xs text-muted-foreground">
              Response within 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Chat</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" />
              Start Chat
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Available Mon-Fri 8AM-6PM
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Help & FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Help</CardTitle>
          <CardDescription>
            Common solutions for frequent issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <Wifi className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Internet is slow</div>
                  <div className="text-sm text-muted-foreground">
                    Restart your router and check for interference
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <Settings className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Cannot connect to WiFi</div>
                  <div className="text-sm text-muted-foreground">
                    Check password and network settings
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Billing questions</div>
                  <div className="text-sm text-muted-foreground">
                    Understand your bill and payment options
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Service outage</div>
                  <div className="text-sm text-muted-foreground">
                    Report and check outage status
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create New Ticket Form */}
      {showNewTicket && (
        <Card>
          <CardHeader>
            <CardTitle>Create Support Ticket</CardTitle>
            <CardDescription>
              Describe your issue and we'll help you resolve it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  placeholder="Brief description of the issue"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={ticketForm.category} onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="general">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                placeholder="Provide detailed information about your issue..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewTicket(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitTicket} disabled={loading}>
                <Send className="mr-2 h-4 w-4" />
                {loading ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Your Support Tickets</CardTitle>
          <CardDescription>
            Track the status of your support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(ticket.status)}
                    <div>
                      <div className="font-medium">{ticket.subject}</div>
                      <div className="text-sm text-muted-foreground">
                        Ticket #{ticket.id} • {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant={getPriorityVariant(ticket.priority)} className="text-xs">
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </Badge>
                    <Badge variant={getStatusVariant(ticket.status)} className="text-xs">
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Support Tickets</h3>
              <p className="text-muted-foreground mb-4">You haven't created any support tickets yet.</p>
              <Button onClick={() => setShowNewTicket(true)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Create Your First Ticket
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
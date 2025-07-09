import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  BarChart3, 
  Settings, 
  Wifi, 
  Activity,
  User,
  Receipt,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    title: 'Service Plans',
    href: '/plans',
    icon: Wifi,
  },
  {
    title: 'Billing',
    href: '/billing',
    icon: FileText,
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: CreditCard,
  },
  {
    title: 'Usage Monitor',
    href: '/usage',
    icon: Activity,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const customerNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'My Account',
    href: '/account',
    icon: User,
  },
  {
    title: 'My Bills',
    href: '/bills',
    icon: Receipt,
  },
  {
    title: 'Usage',
    href: '/my-usage',
    icon: Activity,
  },
  {
    title: 'Support',
    href: '/support',
    icon: HelpCircle,
  },
];

export function Sidebar() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const navItems = isAdmin ? adminNavItems : customerNavItems;

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className={cn(
      "bg-card border-r transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Toggle Button */}
      <div className="p-4 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Logo */}
      <div className="p-4 border-b">
        {!collapsed ? (
          <div className="flex items-center space-x-2">
            <Wifi className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-lg font-bold">NWS</h2>
              <p className="text-xs text-muted-foreground">WiFi Solutions</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Wifi className="h-8 w-8 text-primary" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    "hover:bg-muted",
                    active && "bg-primary text-primary-foreground hover:bg-primary/90",
                    collapsed && "justify-center"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="font-medium">{item.title}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Role Badge */}
      {!collapsed && (
        <div className="p-4 border-t">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">
              Logged in as
            </div>
            <div className="text-sm font-medium text-primary">
              {isAdmin ? 'Administrator' : 'Customer'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
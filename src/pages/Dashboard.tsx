import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { isAdmin, isCustomer, profile, user, signOut } = useAuth();

  console.log('Dashboard Debug:', { isAdmin, isCustomer, profile, user });

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isCustomer) {
    return <CustomerDashboard />;
  }

  return (
    <div className="text-center space-y-4">
      <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
      <p className="text-muted-foreground">
        Please contact your administrator for access.
      </p>
      <div className="space-y-2">
        <p className="text-sm">Debug Info:</p>
        <p className="text-xs">User: {user?.email || 'Not signed in'}</p>
        <p className="text-xs">Profile: {profile ? JSON.stringify(profile) : 'No profile'}</p>
        <p className="text-xs">Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
        <p className="text-xs">Is Customer: {isCustomer ? 'Yes' : 'No'}</p>
        <Button onClick={signOut} className="mt-4">Sign Out (Debug)</Button>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { CustomerDashboard } from '@/components/dashboard/CustomerDashboard';

export default function Dashboard() {
  const { isAdmin, isCustomer } = useAuth();

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isCustomer) {
    return <CustomerDashboard />;
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
      <p className="text-muted-foreground">
        Please contact your administrator for access.
      </p>
    </div>
  );
}
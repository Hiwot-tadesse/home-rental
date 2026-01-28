// src/pages/AdminDashboard.tsx
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminProperties } from '@/hooks/useProperties';
import { useAdminUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, Building, Users, Clock, CheckCircle, TrendingUp, 
  Package, ShoppingCart, BarChart, Home, User
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const { data: properties, isLoading: propertiesLoading } = useAdminProperties();
  const { data: users, isLoading: usersLoading } = useAdminUsers();

  const isLoading = authLoading || propertiesLoading || usersLoading;

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/');
    }
  }, [user, role, authLoading, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Stats
  const totalProperties = properties?.length || 0;
  const totalUsers = users?.length || 0;
  const pendingProperties = properties?.filter(p => p.status === 'pending').length || 0;
  const approvedProperties = properties?.filter(p => p.status === 'approved').length || 0;

  // Format price in ETB
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation - Kept Exactly As Requested */}
          <div className="lg:w-64 bg-card rounded-xl border border-border p-4 shadow-soft">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Building className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="font-display text-lg font-bold">myHome Admin</h2>
            </div>

            <nav className="space-y-2">
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link to="/admin">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link to="/admin/bookings">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Bookings
                </Link>
              </Button>
              
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link to="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </Link>
              </Button>
              
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link to="/admin/properties">
                  <Package className="h-4 w-4 mr-2" />
                  Properties
                </Link>
              </Button>
              
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link to="/admin/analytics">
                  <BarChart className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </Button>
            </nav>

            <div className="mt-8 pt-4 border-t border-border">
              <Button asChild variant="ghost" className="w-full justify-start text-destructive">
                <Link to="/auth/logout">
                  <Home className="h-4 w-4 mr-2" />
                  Logout
                </Link>
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's what's happening on myHome.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProperties}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{pendingProperties}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{approvedProperties}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Properties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    Recently Submitted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {properties?.filter(p => p.status === 'pending').length === 0 ? (
                    <p className="text-muted-foreground">No pending properties</p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {properties
                        ?.filter(p => p.status === 'pending')
                        .slice(0, 3)
                        .map(p => (
                          <div key={p.id} className="flex justify-between text-sm">
                            <span className="truncate">{p.title}</span>
                            <span className="text-muted-foreground">{formatPrice(p.price)}</span>
                          </div>
                        ))}
                      {pendingProperties > 3 && (
                        <Button asChild variant="link" className="p-0 mt-2">
                          <Link to="/admin/properties">View all pending ({pendingProperties})</Link>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Properties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Top Properties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {properties?.length === 0 ? (
                    <p className="text-muted-foreground">No properties listed</p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {properties
                        .sort((a, b) => b.price - a.price)
                        .slice(0, 3)
                        .map(p => (
                          <div key={p.id} className="flex justify-between text-sm">
                            <span className="truncate">{p.title}</span>
                            <span className="text-muted-foreground">{formatPrice(p.price)}</span>
                          </div>
                        ))}
                      <Button asChild variant="link" className="p-0 mt-2">
                        <Link to="/admin/properties">View all properties</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
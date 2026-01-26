// src/pages/AdminDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminProperties, useUpdateProperty, useDeleteProperty } from '@/hooks/useProperties';
import { useAdminUsers } from '@/hooks/useUsers'; // ✅ Added user hook
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, XCircle, Trash2, Loader2, Home, MapPin, DollarSign, Bed, Clock, Key, User, Users,
  AlertTriangle, TrendingUp, Building, FileText, ShoppingCart, BarChart,
  Package, ClipboardList, ArrowUpRight, ArrowDownRight, Star, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
// Install recharts: npm install recharts
import {
  ResponsiveContainer,
  LineChart,
  Line as RechartsLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const statusConfig = {
  pending: { label: 'Pending Review', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-800' },
  rented: { label: 'Rented', icon: Key, className: 'bg-blue-100 text-blue-800' },
};

// Mock data for charts
const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 5500 },
  { name: 'Jul', sales: 7000 },
  { name: 'Aug', sales: 6500 },
  { name: 'Sep', sales: 8000 },
  { name: 'Oct', sales: 7500 },
  { name: 'Nov', sales: 9000 },
  { name: 'Dec', sales: 8500 },
];

const usersData = [
  { name: 'Jan', users: 120 },
  { name: 'Feb', users: 150 },
  { name: 'Mar', users: 200 },
  { name: 'Apr', users: 250 },
  { name: 'May', users: 300 },
  { name: 'Jun', users: 350 },
  { name: 'Jul', users: 400 },
  { name: 'Aug', users: 450 },
  { name: 'Sep', users: 500 },
  { name: 'Oct', users: 550 },
  { name: 'Nov', users: 600 },
  { name: 'Dec', users: 650 },
];

const propertyStatusData = [
  { name: 'Approved', value: 75, color: '#10B981' },
  { name: 'Pending', value: 15, color: '#F59E0B' },
  { name: 'Rejected', value: 10, color: '#EF4444' },
];

export default function AdminDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: properties, isLoading: propertiesLoading, refetch } = useAdminProperties();
  const { data: users, isLoading: usersLoading } = useAdminUsers(); // ✅ Get users data
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();

  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/');
    }
  }, [user, role, authLoading, navigate]);

  const handleApprove = async (id: string) => {
    await updateProperty.mutateAsync({ id, status: 'approved' });
    toast.success('Property approved!');
    refetch();
  };

  const handleReject = async (id: string) => {
    await updateProperty.mutateAsync({ id, status: 'rejected' });
    toast.success('Property rejected');
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteProperty.mutateAsync(id);
    toast.success('Property deleted');
    refetch();
  };

  if (authLoading || propertiesLoading || usersLoading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const pendingProperties = properties?.filter((p) => p.status === 'pending') || [];
  const approvedProperties = properties?.filter((p) => p.status === 'approved') || [];
  const rejectedProperties = properties?.filter((p) => p.status === 'rejected') || [];
  const rentedProperties = properties?.filter((p) => p.status === 'rented') || [];

  // Stats
  const totalProperties = properties?.length || 0;
  const totalUsers = users?.length || 0;
  const totalPending = pendingProperties.length;
  const totalApproved = approvedProperties.length;

  const PropertyCard = ({ property, showActions = false }: { property: any; showActions?: boolean }) => {
    const status = statusConfig[property.status as keyof typeof statusConfig];
    const StatusIcon = status.icon;

    return (
      <Card className="shadow-soft hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Image */}
            <div className="w-full md:w-40 h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {property.images && property.images[0] ? (
                <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-display text-lg font-semibold truncate">{property.title}</h3>
                <Badge className={status.className}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {property.city}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ${property.price}/mo
                </span>
                <span className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  {property.rooms} rooms
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Owner: {property.owner_id?.substring(0, 8)}...
                </span>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(property.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(property.id)}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}

              {property.status === 'rented' && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(property.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove Listing
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Recent activity mock data
  const recentOrders = [
    { id: 1, product: 'Lasania Chicken Fri', trackingId: '18908424', date: '2 March 2022', status: 'Approved' },
    { id: 2, product: 'Big Baza Bang', trackingId: '18908424', date: '2 March 2022', status: 'Pending' },
    { id: 3, product: 'Mouth Freshner', trackingId: '18908424', date: '2 March 2022', status: 'Approved' },
    { id: 4, product: 'Cupcake', trackingId: '18908421', date: '2 March 2022', status: 'Delivered' },
  ];

  // Customer reviews mock data
  const customerReviews = [
    { id: 1, name: 'Andrew Thomas', review: 'Apple smart watch 2500mh battery.', time: '25 seconds ago' },
    { id: 2, name: 'James Bond', review: 'Samsung gadget for charging battery.', time: '30 minutes ago' },
    { id: 3, name: 'Iron Man', review: 'Apple smart watch, samsung Gear 2500mh battery.', time: '2 hours ago' },
  ];

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 bg-card rounded-xl border border-border p-4 shadow-soft">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Building className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="font-display text-lg font-bold">Shops</h2>
            </div>

            <nav className="space-y-2">
              <Button 
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('dashboard')}
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              
              <Button 
                variant={activeTab === 'orders' ? 'default' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Orders
              </Button>
              
              <Button 
                variant={activeTab === 'customers' ? 'default' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('customers')}
              >
                <Users className="h-4 w-4 mr-2" />
                Customers
              </Button>
              
              <Button 
                variant={activeTab === 'products' ? 'default' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('products')}
              >
                <Package className="h-4 w-4 mr-2" />
                Products
              </Button>
              
              <Button 
                variant={activeTab === 'analytics' ? 'default' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('analytics')}
              >
                <BarChart className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </nav>

            <div className="mt-8 pt-4 border-t border-border">
              <Button variant="ghost" className="w-full justify-start text-destructive">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Manage property listings and platform activity</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProperties}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{totalPending}</div>
                  <p className="text-xs text-muted-foreground">-5% from last month</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{totalApproved}</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Charts */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Sales Chart */}
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Sales Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <RechartsLine type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Users Chart */}
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        User Growth
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={usersData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="users" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Submissions */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      Recent Submissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pendingProperties.length > 0 ? (
                      <div className="space-y-4">
                        {pendingProperties.slice(0, 5).map((property) => (
                          <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                                <Home className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">{property.title}</h4>
                                <p className="text-xs text-muted-foreground">{property.city} • ${property.price}/mo</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                                onClick={() => handleApprove(property.id)}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                onClick={() => handleReject(property.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                        <p>No pending submissions</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Updates & Stats */}
              <div className="space-y-6">
                {/* Updates */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {customerReviews.map((review, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{review.name} has ordered {review.review}</p>
                            <p className="text-xs text-muted-foreground mt-1">{review.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Property Status Chart */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Property Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={propertyStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {propertyStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/admin/users">
                        <Users className="h-4 w-4 mr-2" />
                        View All Users
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/browse">
                        <Home className="h-4 w-4 mr-2" />
                        Browse Properties
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
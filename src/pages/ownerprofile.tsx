import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useOwnerProperties } from '@/hooks/useProperties';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Phone, User, Save, Plus, Clock, CheckCircle, XCircle, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: properties } = useOwnerProperties();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      const storedPhone = localStorage.getItem('userPhone') || '';
      setPhone(storedPhone);
      setLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    localStorage.setItem('userPhone', phone);
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    storedUser.full_name = fullName;
    localStorage.setItem('user', JSON.stringify(storedUser));

    toast.success('Profile updated successfully');
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const roleColors = {
    renter: 'bg-blue-100 text-blue-800',
    owner: 'bg-green-100 text-green-800',
    admin: 'bg-purple-100 text-purple-800',
  };

  const statusConfig = {
    pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'Approved', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-800' },
    rented: { label: 'Rented', icon: Key, className: 'bg-blue-100 text-blue-800' },
  };

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            My Profile
          </h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <Card className="shadow-soft">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-display text-xl font-semibold">{fullName || 'User'}</h2>
                <p className="text-muted-foreground">{user?.email}</p>

                {role && (
                  <Badge className={`mt-2 ${roleColors[role]}`}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* ================= OWNER SECTION ================= */}
            {role === 'owner' && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-semibold">Your Property Stats</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.keys(statusConfig).map((status) => {
                    const count = properties?.filter((p) => p.status === status).length || 0;
                    const cfg = statusConfig[status];
                    const Icon = cfg.icon;
                    return (
                      <Card key={status} className="shadow-soft">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${cfg.className}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xl font-bold">{count}</p>
                              <p className="text-xs text-muted-foreground">{cfg.label}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Button asChild className="btn-gradient w-full mt-2">
                  <Link to="/owner-dashboard">
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Properties
                  </Link>
                </Button>
              </div>
            )}

            {/* ================= USER FIELDS ================= */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input id="email" value={user?.email || ''} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full btn-gradient" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
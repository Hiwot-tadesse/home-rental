import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Home, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(
    searchParams.get('mode') === 'signup'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('renter');
  const [formLoading, setFormLoading] = useState(false);

  const { role, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  /* ---------------- REDIRECT AFTER AUTH ---------------- */
  useEffect(() => {
    if (loading) return;        // wait until auth restore completes
    if (!role) return;          // no role → not logged in

    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'owner') {
      navigate('/owner/dashboard');
    } else {
      navigate('/browse');
    }
  }, [role, loading, navigate]);

  /* ---------------- HANDLE SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(
          email,
          password,
          fullName,
          selectedRole
        );

        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Account created successfully');
          // redirect handled by useEffect
        }
      } else {
        const { error } = await signIn(email, password);

        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Signed in successfully');
          // redirect handled by useEffect
        }
      }
    } catch {
      toast.error('Unexpected error. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <Home className="h-7 w-7 text-primary-foreground" />
          </div>

          <CardTitle className="font-display text-2xl">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>

          <CardDescription>
            {isSignUp
              ? 'Join myHome today'
              : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name (Sign Up only) */}
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* Role Selection (Sign Up only) */}
            {isSignUp && (
              <div className="space-y-3">
                <Label>I am a...</Label>

                <RadioGroup
                  value={selectedRole}
                  onValueChange={(v) =>
                    setSelectedRole(v as AppRole)
                  }
                  className="grid grid-cols-2 gap-3"
                >
                  <Label
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRole === 'renter'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem
                      value="renter"
                      className="sr-only"
                    />
                    <span className="font-medium">Renter</span>
                    <span className="text-xs text-muted-foreground">
                      Looking to rent
                    </span>
                  </Label>

                  <Label
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRole === 'owner'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem
                      value="owner"
                      className="sr-only"
                    />
                    <span className="font-medium">Owner</span>
                    <span className="text-xs text-muted-foreground">
                      List my properties
                    </span>
                  </Label>
                </RadioGroup>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full btn-gradient"
              disabled={formLoading}
            >
              {formLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            {isSignUp
              ? 'Already have an account?'
              : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline font-medium"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
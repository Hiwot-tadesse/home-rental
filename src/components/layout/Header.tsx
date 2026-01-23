import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Heart, User, LogOut, Plus, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const NavLinks = () => {
    if (!user) {
      return (
        <>
          <Link to="/" className="text-foreground/80 hover:text-primary transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/browse" className="text-foreground/80 hover:text-primary transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>
            Browse
          </Link>
        </>
      );
    }

    if (role === 'renter') {
      return (
        <>
          <Link to="/" className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link to="/favorites" className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <Heart className="h-4 w-4" />
            <span>Favorites</span>
          </Link>
          <Link to="/profile" className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </>
      );
    }

    if (role === 'owner') {
      return (
        <>
          <Link to="/owner/dashboard" className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <Plus className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link to="/profile" className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </>
      );
    }

    if (role === 'admin') {
      return (
        <>
          <Link to="/admin/dashboard" className="text-foreground/80 hover:text-primary transition-colors font-medium flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <Shield className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </>
      );
    }

    return null;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">myHome</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLinks />
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Button variant="ghost" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild className="btn-gradient">
                <Link to="/auth?mode=signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-4">
            <NavLinks />
            <div className="border-t border-border pt-4 flex flex-col gap-2">
              {user ? (
                <Button variant="ghost" onClick={handleSignOut} className="justify-start gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild className="btn-gradient justify-start">
                    <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

import { Header } from './Header';
import Footer from '@/components/layout/Footer'; // ✅ Import the new footer

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer /> {/* ✅ Replace old footer with new component */}
    </div>
  );
}
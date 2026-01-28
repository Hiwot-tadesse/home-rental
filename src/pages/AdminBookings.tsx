import { Layout } from '@/components/layout/Layout';

export default function AdminBookings() {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-2xl font-bold">Admin — Bookings</h1>
        <p className="text-muted-foreground">Manage booking requests and history.</p>
      </div>
    </Layout>
  );
}

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Check authentication and admin role
  if (!user) {
    redirect('/signin');
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

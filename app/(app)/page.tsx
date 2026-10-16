import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { DashboardClient } from './_components/dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return <DashboardClient user={{ name: session.user.name ?? 'Usuário', email: session.user.email ?? '', id: session.user.id }} />;
}

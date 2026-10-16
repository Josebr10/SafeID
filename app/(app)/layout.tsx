import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShellClient } from './_components/app-shell-client';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return <AppShellClient>{children}</AppShellClient>;
}

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { LoginClient } from './_components/login-client';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect('/');
  return <LoginClient />;
}

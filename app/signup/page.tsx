import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { SignupClient } from './_components/signup-client';

export const dynamic = 'force-dynamic';

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect('/');
  return <SignupClient />;
}

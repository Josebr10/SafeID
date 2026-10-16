export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import ViewProfileClient from './_components/view-profile-client';

export default async function ViewProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  });

  if (!user) notFound();

  return <ViewProfileClient userId={userId} userName={user.name ?? 'Usuário'} />;
}

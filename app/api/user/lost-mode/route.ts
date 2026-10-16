export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lostMode: true, lockScreenMessage: true },
    });
    return NextResponse.json({
      lostMode: user?.lostMode ?? false,
      lockScreenMessage: user?.lockScreenMessage ?? '',
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const body = await req.json();
    const data: any = {};
    if (typeof body?.lostMode === 'boolean') data.lostMode = body.lostMode;
    if (typeof body?.lockScreenMessage === 'string') data.lockScreenMessage = body.lockScreenMessage;
    const user = await prisma.user.update({ where: { id: session.user.id }, data });
    return NextResponse.json({
      lostMode: user.lostMode,
      lockScreenMessage: user.lockScreenMessage ?? '',
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

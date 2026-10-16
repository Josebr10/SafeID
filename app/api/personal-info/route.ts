export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const items = await prisma.personalInfo.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (err: any) {
    console.error('GET personal-info error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const body = await req.json();
    const { label, value, accessLevel, category, enabled } = body ?? {};
    if (!label || !value) {
      return NextResponse.json({ error: 'Label e valor são obrigatórios' }, { status: 400 });
    }
    const item = await prisma.personalInfo.create({
      data: {
        label,
        value,
        accessLevel: accessLevel ?? 'public',
        category: category ?? null,
        enabled: enabled !== false,
        userId: session.user.id,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    console.error('POST personal-info error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

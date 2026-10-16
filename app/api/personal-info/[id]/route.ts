export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const { id } = await params;
    const existing = await prisma.personalInfo.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    const body = await req.json();
    const updated = await prisma.personalInfo.update({
      where: { id },
      data: {
        label: body?.label ?? existing.label,
        value: body?.value ?? existing.value,
        accessLevel: body?.accessLevel ?? existing.accessLevel,
        category: body?.category !== undefined ? body.category : existing.category,
        enabled: body?.enabled !== undefined ? body.enabled : existing.enabled,
      },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('PUT personal-info error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    const { id } = await params;
    const existing = await prisma.personalInfo.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    await prisma.personalInfo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE personal-info error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

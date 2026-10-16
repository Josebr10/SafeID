export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const level = req.nextUrl.searchParams.get('level') || 'public';

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, lostMode: true, lockScreenMessage: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    // Determine which access levels to include
    const allowedLevels: string[] = ['public'];
    if (level === 'emergency' || level === 'professional') {
      allowedLevels.push('emergency');
    }
    if (level === 'professional') {
      allowedLevels.push('professional');
    }
    // 'restricted' is NEVER included in public view

    const infos = await prisma.personalInfo.findMany({
      where: {
        userId: user.id,
        enabled: true,
        accessLevel: { in: allowedLevels },
      },
      select: {
        label: true,
        value: true,
        accessLevel: true,
        category: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Log this access
    await prisma.accessLog.create({
      data: {
        action: `Acesso ${level === 'public' ? 'público' : level === 'emergency' ? 'emergencial' : 'profissional'}`,
        category: 'access',
        description: `QR Code escaneado — informações de nível ${level} visualizadas`,
        userId: user.id,
      },
    });

    return NextResponse.json({
      name: user.name,
      lostMode: user.lostMode,
      lockScreenMessage: user.lockScreenMessage ?? '',
      level,
      infos,
    });
  } catch (err) {
    console.error('Public profile error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hidden test account
  const testEmail = 'abacus-aaa694c0@example.com';
  const testPassword = await bcrypt.hash('Ssg0P7nl*E', 12);
  const testUser = await prisma.user.upsert({
    where: { email: testEmail },
    update: {},
    create: {
      email: testEmail,
      name: 'Test Admin',
      password: testPassword,
      role: 'admin',
    },
  });

  // Admin account for the user
  const adminEmail = 'admin@safeid.com';
  const adminPassword = await bcrypt.hash('Admin@2024!', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'admin' },
    create: {
      email: adminEmail,
      name: 'Administrador SafeID',
      password: adminPassword,
      role: 'admin',
    },
  });

  // Seed PersonalInfo for admin user
  const adminInfoData = [
    { label: 'Nome completo', value: 'Administrador SafeID', accessLevel: 'public', category: 'Contato', enabled: true },
    { label: 'Email corporativo', value: 'admin@safeid.com', accessLevel: 'public', category: 'Contato', enabled: true },
    { label: 'Tipo sanguíneo', value: 'A+', accessLevel: 'emergency', category: 'Médico', enabled: true },
    { label: 'Alergias', value: 'Nenhuma conhecida', accessLevel: 'emergency', category: 'Médico', enabled: true },
  ];

  for (const info of adminInfoData) {
    await prisma.personalInfo.upsert({
      where: { id: `admin-${info.label.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `admin-${info.label.toLowerCase().replace(/\s+/g, '-')}`,
        label: info.label,
        value: info.value,
        accessLevel: info.accessLevel,
        category: info.category,
        enabled: info.enabled,
        userId: adminUser.id,
      },
    });
  }

  // Seed PersonalInfo for test user
  const infoData = [
    { label: 'Nome completo', value: 'João Silva Santos', accessLevel: 'public', category: 'Contato', enabled: true },
    { label: 'Telefone', value: '+55 11 99999-0000', accessLevel: 'public', category: 'Contato', enabled: true },
    { label: 'Email', value: 'joao.silva@email.com', accessLevel: 'public', category: 'Contato', enabled: true },
    { label: 'Tipo sanguíneo', value: 'O+', accessLevel: 'emergency', category: 'Médico', enabled: true },
    { label: 'Alergias', value: 'Penicilina, Dipirona', accessLevel: 'emergency', category: 'Médico', enabled: true },
    { label: 'Medicações', value: 'Losartana 50mg', accessLevel: 'emergency', category: 'Médico', enabled: true },
    { label: 'Plano de saúde', value: 'Unimed Gold', accessLevel: 'professional', category: 'Médico', enabled: true },
    { label: 'Médico responsável', value: 'Dra. Ana Santos — CRM 12345', accessLevel: 'professional', category: 'Médico', enabled: true },
    { label: 'CPF', value: '123.456.789-00', accessLevel: 'restricted', category: 'Documento', enabled: false },
    { label: 'RG', value: '12.345.678-9', accessLevel: 'restricted', category: 'Documento', enabled: false },
    { label: 'Endereço', value: 'Rua Exemplo, 123 — São Paulo/SP', accessLevel: 'restricted', category: 'Contato', enabled: false },
  ];

  for (const info of infoData) {
    await prisma.personalInfo.upsert({
      where: { id: `seed-${info.label.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `seed-${info.label.toLowerCase().replace(/\s+/g, '-')}`,
        label: info.label,
        value: info.value,
        accessLevel: info.accessLevel,
        category: info.category,
        enabled: info.enabled,
        userId: testUser.id,
      },
    });
  }

  // Seed some audit logs
  const auditData = [
    { action: 'Acesso público', category: 'access', description: 'QR Code escaneado — informações públicas exibidas' },
    { action: 'Novo dispositivo', category: 'device', description: 'iPhone 15 Pro adicionado como dispositivo confiável' },
    { action: 'Verificação de segurança', category: 'security', description: 'Autenticação biométrica verificada com sucesso' },
    { action: 'Acesso emergencial', category: 'access', description: 'Acesso médico solicitado e concedido', institution: 'Hospital São Paulo' },
    { action: 'Tokens renovados', category: 'security', description: 'Tokens de acesso renovados automaticamente' },
  ];

  for (const log of auditData) {
    const existingLog = await prisma.accessLog.findFirst({
      where: { userId: testUser.id, action: log.action },
    });
    if (!existingLog) {
      await prisma.accessLog.create({
        data: {
          action: log.action,
          category: log.category,
          description: log.description,
          institution: (log as any).institution ?? null,
          userId: testUser.id,
        },
      });
    }
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

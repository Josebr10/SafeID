'use client';

import { PageWrapper } from '@/components/page-wrapper';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Shield, Lock, Fingerprint, Key, ClipboardList, Ban, CheckCircle, ShieldCheck } from 'lucide-react';

const statusItems = [
  { label: 'Criptografia AES-256', status: 'Ativo' },
  { label: 'Autenticação multi-fator', status: 'Ativo' },
  { label: 'Tokens temporários (JWT)', status: 'Ativo' },
  { label: 'Monitoramento contínuo', status: 'Ativo' },
  { label: 'Backup criptografado', status: 'Ativo' },
];

const features = [
  { icon: Lock, title: 'Criptografia', desc: 'Dados criptografados em repouso e em trânsito com AES-256' },
  { icon: Shield, title: 'Controle de Acesso', desc: '4 níveis de acesso com verificação progressiva' },
  { icon: Fingerprint, title: 'Autenticação', desc: 'Biometria, 2FA e autenticação institucional' },
  { icon: Key, title: 'Tokens Temporários', desc: 'Sessões com expiração automática e renovação segura' },
  { icon: ClipboardList, title: 'Logs de Auditoria', desc: 'Registro completo de todo acesso e alteração' },
  { icon: Ban, title: 'Revogação', desc: 'Capacidade de revogar acesso a qualquer momento' },
];

export default function SecurityCenterPage() {
  return (
    <PageWrapper className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Central de Segurança</h1>
        <p className="text-sm text-muted-foreground">Visão geral da segurança e proteção da sua identidade digital</p>
      </div>

      {/* Status grid */}
      <Card className="glass">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium flex items-center gap-2 mb-4">
            <ShieldCheck className="h-4 w-4 text-safe" /> Status do Sistema
          </h3>
          <div className="space-y-3">
            {statusItems?.map((item: any, i: number) => (
              <motion.div
                key={item?.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-safe animate-pulse-dot" />
                  <span className="text-sm">{item?.label}</span>
                </div>
                <StatusBadge status="safe">{item?.status}</StatusBadge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features?.map((f: any, i: number) => (
          <motion.div
            key={f?.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.04, duration: 0.25 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="glass h-full hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
              <CardContent className="p-5">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="text-sm font-medium mb-1">{f?.title}</h4>
                <p className="text-xs text-muted-foreground">{f?.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8"
      >
        <p className="text-lg font-display font-medium text-muted-foreground italic">
          “Sua identidade. <span className="text-primary">Protegida</span>. Disponível quando é realmente necessário.”
        </p>
      </motion.div>
    </PageWrapper>
  );
}

'use client';

import { motion } from 'framer-motion';
import { PageWrapper } from '@/components/page-wrapper';
import { QrCode } from '@/components/qr-code';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  Shield, QrCode as QrIcon, AlertTriangle, FileText, Eye,
  Clock, Smartphone, BarChart3, Fingerprint, Watch, CheckCircle,
  Users, Lock, HeartPulse
} from 'lucide-react';

const stagger = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.04, duration: 0.25 } });

const actionCards = [
  { href: '/qr-code', icon: QrIcon, label: 'Visualizar QR', desc: 'Ver e compartilhar', color: 'text-primary' },
  { href: '/lost-mode', icon: AlertTriangle, label: 'Modo Perdido', desc: 'Ativar proteção', color: 'text-warning' },
  { href: '/my-info', icon: FileText, label: 'Editar informações', desc: 'Gerenciar dados', color: 'text-safe' },
  { href: '/privacy', icon: Eye, label: 'Privacidade', desc: 'Controlar acesso', color: 'text-alert' },
];

const securityItems = [
  { label: 'Criptografia ativa', status: 'safe' as const },
  { label: 'Autenticação em 2 fatores', status: 'safe' as const },
  { label: 'Tokens temporários', status: 'safe' as const },
  { label: 'Monitoramento ativo', status: 'safe' as const },
];

const devices = [
  { name: 'iPhone 15 Pro', icon: Smartphone, status: 'Principal' },
  { name: 'Apple Watch', icon: Watch, status: 'Conectado' },
  { name: 'Biometria', icon: Fingerprint, status: 'Ativo' },
];

const accessLevels = [
  { level: 'Público', desc: 'Nome e contato básico', color: 'text-safe', bg: 'bg-safe/10', icon: Users },
  { level: 'Emergencial', desc: 'Informações médicas', color: 'text-warning', bg: 'bg-warning/10', icon: HeartPulse },
  { level: 'Restrito', desc: 'Documentos e CPF', color: 'text-alert', bg: 'bg-alert/10', icon: Lock },
];

export function DashboardClient({ user }: { user: { name: string; email: string; id?: string } }) {
  const profileUrl = typeof window !== 'undefined' && user?.id ? `${window.location.origin}/view/${user.id}` : '';
  return (
    <PageWrapper className="space-y-6">
      {/* Profile card */}
      <motion.div {...stagger(0)}>
        <Card className="glass overflow-hidden hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold font-display shrink-0">
                {user?.name?.charAt?.(0)?.toUpperCase?.() ?? 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-display font-bold tracking-tight">{user?.name}</h2>
                <p className="text-sm text-muted-foreground" suppressHydrationWarning>{user?.email}</p>
                <StatusBadge status="safe" pulse className="mt-2">Identidade verificada</StatusBadge>
              </div>
              <div className="shrink-0 hidden sm:block">
                <QrCode size={100} className="rounded-lg" url={profileUrl} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Clock, label: 'Último acesso', value: 'Agora' },
          { icon: Smartphone, label: 'Dispositivos ativos', value: '3' },
          { icon: BarChart3, label: 'Acessos (30d)', value: '24' },
        ].map((s: any, i: number) => (
          <motion.div key={s?.label} {...stagger(i + 1)}>
            <Card className="glass hover:border-primary/20 transition-all duration-200 hover:shadow-md hover:shadow-primary/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s?.label}</p>
                  <p className="text-lg font-bold font-display">{s?.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actionCards?.map((c: any, i: number) => (
          <motion.div key={c?.href} {...stagger(i + 4)}>
            <Link href={c?.href}>
              <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} whileTap={{ scale: 0.97 }}>
                <Card className="glass hover:border-primary/30 transition-all duration-200 cursor-pointer h-full hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${c?.color} group-hover:scale-110 transition-transform duration-200`}>
                      <c.icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">{c?.label}</p>
                    <p className="text-[10px] text-muted-foreground">{c?.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Security + Devices grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div {...stagger(8)}>
          <Card className="glass h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-safe" /> Status de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {securityItems?.map((item: any) => (
                <div key={item?.label} className="flex items-center justify-between">
                  <span className="text-sm">{item?.label}</span>
                  <StatusBadge status={item?.status}>Ativo</StatusBadge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...stagger(9)}>
          <Card className="glass h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" /> Dispositivos vinculados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {devices?.map((d: any) => (
                <div key={d?.name} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <d.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{d?.name}</p>
                  </div>
                  <StatusBadge status="safe">{d?.status}</StatusBadge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Access levels */}
      <motion.div {...stagger(10)}>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Meu acesso emergencial</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {accessLevels?.map((a: any, i: number) => (
            <motion.div key={a?.level} {...stagger(11 + i)}>
              <Card className="glass">
                <CardContent className="p-4">
                  <div className={`h-10 w-10 rounded-lg ${a?.bg} flex items-center justify-center mb-3`}>
                    <a.icon className={`h-5 w-5 ${a?.color}`} />
                  </div>
                  <p className="text-sm font-medium">{a?.level}</p>
                  <p className="text-xs text-muted-foreground mt-1">{a?.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </PageWrapper>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FileText, QrCode, Smartphone, AlertTriangle,
  HeartPulse, Shield, Eye, ClipboardList, Lock, Menu, X,
  LogOut, ChevronRight, Building2, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navGroups = [
  {
    label: 'Principal',
    items: [
      { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/my-info', icon: FileText, label: 'Minhas Informações' },
      { href: '/qr-code', icon: QrCode, label: 'Meu QR Code' },
    ],
  },
  {
    label: 'Acesso',
    items: [
      { href: '/locked', icon: Smartphone, label: 'Tela Bloqueada' },
      { href: '/lost-mode', icon: AlertTriangle, label: 'Modo Perdido' },
      { href: '/emergency', icon: HeartPulse, label: 'Acesso Emergencial' },
      { href: '/health', icon: HeartPulse, label: 'Portal de Saúde' },
      { href: '/authority', icon: Building2, label: 'Portal de Autoridades' },
    ],
  },
  {
    label: 'Controle',
    items: [
      { href: '/privacy', icon: Eye, label: 'Privacidade' },
      { href: '/audit', icon: ClipboardList, label: 'Auditoria' },
      { href: '/security', icon: ShieldCheck, label: 'Segurança' },
    ],
  },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name ?? 'Usuário';
  const userEmail = session?.user?.email ?? '';

  const nav = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight">SafeID</h1>
          <p className="text-[10px] text-muted-foreground">Identidade Digital</p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-6">
        {navGroups?.map((group: any) => (
          <div key={group?.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
              {group?.label}
            </p>
            <div className="space-y-1">
              {group?.items?.map((item: any) => {
                const Icon = item?.icon;
                const isActive = pathname === item?.href;
                return (
                  <Link
                    key={item?.href}
                    href={item?.href}
                    prefetch={true}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:translate-x-1'
                    )}
                  >
                    {Icon && <Icon className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isActive && 'scale-110')} />}
                    <span>{item?.label}</span>
                    {isActive && <ChevronRight className="h-3 w-3 ml-auto animate-pulse" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {userName?.charAt?.(0)?.toUpperCase?.() ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-alert"
          onClick={() => signOut({ redirectTo: '/login' })}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg glass"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border/50 transition-transform duration-300',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {nav}
      </aside>
    </>
  );
}

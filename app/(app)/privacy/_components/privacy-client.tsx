'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { Users, Shield, Stethoscope, Lock, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface InfoItem {
  id: string;
  label: string;
  value: string;
  accessLevel: string;
  category: string | null;
  enabled: boolean;
}

const levelConfig: Record<string, { icon: any; color: string; bg: string; label: string; desc: string }> = {
  public: { icon: Users, color: 'text-safe', bg: 'bg-safe/10', label: 'Público', desc: 'Visível para qualquer pessoa que escanear seu QR Code' },
  emergency: { icon: Shield, color: 'text-warning', bg: 'bg-warning/10', label: 'Emergencial', desc: 'Acessível mediante verificação de motivo' },
  professional: { icon: Stethoscope, color: 'text-primary', bg: 'bg-primary/10', label: 'Profissional', desc: 'Requer verificação de credenciais profissionais' },
  restricted: { icon: Lock, color: 'text-alert', bg: 'bg-alert/10', label: 'Restrito', desc: 'Nunca exibido automaticamente — requer autorização institucional' },
};

export function PrivacyClient() {
  const [items, setItems] = useState<InfoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/personal-info');
      if (res.ok) { setItems(await res.json() ?? []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const toggleItem = async (item: InfoItem) => {
    if (item.accessLevel === 'restricted') return;
    const newEnabled = !item.enabled;
    setItems(prev => prev?.map((i: InfoItem) => i.id === item.id ? { ...i, enabled: newEnabled } : i) ?? []);
    try {
      await fetch(`/api/personal-info/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newEnabled }),
      });
    } catch {
      setItems(prev => prev?.map((i: InfoItem) => i.id === item.id ? { ...i, enabled: !newEnabled } : i) ?? []);
      toast.error('Erro ao atualizar');
    }
  };

  const grouped = ['public', 'emergency', 'professional', 'restricted'].map((level: string) => ({
    level,
    config: levelConfig[level],
    items: (items ?? []).filter((i: InfoItem) => i.accessLevel === level),
  }));

  if (loading) {
    return <PageWrapper className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></PageWrapper>;
  }

  return (
    <PageWrapper className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Controle de Privacidade</h1>
          <p className="text-sm text-muted-foreground">Gerencie quais informações estão visíveis em cada nível de acesso</p>
        </div>
        <Link href="/my-info" className="text-xs text-primary hover:underline flex items-center gap-1">
          Gerenciar informações <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-4">
        {grouped?.map((g: any, gi: number) => {
          const cfg = g?.config;
          const Icon = cfg?.icon;
          return (
            <motion.div
              key={g?.level}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.06, duration: 0.25 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <Card className="glass hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-10 w-10 rounded-lg ${cfg?.bg} flex items-center justify-center`}>
                      {Icon && <Icon className={`h-5 w-5 ${cfg?.color}`} />}
                    </div>
                    <div>
                      <p className={`font-medium ${cfg?.color}`}>{cfg?.label}</p>
                      <p className="text-xs text-muted-foreground">{cfg?.desc}</p>
                    </div>
                  </div>
                  {g?.items?.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">Nenhuma informação neste nível</p>
                  ) : (
                    <div className="space-y-2">
                      {g?.items?.map((item: InfoItem) => (
                        <div key={item?.id} className="flex items-center justify-between py-2 border-t border-border/30">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{item?.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{item?.value}</p>
                          </div>
                          <Switch
                            checked={item?.enabled}
                            onCheckedChange={() => toggleItem(item)}
                            disabled={item?.accessLevel === 'restricted'}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </PageWrapper>
  );
}

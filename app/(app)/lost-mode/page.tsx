'use client';

import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/page-wrapper';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle, Lock, Shield, Eye, Clock, Bell, MapPin, Ban } from 'lucide-react';
import { toast } from 'sonner';

const securityMeasures = [
  { icon: Lock, label: 'Acesso restrito ativado', desc: 'Apenas informações públicas são visíveis' },
  { icon: Shield, label: 'Dados sensíveis protegidos', desc: 'CPF, documentos e endereço bloqueados' },
  { icon: Eye, label: 'Monitoramento intensificado', desc: 'Todo acesso é registrado com detalhes' },
  { icon: Bell, label: 'Notificações ativas', desc: 'Alertas a cada tentativa de acesso' },
  { icon: MapPin, label: 'Localização registrada', desc: 'Posição do último acesso salva' },
  { icon: Ban, label: 'Tokens revogados', desc: 'Sessões anteriores invalidadas' },
];

export default function LostModePage() {
  const [active, setActive] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetch('/api/user/lost-mode').then(r => r.json()).then(d => setActive(!!d?.lostMode)).catch(() => {});
  }, []);

  const toggle = async () => {
    setToggling(true);
    try {
      const res = await fetch('/api/user/lost-mode', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lostMode: !active }),
      });
      if (res.ok) {
        setActive(!active);
        toast.success(!active ? 'Modo perdido ativado' : 'Modo perdido desativado');
      }
    } catch { toast.error('Erro ao atualizar'); }
    finally { setToggling(false); }
  };

  return (
    <PageWrapper className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Modo Perdido</h1>
        <p className="text-sm text-muted-foreground">Ative quando seu dispositivo ou documento for perdido ou roubado</p>
      </div>

      <Card className="glass">
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <motion.div animate={{ scale: active ? [1, 1.05, 1] : 1 }} transition={{ repeat: active ? Infinity : 0, duration: 2 }}>
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${active ? 'bg-alert/10' : 'bg-muted'}`}>
              <AlertTriangle className={`h-8 w-8 ${active ? 'text-alert' : 'text-muted-foreground'}`} />
            </div>
          </motion.div>
          <StatusBadge status={active ? 'alert' : 'neutral'} pulse={active}>
            {active ? 'Modo Perdido Ativo' : 'Modo Perdido Inativo'}
          </StatusBadge>
          <Button
            onClick={toggle}
            disabled={toggling}
            variant={active ? 'outline' : 'destructive'}
            className="min-w-[200px]"
          >
            {toggling ? 'Processando...' : active ? 'Desativar Modo Perdido' : 'Ativar Modo Perdido'}
          </Button>
        </CardContent>
      </Card>

      <h3 className="text-sm font-medium text-muted-foreground">Medidas de segurança aplicadas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityMeasures?.map((m: any, i: number) => (
          <motion.div key={m?.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass">
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-alert/10' : 'bg-muted'}`}>
                  <m.icon className={`h-4 w-4 ${active ? 'text-alert' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{m?.label}</p>
                  <p className="text-xs text-muted-foreground">{m?.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
}

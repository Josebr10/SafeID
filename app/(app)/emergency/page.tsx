'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, Shield, AlertTriangle, Package, Info, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const reasons = [
  { id: 'medical', icon: HeartPulse, label: 'Emergência Médica', desc: 'Acesso a informações médicas essenciais', color: 'text-alert', bg: 'bg-alert/10' },
  { id: 'police', icon: Shield, label: 'Ocorrência Policial', desc: 'Verificação de identidade por autoridades', color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'emergency', icon: AlertTriangle, label: 'Emergência Geral', desc: 'Situação emergencial não médica', color: 'text-warning', bg: 'bg-warning/10' },
  { id: 'return', icon: Package, label: 'Devolução', desc: 'Encontrei este dispositivo/documento', color: 'text-safe', bg: 'bg-safe/10' },
];

export default function EmergencyAccessPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!selected) { toast.error('Selecione um motivo'); return; }
    setConfirmed(true);
    toast.success('Acesso registrado na auditoria');
  };

  return (
    <PageWrapper className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Acesso Emergencial</h1>
        <p className="text-sm text-muted-foreground">Selecione o motivo do acesso às informações</p>
      </div>

      {confirmed ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="glass">
            <CardContent className="p-8 flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-safe/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-safe" />
              </div>
              <h2 className="font-display font-bold text-lg">Acesso Registrado</h2>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                As informações do nível correspondente estão disponíveis. Toda atividade foi registrada na auditoria.
              </p>
              <Button variant="outline" onClick={() => { setConfirmed(false); setSelected(null); }}>
                Novo acesso
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasons?.map((r: any, i: number) => (
              <motion.div key={r?.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card
                  className={`glass cursor-pointer transition-all ${selected === r?.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelected(r?.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl ${r?.bg} flex items-center justify-center shrink-0`}>
                        <r.icon className={`h-6 w-6 ${r?.color}`} />
                      </div>
                      <div>
                        <p className="font-medium">{r?.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{r?.desc}</p>
                      </div>
                    </div>
                    <AnimatePresence>
                      {selected === r?.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground">Acesso será registrado com timestamp, localização e motivo selecionado.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/10">
            <Info className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">Toda atividade de acesso é registrada e auditada. Acessos indevidos podem resultar em sanções legais.</p>
          </div>

          <Button onClick={handleConfirm} disabled={!selected} className="w-full sm:w-auto">
            Confirmar acesso emergencial
          </Button>
        </>
      )}
    </PageWrapper>
  );
}

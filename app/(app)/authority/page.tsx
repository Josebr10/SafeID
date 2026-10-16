'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/page-wrapper';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Shield, CheckCircle, User, FileText, CreditCard, MapPin, Lock, Info, Search } from 'lucide-react';
import { toast } from 'sonner';

const mockReasons = [
  { id: 'investigation', label: 'Investigação', desc: 'Inquérito policial em andamento' },
  { id: 'identification', label: 'Identificação', desc: 'Confirmação de identidade' },
  { id: 'judicial', label: 'Ordem Judicial', desc: 'Determinação do poder judiciário' },
];

const personalData = [
  { icon: User, label: 'Nome completo', value: 'João Silva Santos', visible: true },
  { icon: CreditCard, label: 'CPF', value: '***.***.***-00', visible: false },
  { icon: FileText, label: 'RG', value: '**.***.***-*', visible: false },
  { icon: MapPin, label: 'Endereço', value: 'Acesso restrito', visible: false },
];

export default function AuthorityPortalPage() {
  const [step, setStep] = useState<'auth' | 'reason' | 'data'>('auth');
  const [credential, setCredential] = useState('');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential?.trim()) { toast.error('Informe a credencial'); return; }
    setLoading(true);
    setTimeout(() => { setStep('reason'); setLoading(false); }, 1000);
  };

  const handleReasonConfirm = () => {
    if (!selectedReason) { toast.error('Selecione um motivo'); return; }
    setStep('data');
    toast.success('Acesso registrado na auditoria');
  };

  return (
    <PageWrapper className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Portal de Autoridades</h1>
        <p className="text-sm text-muted-foreground">Acesso institucional a dados pessoais mediante verificação</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Card className="glass max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" /> Autenticação Institucional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Credencial Institucional</Label>
                    <Input placeholder="Número de matrícula ou badge" value={credential} onChange={(e: any) => setCredential(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Instituição</Label>
                    <Input placeholder="Ex: Polícia Civil - SP" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Verificando...' : 'Autenticar'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'reason' && (
          <motion.div key="reason" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-safe/5 border border-safe/10">
              <CheckCircle className="h-5 w-5 text-safe" />
              <p className="text-sm font-medium text-safe">Credencial verificada</p>
            </div>
            <h3 className="text-sm font-medium">Selecione o motivo do acesso</h3>
            <div className="grid grid-cols-1 gap-3">
              {mockReasons?.map((r: any) => (
                <Card
                  key={r?.id}
                  className={`glass cursor-pointer transition-all ${selectedReason === r?.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedReason(r?.id)}
                >
                  <CardContent className="p-4">
                    <p className="font-medium text-sm">{r?.label}</p>
                    <p className="text-xs text-muted-foreground">{r?.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button onClick={handleReasonConfirm} disabled={!selectedReason}>Confirmar e acessar</Button>
          </motion.div>
        )}

        {step === 'data' && (
          <motion.div key="data" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <Shield className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Acesso concedido com registro de auditoria</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalData?.map((d: any, i: number) => (
                <motion.div key={d?.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="glass">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${d?.visible ? 'bg-primary/10' : 'bg-alert/10'}`}>
                        {d?.visible ? <d.icon className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-alert" />}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{d?.label}</p>
                        <p className="text-sm font-medium">{d?.value}</p>
                      </div>
                      {!d?.visible && <StatusBadge status="alert">Restrito</StatusBadge>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/10">
              <Info className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">Campos restritos requerem ordem judicial para liberação completa. Todo acesso é registrado.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}

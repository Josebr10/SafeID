'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/page-wrapper';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { HeartPulse, Shield, CheckCircle, User, Droplets, AlertTriangle, Pill, Stethoscope, Info } from 'lucide-react';
import { toast } from 'sonner';

const mockMedicalData = [
  { icon: User, label: 'Paciente', value: 'João Silva', level: 'emergency' },
  { icon: Droplets, label: 'Tipo sanguíneo', value: 'O+', level: 'emergency' },
  { icon: AlertTriangle, label: 'Alergias', value: 'Penicilina, Dipirona', level: 'emergency' },
  { icon: Pill, label: 'Medicações', value: 'Losartana 50mg', level: 'emergency' },
  { icon: HeartPulse, label: 'Condições', value: 'Hipertensão controlada', level: 'professional' },
  { icon: Stethoscope, label: 'Médico responsável', value: 'Dra. Ana Santos — CRM 12345', level: 'professional' },
];

export default function HealthPortalPage() {
  const [verified, setVerified] = useState(false);
  const [crm, setCrm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crm?.trim()) { toast.error('Informe o registro profissional'); return; }
    setLoading(true);
    setTimeout(() => {
      setVerified(true);
      setLoading(false);
      toast.success('Identidade verificada. Acesso registrado na auditoria.');
    }, 1500);
  };

  return (
    <PageWrapper className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Portal de Saúde</h1>
        <p className="text-sm text-muted-foreground">Acesso às informações médicas de emergência do paciente</p>
      </div>

      {!verified ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Verificação de Identidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label>Registro Profissional (CRM/COREN)</Label>
                  <Input placeholder="Ex: CRM 12345" value={crm} onChange={(e: any) => setCrm(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Instituição</Label>
                  <Input placeholder="Ex: Hospital São Paulo" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Verificando...' : 'Verificar identidade'}
                </Button>
              </form>
              <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-warning/5 border border-warning/10">
                <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">Este acesso será registrado na auditoria com sua identificação.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-safe/5 border border-safe/10">
            <CheckCircle className="h-5 w-5 text-safe" />
            <div>
              <p className="text-sm font-medium text-safe">Identidade verificada</p>
              <p className="text-xs text-muted-foreground">Acesso concedido — registrado na auditoria</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockMedicalData?.map((d: any, i: number) => (
              <motion.div key={d?.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${d?.level === 'emergency' ? 'bg-warning/10' : 'bg-primary/10'}`}>
                      <d.icon className={`h-4 w-4 ${d?.level === 'emergency' ? 'text-warning' : 'text-primary'}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{d?.label}</p>
                      <p className="text-sm font-medium">{d?.value}</p>
                      <StatusBadge status={d?.level === 'emergency' ? 'warning' : 'info'} className="mt-1">
                        {d?.level === 'emergency' ? 'Emergencial' : 'Profissional'}
                      </StatusBadge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </PageWrapper>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/page-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Search, Shield, Smartphone, Eye, Clock, Loader2, Inbox } from 'lucide-react';
import { SafeDate } from '@/components/safe-format';

interface LogEntry {
  id: string;
  action: string;
  category: string;
  description: string;
  institution: string | null;
  createdAt: string;
}

const categoryIcons: Record<string, any> = {
  access: Eye,
  device: Smartphone,
  security: Shield,
};

const categoryColors: Record<string, string> = {
  access: 'text-primary bg-primary/10',
  device: 'text-warning bg-warning/10',
  security: 'text-safe bg-safe/10',
};

// Demo data for when DB is empty
const demoLogs: LogEntry[] = [
  { id: '1', action: 'Acesso público', category: 'access', description: 'QR Code escaneado — informações públicas exibidas', institution: null, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', action: 'Novo dispositivo', category: 'device', description: 'iPhone 15 Pro adicionado como dispositivo confiável', institution: null, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', action: 'Verificação de segurança', category: 'security', description: 'Autenticação biométrica verificada com sucesso', institution: null, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', action: 'Acesso emergencial', category: 'access', description: 'Acesso médico solicitado e concedido', institution: 'Hospital São Paulo', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '5', action: 'Tokens renovados', category: 'security', description: 'Tokens de acesso renovados automaticamente', institution: null, createdAt: new Date(Date.now() - 259200000).toISOString() },
];

export default function AuditPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetch('/api/audit')
      .then(r => r.json())
      .then(d => setLogs((d ?? [])?.length > 0 ? d : demoLogs))
      .catch(() => setLogs(demoLogs))
      .finally(() => setLoading(false));
  }, []);

  const filtered = (logs ?? []).filter((log: LogEntry) => {
    const matchSearch = !search || log.description?.toLowerCase()?.includes(search?.toLowerCase()) || log.institution?.toLowerCase()?.includes(search?.toLowerCase()) || log.action?.toLowerCase()?.includes(search?.toLowerCase());
    const matchCat = filterCategory === 'all' || log.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <PageWrapper className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Auditoria</h1>
        <p className="text-sm text-muted-foreground">Histórico completo de acessos e eventos de segurança</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por descrição, instituição..." value={search} onChange={(e: any) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="access">Acesso</SelectItem>
            <SelectItem value="device">Dispositivo</SelectItem>
            <SelectItem value="security">Segurança</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Inbox className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Nenhum evento encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered?.map((log: LogEntry, i: number) => {
            const Icon = categoryIcons[log?.category] ?? Shield;
            const colorClass = categoryColors[log?.category] ?? 'text-muted-foreground bg-muted';
            return (
              <motion.div key={log?.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="relative">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {i < filtered.length - 1 && (
                        <div className="absolute left-1/2 top-full w-px h-3 bg-border/50 -translate-x-1/2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{log?.action}</p>
                        {log?.institution && (
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{log?.institution}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{log?.description}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <SafeDate date={log?.createdAt} options={{ dateStyle: 'medium', timeStyle: 'short' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}

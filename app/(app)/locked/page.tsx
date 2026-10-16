'use client';

import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/page-wrapper';
import { QrCode } from '@/components/qr-code';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Smartphone, Shield, Phone, User, HeartPulse, AlertTriangle, MessageSquare, Save, Pencil, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function LockedScreenPage() {
  const { data: session } = useSession() || {};
  const userId = (session?.user as any)?.id;
  const profileUrl = typeof window !== 'undefined' && userId ? `${window.location.origin}/view/${userId}` : '';
  const [lostMode, setLostMode] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState(false);
  const [tempMessage, setTempMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/user/lost-mode')
      .then(r => r.json())
      .then(d => {
        setLostMode(!!d?.lostMode);
        setLockMessage(d?.lockScreenMessage ?? '');
      })
      .catch(() => {});
  }, []);

  const toggleLost = async (val: boolean) => {
    setLostMode(val);
    await fetch('/api/user/lost-mode', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lostMode: val }),
    }).catch(() => {});
  };

  const startEditing = () => {
    setTempMessage(lockMessage);
    setEditingMessage(true);
  };

  const cancelEditing = () => {
    setEditingMessage(false);
    setTempMessage('');
  };

  const saveMessage = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/lost-mode', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockScreenMessage: tempMessage }),
      });
      if (res.ok) {
        setLockMessage(tempMessage);
        setEditingMessage(false);
        toast.success('Notificação salva com sucesso!');
      }
    } catch {
      toast.error('Erro ao salvar notificação');
    } finally {
      setSaving(false);
    }
  };

  const infoRows = [
    { icon: User, label: 'Nome', value: 'Visível' },
    { icon: Phone, label: 'Telefone de emergência', value: 'Visível' },
    { icon: HeartPulse, label: 'Info médica', value: 'Sob verificação' },
  ];

  return (
    <PageWrapper className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Tela Bloqueada</h1>
        <p className="text-sm text-muted-foreground">Visualize como seu QR Code aparece na tela de bloqueio</p>
      </div>

      {/* Lost mode toggle */}
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-5 w-5 ${lostMode ? 'text-alert' : 'text-muted-foreground'}`} />
              <div>
                <Label className="text-sm font-medium">Modo Perdido</Label>
                <p className="text-xs text-muted-foreground">{lostMode ? 'Ativo — proteção máxima' : 'Desativado — modo normal'}</p>
              </div>
            </div>
            <Switch checked={lostMode} onCheckedChange={toggleLost} />
          </div>
        </CardContent>
      </Card>

      {/* Lock screen notification */}
      <Card className="glass border-primary/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <Label className="text-sm font-medium">Notificação fixa</Label>
                <p className="text-xs text-muted-foreground">Mensagem visível na tela de bloqueio para quem escanear</p>
              </div>
            </div>
            {!editingMessage && (
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={startEditing}>
                <Pencil className="h-3.5 w-3.5" />
                {lockMessage ? 'Editar' : 'Adicionar'}
              </Button>
            )}
          </div>

          {editingMessage ? (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <textarea
                value={tempMessage}
                onChange={e => setTempMessage(e.target.value)}
                placeholder="Ex: Se encontrado, ligue para (11) 99999-0000 ou envie email para joao@email.com"
                maxLength={200}
                rows={3}
                className="w-full rounded-xl bg-background border border-border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{tempMessage.length}/200 caracteres</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={cancelEditing} className="gap-1 text-xs">
                    <X className="h-3.5 w-3.5" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={saveMessage} disabled={saving} className="gap-1 text-xs">
                    <Save className="h-3.5 w-3.5" /> {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : lockMessage ? (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm">{lockMessage}</p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-xs text-muted-foreground italic">Nenhuma notificação configurada. Clique em "Adicionar" para criar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone mockup */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="glass max-w-sm mx-auto">
          <CardContent className="p-6">
            <p className="text-xs text-muted-foreground text-center mb-3">Pré-visualização</p>
            <div className="relative bg-background rounded-3xl border border-border p-6 flex flex-col items-center gap-4 min-h-[420px]">
              <div className="w-16 h-1.5 bg-muted rounded-full mb-2" />
              <Smartphone className="h-6 w-6 text-muted-foreground" />
              {lostMode && (
                <StatusBadge status="alert" pulse>Dispositivo Perdido</StatusBadge>
              )}
              <QrCode size={140} className="rounded-lg" url={profileUrl} />
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">SafeID</span>
              </div>
              {lockMessage ? (
                <div className="w-full p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-foreground leading-relaxed">{lockMessage}</p>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground text-center">
                  {lostMode ? 'Este dispositivo foi reportado como perdido. Escaneie o QR Code para ajudar.' : 'Escaneie para identificação segura'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info rows */}
      <Card className="glass">
        <CardContent className="p-6 space-y-3">
          <h3 className="text-sm font-medium mb-2">Informações na tela bloqueada</h3>
          {infoRows?.map((row: any) => (
            <div key={row?.label} className="flex items-center gap-3">
              <row.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1">{row?.label}</span>
              <StatusBadge status="safe">{row?.value}</StatusBadge>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

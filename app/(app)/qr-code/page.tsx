'use client';

import { PageWrapper } from '@/components/page-wrapper';
import { QrCode } from '@/components/qr-code';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Shield, Smartphone, CreditCard, Watch, Printer, Share2, Download, Info, Lock, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRef, useState, useCallback } from 'react';

const levels = [
  { label: 'Público', desc: 'Nome e contato para devolução', color: 'bg-safe', textColor: 'text-safe' },
  { label: 'Emergencial', desc: 'Informações médicas essenciais', color: 'bg-warning', textColor: 'text-warning' },
  { label: 'Restrito', desc: 'Documentos — nunca exibido automaticamente', color: 'bg-alert', textColor: 'text-alert', locked: true },
];

const shareOptions = [
  { icon: Smartphone, label: 'Tela de bloqueio' },
  { icon: CreditCard, label: 'Cartão' },
  { icon: Watch, label: 'Pulseira' },
  { icon: Printer, label: 'Impressão' },
];

export default function QrCodePage() {
  const { data: session } = useSession() || {};
  const userId = (session?.user as any)?.id;
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // Build the public profile URL
  const profileUrl = typeof window !== 'undefined' && userId
    ? `${window.location.origin}/view/${userId}`
    : '';

  const handleShare = async () => {
    if (!profileUrl) return;
    if (navigator?.share) {
      try {
        await navigator.share({ title: 'SafeID — Meu Perfil', text: 'Acesse meu perfil SafeID', url: profileUrl });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(profileUrl);
      toast.success('Link copiado para a área de transferência');
    }
  };

  const handleCopyLink = async () => {
    if (!profileUrl) return;
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = useCallback(() => {
    const container = qrContainerRef.current;
    if (!container) return;
    const canvas = container.querySelector('canvas');
    if (!canvas) { toast.error('QR Code ainda não carregado'); return; }
    const link = document.createElement('a');
    link.download = 'safeid-qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('QR Code baixado com sucesso!');
  }, []);

  return (
    <PageWrapper className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Meu QR Code</h1>
        <p className="text-sm text-muted-foreground">Seu QR Code pessoal com acesso controlado por níveis</p>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Card className="glass">
          <CardContent className="p-8 flex flex-col items-center">
            <div ref={qrContainerRef} className="bg-white p-4 rounded-2xl shadow-lg">
              <QrCode size={240} url={profileUrl} />
            </div>
            <StatusBadge status="info" className="mt-4">
              <Shield className="h-3 w-3" /> QR Code protegido · Acesso controlado
            </StatusBadge>

            {profileUrl && (
              <button
                onClick={handleCopyLink}
                className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-safe" /> : <Copy className="h-3 w-3" />}
                <span className="truncate max-w-[240px]">{profileUrl}</span>
              </button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Card className="glass">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-medium">Níveis de acesso</h3>
          {levels?.map((l: any, i: number) => (
            <motion.div key={l?.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${l?.color}`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${l?.textColor}`}>{l?.label}</p>
                <p className="text-xs text-muted-foreground">{l?.desc}</p>
              </div>
              {l?.locked && <Lock className="h-4 w-4 text-alert" />}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Quando alguém escanear este QR Code com a câmera do celular, será levado a uma página com suas informações públicas. Informações sensíveis requerem verificação.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {shareOptions?.map((opt: any, i: number) => (
          <motion.div key={opt?.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
            <Card className="glass hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <opt.icon className="h-5 w-5 text-primary" />
                <p className="text-xs font-medium">{opt?.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1 gap-2" onClick={handleShare}>
          <Share2 className="h-4 w-4" /> Compartilhar
        </Button>
        <Button variant="outline" className="flex-1 gap-2" onClick={handleDownload}>
          <Download className="h-4 w-4" /> Baixar QR Code
        </Button>
      </div>
    </PageWrapper>
  );
}

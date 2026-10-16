'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated
    setSent(true);
    toast.success('Se o email existir, você receberá instruções de recuperação.');
  };

  if (sent) {
    return (
      <AuthLayout title="Email enviado" description="Verifique sua caixa de entrada">
        <div className="flex flex-col items-center gap-4 py-4">
          <CheckCircle className="h-12 w-12 text-safe" />
          <p className="text-sm text-muted-foreground text-center">
            Se <strong suppressHydrationWarning>{email}</strong> estiver cadastrado, enviaremos instruções para redefinir sua senha.
          </p>
          <Link href="/login">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar ao login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Recuperar senha" description="Insira seu email para receber instruções">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full">Enviar instruções</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-6">
        <Link href="/login" className="text-primary hover:underline font-medium gap-1 inline-flex items-center">
          <ArrowLeft className="h-3 w-3" /> Voltar ao login
        </Link>
      </p>
    </AuthLayout>
  );
}

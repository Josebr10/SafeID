'use client';

import { useEffect, useRef, useState } from 'react';
import QRCodeLib from 'qrcode';

interface QrCodeProps {
  size?: number;
  className?: string;
  url?: string;
}

export function QrCode({ size = 200, className, url }: QrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !url) return;

    QRCodeLib.toCanvas(canvas, url, {
      width: size,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'H', // High — allows logo overlay
    }).then(() => {
      // Draw center logo over QR
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const logoSize = size * 0.2;
      const cx = (size - logoSize) / 2;

      // White circle background
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, logoSize * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Blue circle
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, logoSize * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0ea5e9';
      ctx.fill();

      // Letter "S"
      ctx.font = `bold ${logoSize * 0.5}px system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', size / 2, size / 2 + 1);

      setReady(true);
    }).catch(console.error);
  }, [url, size]);

  if (!url) {
    // Fallback placeholder
    return (
      <div
        className={className}
        style={{ width: size, height: size, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={{ color: '#94a3b8', fontSize: 12 }}>Carregando QR...</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.3s', borderRadius: 4 }}
    />
  );
}

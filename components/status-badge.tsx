import { cn } from '@/lib/utils';

const statusColors: Record<string, { dot: string; border: string; bg: string; text: string }> = {
  safe: { dot: 'bg-safe', border: 'border-safe/30', bg: 'bg-safe/10', text: 'text-safe' },
  alert: { dot: 'bg-alert', border: 'border-alert/30', bg: 'bg-alert/10', text: 'text-alert' },
  warning: { dot: 'bg-warning', border: 'border-warning/30', bg: 'bg-warning/10', text: 'text-warning' },
  info: { dot: 'bg-primary', border: 'border-primary/30', bg: 'bg-primary/10', text: 'text-primary' },
  neutral: { dot: 'bg-muted-foreground', border: 'border-border', bg: 'bg-muted', text: 'text-muted-foreground' },
};

export function StatusBadge({
  status = 'neutral',
  pulse = false,
  children,
  className,
}: {
  status?: 'safe' | 'alert' | 'warning' | 'info' | 'neutral';
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const colors = statusColors[status] ?? statusColors.neutral;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border',
        colors?.border,
        colors?.bg,
        colors?.text,
        className
      )}
    >
      <span
        className={cn('h-2 w-2 rounded-full', colors?.dot, pulse && 'animate-pulse-dot')}
      />
      {children}
    </span>
  );
}

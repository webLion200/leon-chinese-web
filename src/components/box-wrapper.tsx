import { cn } from '@/utils';

export function BoxWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-6 rounded-lg border border-gray-100', className)}>{children}</div>;
}

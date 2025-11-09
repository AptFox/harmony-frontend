'use client';

import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type ClassValue } from 'clsx';

export default function DashboardCard({
  title,
  buttonText,
  parentClassName,
  childrenClassName,
  children,
}: {
  title: string;
  buttonText: string;
  parentClassName?: ClassValue;
  childrenClassName?: ClassValue;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col p-2 rounded-lg border bg-secondary shadow-md mb-2 max-h-96',
        parentClassName
      )}
    >
      <div className="flex p-2 flex-row justify-between">
        <div className="flex items-center">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
        </div>
        <Button>{buttonText}</Button>
      </div>
      <Separator />
      <div className={cn('relative flex ', childrenClassName)}>{children}</div>
    </div>
  );
}

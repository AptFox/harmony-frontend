'use client';

import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type ClassValue } from 'clsx';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Dispatch, ReactNode, SetStateAction, useState } from 'react';

export default function DashboardCard({
  title,
  buttonContent,
  dialogContent,
  firstElement,
  secondElement,
  parentClassName,
  childrenClassName,
  children,
}: {
  title: string;
  buttonContent?: string | ReactNode;
  dialogContent?:
    | ((setDialogOpen: Dispatch<SetStateAction<boolean>>) => ReactNode)
    | (() => ReactNode);
  firstElement?: () => ReactNode;
  secondElement?: () => ReactNode;
  parentClassName?: ClassValue;
  childrenClassName?: ClassValue;
  children: ReactNode;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <div
      className={cn(
        'flex flex-col p-2 rounded-lg border bg-secondary shadow-md mb-2 lg:mb-0 max-w-135',
        parentClassName
      )}
    >
      <div className="flex p-2 flex-row justify-between">
        <div className="flex items-center">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
        </div>
        <div className="flex flex-row-reverse gap-2 h-10">
          {buttonContent && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <form>
                <DialogTrigger asChild>
                  <Button>{buttonContent}</Button>
                </DialogTrigger>
                {dialogContent && dialogContent(setDialogOpen)}
              </form>
            </Dialog>
          )}
          {firstElement && firstElement()}
          {secondElement && secondElement()}
        </div>
      </div>
      <Separator />
      <div className={cn('relative flex ', childrenClassName)}>{children}</div>
    </div>
  );
}

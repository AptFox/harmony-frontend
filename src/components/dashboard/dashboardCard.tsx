'use client';

import { Separator } from '@/components/ui/separator';
import { Button } from "@/components/ui/button";

export default function DashboardCard({title, buttonText, children}: { title: string; buttonText: string; children: React.ReactNode; }) {
  return (
  <div className="flex flex-col p-2 rounded-lg border bg-secondary shadow-md lg:flex-grow mb-2">
    <div className="flex p-2 flex-row justify-between">
      <div className="flex items-center">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
      </div>
      <Button>{buttonText}</Button>
    </div>
    <Separator />
    <div className="h-96 relative flex">
      {children}
    </div>
  </div>
  )
}
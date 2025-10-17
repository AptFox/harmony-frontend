'use client';
import { Button } from '@/components/ui/button';

export default function LoginButton({ onClickFn }: { onClickFn: () => void }) {
  return (
    <Button color="primary" variant="default" size="lg" onClick={onClickFn}>
      Login with Discord
    </Button>
  );
}

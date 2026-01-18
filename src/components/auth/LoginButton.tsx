'use client';
import { Button } from '@/components/ui/button';
import { DiscordIcon } from '@/components/ui/discordIcon';

export default function LoginButton({ onClickFn }: { onClickFn: () => void }) {
  return (
    <Button variant="default" onClick={onClickFn}>
      <span className="font-semibold font-[gg_sans, sans-serif] text-lg">
        Sign in with Discord
      </span>
      <DiscordIcon className="text-white !w-6 !h-6" />
    </Button>
  );
}

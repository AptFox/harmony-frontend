'use client';
import { Button } from '@/components/ui/button';
import { DiscordIcon } from '@/components/ui/discordIcon';
import { Spinner } from '@/components/ui/spinner';

export default function LoginButton({
  onClickFn,
  isLoading,
}: {
  onClickFn: () => void;
  isLoading: boolean;
}) {
  const buttonText = isLoading ? 'Loading...' : 'Sign in with Discord';
  return (
    <Button variant="default" onClick={onClickFn} disabled={isLoading}>
      <span className="font-semibold font-[gg_sans, sans-serif] text-lg">
        {buttonText}
      </span>
      {isLoading ? (
        <Spinner />
      ) : (
        <DiscordIcon className="text-white !w-6 !h-6" />
      )}
    </Button>
  );
}

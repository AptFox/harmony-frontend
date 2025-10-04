'use client';

import { Button } from '@heroui/react';

export default function LoginButton({ onClickFn }: { onClickFn: () => void }) {
  return (
    <Button color="primary" variant="shadow" size="lg" onPress={onClickFn}>
      Login
    </Button>
  );
}

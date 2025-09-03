'use client';

export default function LoginButton({ onClickFn }: { onClickFn: () => void }) {
  return (
    <button className="text-3xl text-center font-bold" onClick={onClickFn}>
      Login
    </button>
  );
}

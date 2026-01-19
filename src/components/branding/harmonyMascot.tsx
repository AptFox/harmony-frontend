import Image from 'next/image';

export default function HarmonyMascot({
  width = 128,
  height = 128,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <div className="rounded-full border-3 border-primary-foreground bg-primary">
      <Image
        src="/icon.svg"
        alt="Harmony logo"
        width={width}
        height={height}
        className="drop-shadow-lg transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
}

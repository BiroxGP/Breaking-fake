import { useState, type ReactNode } from 'react';
import { EyeOff } from 'lucide-react';

export function Hotseat({
  revealKey,
  name,
  children,
}: {
  revealKey: string;
  name: string;
  children: ReactNode;
}) {
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const revealed = revealedKey === revealKey;

  if (!revealed) {
    return (
      <div
        data-hotseat-curtain=""
        className="fixed inset-0 z-40 bg-ink/95 backdrop-blur flex flex-col items-center justify-center gap-6 p-6 text-center"
      >
        <EyeOff size={40} className="text-accent2" />
        <div>
          <div className="text-white/50 text-sm">Passa il dispositivo a</div>
          <div className="font-display text-4xl text-white mt-1">{name}</div>
        </div>
        <button
          type="button"
          onClick={() => setRevealedKey(revealKey)}
          className="px-6 py-3 rounded-lg bg-accent text-white font-bold hover:bg-accent/80"
        >
          Sono {name}, mostrami le mie carte
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

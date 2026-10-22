import { Sparkles } from 'lucide-react';

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-accent shrink-0"
      style={{ width: size, height: size }}
    >
      <Sparkles size={size * 0.55} className="text-white" strokeWidth={2.5} />
    </div>
  );
}

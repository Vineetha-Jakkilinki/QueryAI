import { Moon, Sun, Check } from 'lucide-react';
import Modal from './Modal';
import { useTheme } from '@/context/ThemeContext';
import type { Theme } from '@/types';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; Icon: typeof Moon; desc: string }[] = [
    { value: 'dark', label: 'Dark', Icon: Moon, desc: 'Night City / High contrast' },
    { value: 'light', label: 'Light', Icon: Sun, desc: 'Clean light with pink accent' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div>
        <div className="text-xs font-medium text-muted uppercase tracking-wide mb-3">
          Appearance
        </div>
        <div className="text-sm text-app mb-3">Theme</div>
        <div className="grid grid-cols-2 gap-3">
          {options.map(({ value, label, Icon, desc }) => {
            const active = theme === value;
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all ${
                  active
                    ? 'border-accent bg-surface-2'
                    : 'border-app hover:border-accent/50 bg-surface-2/40'
                }`}
              >
                {active && (
                  <span className="absolute top-3 right-3 text-accent">
                    <Check size={16} />
                  </span>
                )}
                <Icon size={20} className={active ? 'text-accent' : 'text-muted'} />
                <div className="text-sm font-medium text-app">{label}</div>
                <div className="text-xs text-muted">{desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

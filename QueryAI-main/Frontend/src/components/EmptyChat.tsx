import { Sparkles } from 'lucide-react';

export default function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6 shadow-lg shadow-accent/20">
        <Sparkles size={32} className="text-white" strokeWidth={2.5} />
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold text-app mb-2">
        How can I help you today?
      </h2>
      <p className="text-muted text-sm sm:text-base">
        Ask questions, analyze images, or upload documents.
      </p>
    </div>
  );
}

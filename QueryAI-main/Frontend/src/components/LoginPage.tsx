import { LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-app text-app">
      <div className="w-full max-w-md px-6">
        <div className="rounded-2xl border border-app bg-surface p-8 shadow-2xl">
          
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#FF007F] flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                ✦
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-app">
            Welcome to QueryAI
          </h1>

          <p className="text-sm text-muted text-center mt-3">
            Your multimodal AI assistant for questions, images,
            PDFs, presentations and documents.
          </p>

          <button
            onClick={login}
            className="w-full mt-8 flex items-center justify-center gap-3 rounded-xl bg-white text-black py-3 px-4 font-medium hover:bg-gray-100 transition-colors"
          >
            <LogIn size={20} />
            Continue with Google
          </button>

          <p className="text-xs text-muted text-center mt-6">
            Sign in securely using your Google account.
          </p>
        </div>
      </div>
    </div>
  );
}
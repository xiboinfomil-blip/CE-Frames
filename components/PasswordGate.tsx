// components/PasswordGate.tsx
import { useState } from 'react';

interface PasswordGateProps {
  onUnlock: (password: string) => Promise<void>;
  isLoading: boolean;
  error: string;
}

export default function PasswordGate({ onUnlock, isLoading, error }: PasswordGateProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUnlock(password);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      ></div>
      
      <div className="max-w-md w-full bg-white p-10 rounded-none border-l-4 border-red-600 shadow-2xl relative z-10">
        <div className="mb-8">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wide">Enter credentials to view telemetry</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORD"
              disabled={isLoading}
              className="w-full px-0 py-4 border-b-2 border-slate-200 bg-transparent text-slate-900 font-mono text-lg focus:border-red-600 focus:outline-none transition-colors placeholder:text-slate-300"
              autoFocus
            />
          </div>
          
          {error && <p className="text-red-600 font-mono text-xs uppercase tracking-widest">{error}</p>}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-4 hover:bg-red-600 transition-all duration-300 skew-x-[-10deg] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span className="block skew-x-[10deg]">{isLoading ? 'Verifying...' : 'Unlock Gallery'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
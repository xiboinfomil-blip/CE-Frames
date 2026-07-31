import { useState, useEffect } from 'react';
import { 
  HiLockClosed, 
  HiEye, 
  HiEyeSlash, 
  HiExclamationCircle, 
  HiArrowPath 
} from 'react-icons/hi2';

interface PasswordGateProps {
  onUnlock: (password: string) => Promise<void>;
  isLoading: boolean;
  error: string;
}

export default function PasswordGate({ onUnlock, isLoading, error }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Focus management for accessibility
  useEffect(() => {
    if (!isLoading && error) {
      const timer = setTimeout(() => {
        // Optional: Clear error after a few seconds for cleaner UX
        // But we'll keep it visible until user types again based on standard patterns
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    await onUnlock(password);
  };

  return (
    <div className="min-h-screen w-full bg-stone-50 flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-stone-200">
      
      {/* Background Texture: Subtle Noise for "Photo Paper" feel */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-stone-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-stone-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/50 p-8 md:p-10 relative z-10 transition-all duration-500 ease-out transform translate-y-0 opacity-100">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 mb-6 text-stone-800">
            <HiLockClosed className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">
            Private Gallery
          </h1>
          <p className="text-stone-500 text-sm font-medium leading-relaxed">
            Please enter your passkey to access the curated collection.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type={isVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              autoComplete="current-password"
              className={`
                w-full px-4 py-4 bg-stone-50 border-2 rounded-xl text-stone-900 placeholder:text-stone-400
                focus:outline-none focus:ring-4 focus:ring-stone-100 transition-all duration-300
                ${error ? 'border-red-200 focus:border-red-400 bg-red-50/30' : 'border-stone-100 focus:border-stone-300'}
                disabled:opacity-60 disabled:cursor-not-allowed
              `}
            />
            
            {/* Toggle Visibility Button */}
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-200 rounded-full"
              aria-label={isVisible ? "Hide password" : "Show password"}
            >
              {isVisible ? (
                <HiEyeSlash className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <HiExclamationCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-red-600 leading-tight">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !password}
            className={`
              w-full py-4 px-6 rounded-xl font-semibold text-white shadow-lg shadow-stone-200
              transition-all duration-300 transform active:scale-[0.98]
              flex items-center justify-center gap-2
              ${isLoading || !password 
                ? 'bg-stone-300 cursor-not-allowed shadow-none' 
                : 'bg-stone-900 hover:bg-stone-800 hover:shadow-xl hover:-translate-y-0.5'}
            `}
          >
            {isLoading ? (
              <>
                <HiArrowPath className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Unlock Gallery</span>
            )}
          </button>
        </form>

        {/* Footer / Hint */}
        <div className="mt-8 text-center">
          <p className="text-xs text-stone-400">
            Secured by end-to-end encryption
          </p>
        </div>
      </div>
    </div>
  );
}
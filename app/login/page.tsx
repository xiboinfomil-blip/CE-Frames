import { Suspense } from 'react';
import BrandingPanel from "@/components/login/BrandingPanel";
import LoginForm from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-stone-50 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans selection:bg-stone-200">
      
      {/* Ambient Background Elements */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 15% 50%, rgba(231, 225, 215, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 85% 30%, rgba(214, 210, 202, 0.5) 0%, transparent 50%)
          `
        }}
        aria-hidden="true" 
      />
      
      {/* Main Card Container */}
      <div className="w-full max-w-6xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden flex flex-col lg:flex-row relative z-10 animate-in fade-in zoom-in-95 duration-700 ease-out">
        
        {/* Left: Branding Panel CSE */}
        <div className="hidden lg:block w-5/12 relative bg-stone-100">
          <BrandingPanel />
        </div>

        {/* Right: Login Form */}
        <div className="w-full lg:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white/80">
          
          {/* Suspense boundary handles searchParams loading during CSR/SSR hydration */}
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center space-y-4 animate-pulse w-full max-w-md mx-auto">
              <div className="h-8 w-1/2 bg-stone-200 rounded-lg self-start mb-2" />
              <div className="h-4 w-3/4 bg-stone-200 rounded-md self-start mb-6" />
              <div className="h-12 w-full bg-stone-200 rounded-xl" />
              <div className="h-12 w-full bg-stone-200 rounded-xl" />
              <div className="h-12 w-full bg-stone-300 rounded-xl mt-4" />
            </div>
          }>
            <LoginForm />
          </Suspense>

        </div>
      </div>
    </main>
  );
}
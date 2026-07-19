// components/Skeleton.jsx
export default function Skeleton({ 
  className = 'w-24 h-6', 
  isCircle = false, 
  rounded = 'rounded-lg' // 'rounded-none', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-full'
}) {
  return (
    <div 
      aria-hidden="true"
      className={`
        relative overflow-hidden bg-zinc-100
        ${isCircle ? 'rounded-full' : rounded}
        ${className}
      `}
    >
      {/* The Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite_linear] bg-gradient-to-r from-transparent via-zinc-200/80 to-transparent w-full h-full" />
      
      {/* Base Color Fallback (if animation fails or for preference) */}
      <div className="absolute inset-0 bg-zinc-100 -z-10" />
    </div>
  );
}
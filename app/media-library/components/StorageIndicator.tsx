'use client';

import { memo } from 'react';
import { HiExclamationTriangle } from 'react-icons/hi2';

interface StorageData {
used: string;
rawUsed: number;
limit: string;
rawLimit: number;
percentageUsed: string;
}

interface StorageIndicatorProps {
storage: StorageData | null;
isLoading?: boolean;
}

const StorageIndicator = memo(
({ storage, isLoading = false }: StorageIndicatorProps) => {
const storagePercent = storage
? parseFloat(storage.percentageUsed)
: 0;

// Determine storage state
const getStorageState = () => {
  if (!storage || storage.rawLimit === 0) return 'unknown';
  if (storagePercent >= 100) return 'full';
  if (storagePercent >= 95) return 'critical';
  if (storagePercent >= 80) return 'high';
  if (storagePercent >= 60) return 'medium';
  return 'low';
};

const state = getStorageState();

// CE Frames color configuration
const stateStyles = {
  low: {
    bg: 'bg-linear-to-br from-[#EAF4FB]/80 via-white to-[#F5F7FA]',
    border: 'border-[#E2E8F0]',
    indicator: 'bg-[#004A87]',
    progress: 'bg-linear-to-r from-[#004A87] to-[#006BB6]',
    text: 'text-[#00345F]',
    label: 'text-[#004A87]/75',
    shadow: 'shadow-[#004A87]/5',
  },

  medium: {
    bg: 'bg-linear-to-br from-[#FFF1E5]/80 via-white to-[#F5F7FA]',
    border: 'border-[#E2E8F0]',
    indicator: 'bg-[#FF8201]',
    progress: 'bg-linear-to-r from-[#FF8201] to-[#F5A623]',
    text: 'text-[#00345F]',
    label: 'text-[#FF8201]/80',
    shadow: 'shadow-[#FF8201]/5',
  },

  high: {
    bg: 'bg-linear-to-br from-[#FFF1E5] via-white to-[#FFF1E5]/60',
    border: 'border-[#FF8201]/30',
    indicator: 'bg-[#FF8201]',
    progress: 'bg-linear-to-r from-[#FF8201] to-[#E87500]',
    text: 'text-[#00345F]',
    label: 'text-[#FF8201]',
    shadow: 'shadow-[#FF8201]/10',
  },

  critical: {
    bg: 'bg-linear-to-br from-red-50 via-white to-[#FFF1E5]',
    border: 'border-red-200/70',
    indicator: 'bg-red-500',
    progress: 'bg-linear-to-r from-red-500 to-[#FF8201]',
    text: 'text-red-700',
    label: 'text-red-600/80',
    shadow: 'shadow-red-100/50',
  },

  full: {
    bg: 'bg-linear-to-br from-red-50 via-white to-red-50/70',
    border: 'border-red-300/80',
    indicator: 'bg-red-600 animate-pulse',
    progress:
      'bg-linear-to-r from-red-500 via-red-600 to-red-700',
    text: 'text-red-700 font-bold',
    label: 'text-red-600',
    shadow: 'shadow-red-200/60',
  },

  unknown: {
    bg: 'bg-linear-to-br from-[#F5F7FA] via-white to-[#EAF4FB]/50',
    border: 'border-[#E2E8F0]',
    indicator: 'bg-[#94A3B8]',
    progress:
      'bg-linear-to-r from-[#94A3B8] to-[#64748B]',
    text: 'text-[#64748B]',
    label: 'text-[#64748B]/70',
    shadow: 'shadow-[#00345F]/5',
  },
};

const currentStyle =
  stateStyles[state as keyof typeof stateStyles];

// Loading skeleton
if (isLoading) {
  return (
    <div
      className="
        relative overflow-hidden
        rounded-2xl
        border border-[#E2E8F0]
        bg-white/90
        backdrop-blur-sm
        p-5
        shadow-sm
      "
      aria-label="Loading storage information"
    >
      <div className="animate-pulse space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" />
            <div className="h-3 w-28 rounded bg-[#E2E8F0]" />
          </div>

          <div className="h-3 w-16 rounded bg-[#E2E8F0]" />
        </div>

        {/* Progress skeleton */}
        <div className="h-2.5 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
          <div className="h-full w-2/3 rounded-full bg-[#CBD5E1] animate-pulse" />
        </div>

        {/* Details skeleton */}
        <div className="flex justify-between">
          <div className="h-2.5 w-16 rounded bg-[#E2E8F0]" />
          <div className="h-2.5 w-16 rounded bg-[#E2E8F0]" />
        </div>
      </div>
    </div>
  );
}

return (
  <div
    className={`
      group relative overflow-hidden
      rounded-2xl
      border
      backdrop-blur-md
      transition-all duration-500 ease-out
      hover:scale-[1.01]
      hover:shadow-xl
      ${currentStyle.bg}
      ${currentStyle.border}
      ${currentStyle.shadow}
    `}
    role="region"
    aria-label="Storage capacity indicator"
  >
    {/* Background Accent */}
    <div className="absolute inset-0 opacity-[0.035] pointer-events-none">
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle_at_50%_50%,rgba(0,74,135,0.25),transparent_70%)]
        "
      />
    </div>

    {/* Content */}
    <div className="relative p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {/* Status Indicator */}
          <div className="relative flex items-center justify-center">
            <div
              className={`
                w-2.5 h-2.5
                rounded-full
                ${currentStyle.indicator}
              `}
            />

            {(state === 'critical' || state === 'full') && (
              <div
                className={`
                  absolute inset-0
                  rounded-full
                  ${currentStyle.indicator}
                  blur-sm
                  opacity-70
                `}
              />
            )}
          </div>

          <h3
            className={`
              text-[11px]
              font-bold
              uppercase
              tracking-[0.2em]
              ${currentStyle.label}
            `}
          >
            Storage Capacity
          </h3>
        </div>

        <span
          className={`
            text-xs
            font-mono
            font-bold
            ${currentStyle.text}
          `}
        >
          {storage
            ? `${storage.percentageUsed}% USED`
            : 'CALCULATING...'}
        </span>
      </div>

      {/* Progress Bar */}
      <div
        className="
          relative
          h-2.5
          w-full
          rounded-full
          overflow-hidden
          bg-[#00345F]/5
          shadow-inner
        "
        role="progressbar"
        aria-valuenow={storagePercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Storage usage: ${storagePercent.toFixed(
          1
        )} percent`}
      >
        {/* Progress Fill */}
        <div
          className={`
            absolute top-0 left-0
            h-full
            rounded-full
            transition-all duration-1000 ease-out
            ${currentStyle.progress}
          `}
          style={{
            width: `${Math.min(100, storagePercent)}%`,
          }}
        >
          {/* Shimmer */}
          <div
            className="
              absolute inset-0
              bg-linear-to-r
              from-transparent
              via-white/30
              to-transparent
              animate-shimmer
            "
          />
        </div>

        {/* Reference Grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[25%] top-0 bottom-0 w-px bg-[#00345F]/5" />
          <div className="absolute left-[50%] top-0 bottom-0 w-px bg-[#00345F]/5" />
          <div className="absolute left-[75%] top-0 bottom-0 w-px bg-[#00345F]/5" />
        </div>
      </div>

      {/* Storage Details */}
      <div className="flex justify-between mt-3 text-[11px] font-mono">
        <span
          className={`${currentStyle.label} font-semibold`}
        >
          {storage ? storage.used : '---'}
        </span>

        <span
          className={`${currentStyle.label} font-semibold`}
        >
          {storage ? storage.limit : '---'}
        </span>
      </div>

      {/* Critical / Full Warning */}
      {(state === 'critical' || state === 'full') && (
        <div
          className="
            mt-3.5
            pt-3
            border-t border-red-200/60
            flex items-center gap-2
            text-[11px]
            font-medium
            text-red-600
          "
        >
          <HiExclamationTriangle
            className="
              w-4 h-4
              shrink-0
              text-red-500
            "
          />

          <span>
            {state === 'full'
              ? 'Storage is full! Free up space now.'
              : 'Storage is almost full. Consider upgrading.'}
          </span>
        </div>
      )}
    </div>

    {/* Brand Accent */}
    <div
      className={`
        absolute bottom-0 left-0 right-0
        h-0.5
        transition-transform duration-500
        origin-left
        scale-x-0
        group-hover:scale-x-100
        ${
          state === 'critical' || state === 'full'
            ? 'bg-red-500'
            : 'bg-[#FF8201]'
        }
      `}
    />
  </div>
);

}
);

StorageIndicator.displayName = 'StorageIndicator';

export default StorageIndicator;

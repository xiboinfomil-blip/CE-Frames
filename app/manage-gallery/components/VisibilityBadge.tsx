'use client';

import { memo } from 'react';
import { VISIBILITY_STATUSES } from '@/db/schema';
import { HiLockClosed } from 'react-icons/hi2';

interface VisibilityBadgeProps {
  type: typeof VISIBILITY_STATUSES[number];
}

export const VisibilityBadge = memo(
  ({ type }: VisibilityBadgeProps) => {
    const config: Record<
      typeof VISIBILITY_STATUSES[number],
      {
        label: string;
        dotColor: string;
        bgColor: string;
        textColor: string;
        borderColor: string;
        icon?: React.ReactNode;
      }
    > = {
      public: {
        label: 'Public',
        dotColor: 'bg-emerald-500',
        bgColor: 'bg-white/90',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
      },

      private: {
        label: 'Privé',
        dotColor: 'bg-[#64748B]',
        bgColor: 'bg-[#F5F7FA]/95',
        textColor: 'text-[#00345F]',
        borderColor: 'border-[#E2E8F0]',
      },

      password_protected: {
        label: 'Protégé',
        dotColor: 'bg-[#FF8201]',
        bgColor: 'bg-[#FFF1E5]/95',
        textColor: 'text-[#00345F]',
        borderColor: 'border-[#FF8201]/30',
        icon: (
          <HiLockClosed className="w-3 h-3 ml-1 text-[#FF8201]" />
        ),
      },

      unlisted: {
        label: 'Non listé',
        dotColor: 'bg-[#004A87]',
        bgColor: 'bg-[#EAF4FB]/95',
        textColor: 'text-[#004A87]',
        borderColor: 'border-[#004A87]/20',
      },
    };

    const current = config[type] || config.private;

    return (
      <div
        className={`
          inline-flex
          items-center
          gap-2
          px-2.5
          py-1.5
          rounded-md
          backdrop-blur-md
          border
          shadow-sm
          transition-all
          duration-300
          ${current.bgColor}
          ${current.textColor}
          ${current.borderColor}
        `}
      >
        {/* Status Indicator */}
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={`
              absolute
              inline-flex
              h-full
              w-full
              rounded-full
              opacity-30
              animate-ping
              ${current.dotColor}
            `}
          />

          <span
            className={`
              relative
              inline-flex
              rounded-full
              h-1.5
              w-1.5
              ${current.dotColor}
            `}
          />
        </span>

        <span
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.15em]
            leading-none
          "
        >
          {current.label}
        </span>

        {current.icon && (
          <span>{current.icon}</span>
        )}
      </div>
    );
  }
);

VisibilityBadge.displayName = 'VisibilityBadge';


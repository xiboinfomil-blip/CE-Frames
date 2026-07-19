"use client";

import React, {
  forwardRef,
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
  useState,
} from "react";
import styles from "./RaceButton.module.css";

// ─── Types ───────────────────────────────────────────────────────
type Variant = "solid" | "gradient" | "carbon" | "neon" | "checkered" | "ghost";
type Size = "xs" | "sm" | "md" | "lg" | "xl";
type ColorScheme = "red" | "blue" | "green" | "amber" | "neon" | "white";
type Shape = "default" | "pill" | "square";

type ButtonAsProps =
  | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: never })
  | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string });

export interface RaceButtonProps extends ButtonAsProps {
  /** Visual style variant */
  variant?: Variant;
  /** Size preset */
  size?: Size;
  /** Accent color */
  color?: ColorScheme;
  /** Button shape */
  shape?: Shape;
  /** Leading icon */
  startIcon?: ReactNode;
  /** Trailing icon */
  endIcon?: ReactNode;
  /** Icon-only button (no text) */
  iconOnly?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Racing number badge */
  racingNumber?: number;
  /** Show speed lines animation on hover */
  showSpeedLines?: boolean;
  /** Show engine rev pulse on hover */
  showEngineRev?: boolean;
  /** Custom class */
  className?: string;
  /** Children */
  children?: ReactNode;
}

// ─── Component ───────────────────────────────────────────────────
const RaceButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  RaceButtonProps
>(
  (
    {
      variant = "solid",
      size = "md",
      color = "red",
      shape = "default",
      startIcon,
      endIcon,
      iconOnly = false,
      loading = false,
      disabled = false,
      fullWidth = false,
      racingNumber,
      showSpeedLines = true,
      showEngineRev = true,
      className = "",
      children,
      href,
      ...rest
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<
      { id: number; x: number; y: number }[]
    >([]);

    const isDisabled = disabled || loading;

    const handleMouseDown = (
      e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
    ) => {
      if (isDisabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setRipples((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 700);

      const mouseDownProp = (rest as any).onMouseDown;
      if (typeof mouseDownProp === "function") mouseDownProp(e);
    };

    const rootClasses = [
      styles.root,
      styles[`variant-${variant}`],
      styles[`size-${size}`],
      styles[`color-${color}`],
      styles[`shape-${shape}`],
      fullWidth ? styles.fullWidth : "",
      iconOnly ? styles.iconOnly : "",
      loading ? styles.loading : "",
      isDisabled ? styles.disabled : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const content = (
      <>
        {/* Checkered pattern (for checkered variant) */}
        {variant === "checkered" && (
          <div className={styles.checkeredPattern} aria-hidden="true" />
        )}

        {/* Carbon texture */}
        {variant === "carbon" && (
          <div className={styles.carbonTexture} aria-hidden="true" />
        )}

        {/* Speed lines on hover */}
        {showSpeedLines && !isDisabled && (
          <div className={styles.speedLines} aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={styles.speedLine}
                style={{
                  "--line-index": i,
                  "--line-delay": `${i * 0.08}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}

        {/* Engine rev pulse */}
        {showEngineRev && !isDisabled && (
          <div className={styles.engineRev} aria-hidden="true" />
        )}

        {/* Racing number badge */}
        {racingNumber !== undefined && !loading && (
          <div className={styles.racingBadge} aria-hidden="true">
            <span className={styles.racingNumber}>{racingNumber}</span>
          </div>
        )}

        {/* Ripple effects */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className={styles.ripple}
            style={{ left: r.x, top: r.y }}
            aria-hidden="true"
          />
        ))}

        {/* Main content */}
        <span className={styles.content}>
          {loading ? (
            <svg
              className={styles.spinner}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="32 32"
                opacity="0.25"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="16 48"
              />
            </svg>
          ) : (
            <>
              {startIcon && (
                <span className={styles.startIcon}>{startIcon}</span>
              )}
              {!iconOnly && children && (
                <span className={styles.label}>{children}</span>
              )}
              {iconOnly && children}
              {endIcon && (
                <span className={styles.endIcon}>{endIcon}</span>
              )}
            </>
          )}
        </span>

        {/* Corner accents */}
        <div className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
        <div className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />
      </>
    );

    // Render as anchor if href provided
    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={rootClasses}
          aria-disabled={isDisabled}
          tabIndex={isDisabled ? -1 : 0}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={(rest as any).type || "button"}
        className={rootClasses}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        onMouseDown={handleMouseDown}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

RaceButton.displayName = "RaceButton";
export default RaceButton;
"use client";

import React, {
  useState,
  useRef,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useId,
} from "react";
import styles from "./RaceTextField.module.css";

// ─── Types ───────────────────────────────────────────────────────
type Variant = "outlined" | "filled" | "underline" | "carbon";
type Size = "sm" | "md" | "lg";
type ColorScheme =
  | "red"
  | "blue"
  | "green"
  | "amber"
  | "neon"
  | "white";

export interface RaceTextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "color"> {
  /** Visible label above the field */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Visual variant */
  variant?: Variant;
  /** Size preset */
  size?: Size;
  /** Accent color */
  color?: ColorScheme;
  /** Leading icon / element */
  startIcon?: ReactNode;
  /** Trailing icon / element */
  endIcon?: ReactNode;
  /** Helper text below the field */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Success state */
  success?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Show speed lines animation on focus */
  showSpeedLines?: boolean;
  /** Show checkered flag pattern */
  showCheckered?: boolean;
  /** Custom className */
  className?: string;
  /** Prefix text (e.g. "+1", "$") */
  prefix?: string;
  /** Suffix text (e.g. "km/h", "s") */
  suffix?: string;
  /** Character count (shows when maxLength is set) */
  showCharCount?: boolean;
  /** Racing number badge */
  racingNumber?: number;
}

// ─── Component ───────────────────────────────────────────────────
const RaceTextField = forwardRef<HTMLInputElement, RaceTextFieldProps>(
  (
    {
      label,
      placeholder = "",
      variant = "outlined",
      size = "md",
      color = "red",
      startIcon,
      endIcon,
      helperText,
      error = false,
      errorMessage,
      success = false,
      fullWidth = false,
      showSpeedLines = true,
      showCheckered = false,
      className = "",
      prefix,
      suffix,
      showCharCount = false,
      racingNumber,
      disabled = false,
      readOnly = false,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      id,
      type = "text",
      maxLength,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const [focused, setFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(
      (defaultValue as string) || ""
    );
    const inputRef = useRef<HTMLInputElement>(null);
    const combinedRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;

    const currentValue =
      value !== undefined ? String(value) : internalValue;
    const hasValue = currentValue.length > 0;
    const charCount = currentValue.length;

    // Use provided id, or fall back to the stable generated id
    const uniqueId = id || generatedId;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const rootClasses = [
      styles.root,
      styles[`variant-${variant}`],
      styles[`size-${size}`],
      styles[`color-${color}`],
      fullWidth ? styles.fullWidth : "",
      focused ? styles.focused : "",
      error ? styles.hasError : "",
      success ? styles.hasSuccess : "",
      disabled ? styles.disabled : "",
      readOnly ? styles.readOnly : "",
      hasValue ? styles.hasValue : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={rootClasses}>
        {/* Checkered background pattern */}
        {showCheckered && (
          <div className={styles.checkeredBg} aria-hidden="true" />
        )}

        {/* Speed lines animation */}
        {showSpeedLines && focused && (
          <div className={styles.speedLines} aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className={styles.speedLine}
                style={{
                  "--line-index": i,
                  "--line-delay": `${i * 0.05}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}

        {/* Racing number badge */}
        {racingNumber !== undefined && (
          <div className={styles.racingBadge} aria-hidden="true">
            <span className={styles.racingNumber}>{racingNumber}</span>
          </div>
        )}

        {/* Label */}
        {label && (
          <label htmlFor={uniqueId} className={styles.label}>
            <span className={styles.labelText}>{label}</span>
            {showSpeedLines && focused && (
              <span className={styles.labelFlag}>🏁</span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className={styles.inputWrapper}>
          {/* Left accent stripe */}
          <div className={styles.accentStripe} aria-hidden="true" />

          {/* Start icon */}
          {startIcon && (
            <span className={styles.startIcon}>{startIcon}</span>
          )}

          {/* Prefix */}
          {prefix && <span className={styles.prefix}>{prefix}</span>}

          {/* The actual input */}
          <input
            ref={combinedRef}
            id={uniqueId}
            type={type}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            className={styles.input}
            aria-invalid={error}
            aria-describedby={
              error
                ? `${uniqueId}-error`
                : helperText
                  ? `${uniqueId}-helper`
                  : undefined
            }
            {...rest}
          />

          {/* Suffix */}
          {suffix && <span className={styles.suffix}>{suffix}</span>}

          {/* End icon */}
          {endIcon && (
            <span className={styles.endIcon}>{endIcon}</span>
          )}

          {/* Focus indicator line (bottom) */}
          <div className={styles.focusLine} aria-hidden="true" />

          {/* Corner accents */}
          <div className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
          <div className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
          <div className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
          <div className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />
        </div>

        {/* Bottom row: helper/error + char count */}
        <div className={styles.bottomRow}>
          <div className={styles.bottomLeft}>
            {error && errorMessage && (
              <span id={`${uniqueId}-error`} className={styles.errorMessage} role="alert">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errorMessage}
              </span>
            )}
            {!error && helperText && (
              <span id={`${uniqueId}-helper`} className={styles.helperText}>
                {helperText}
              </span>
            )}
          </div>
          {showCharCount && maxLength && (
            <span
              className={`${styles.charCount} ${
                charCount >= maxLength ? styles.charCountFull : ""
              }`}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

RaceTextField.displayName = "RaceTextField";
export default RaceTextField;
// components/Loading.tsx
import React from "react";

interface LoadingProps {
  text?: string;
  size?: "small" | "medium" | "large";
}

/* ======================
   Spinner Utama
====================== */
export function LoadingSpinner({
  size = "medium",
}: {
  size?: "small" | "medium" | "large";
}) {
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
  };

  const spinnerSize = sizeMap[size];

  return (
    <svg
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      fill="none"
      className="spinner"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#e6e6e6"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="#5f5f5f"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ======================
   Loading Full Page
====================== */
export default function Loading({
  text = "Loading...",
  size = "medium",
}: LoadingProps) {
  return (
    <div className="loading-wrapper">
      <LoadingSpinner size={size} />
      <div className="loading-text">{text}</div>
    </div>
  );
}

/* ======================
   Dots Loading
====================== */
export function DotsLoading({ text = "Loading" }: { text?: string }) {
  return (
    <div className="dots-loading">
      <span className="dots-text">{text}</span>
      <span className="dots-container">
        <span className="dot dot-1">.</span>
        <span className="dot dot-2">.</span>
        <span className="dot dot-3">.</span>
      </span>
    </div>
  );
}

/* ======================
   Inline Loading (Button)
====================== */
export function InlineLoading({ text = "Processing..." }: { text?: string }) {
  return (
    <span className="inline-loading">
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        className="inline-spinner"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          opacity="0.25"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {text}
    </span>
  );
}

/* ======================
   Full Page Overlay Loading
====================== */
export function OverlayLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <LoadingSpinner size="large" />
        <div className="loading-text">{text}</div>
      </div>
    </div>
  );
}

/* ======================
   Skeleton Loading Components
====================== */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton-wrapper">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton skeleton-text" />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-wrapper">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-wrapper">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" />
      ))}
    </div>
  );
}
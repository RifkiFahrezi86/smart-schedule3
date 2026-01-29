// components/Icon.tsx
import React from 'react';

interface IconProps {
  name?: string;
  size?: number;
  className?: string;
  color?: string;
}

/* ======================
   Success Icon
====================== */
export function SuccessIcon({ size = 80, className = '', color = '#48bb78' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Success"
    >
      <circle cx="12" cy="12" r="10" fill={color} opacity="0.2" />
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <path
        d="M8 12.5l2.5 2.5 5.5-5.5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ======================
   Warning Icon
====================== */
export function WarningIcon({ size = 80, className = '', color = '#f59e0b' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Warning"
    >
      <path
        d="M12 2L2 20h20L12 2z"
        fill={color}
        opacity="0.2"
      />
      <path
        d="M12 2L2 20h20L12 2z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v4"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="0.5" fill={color} stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

/* ======================
   Error Icon
====================== */
export function ErrorIcon({ size = 80, className = '', color = '#ef4444' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Error"
    >
      <circle cx="12" cy="12" r="10" fill={color} opacity="0.2" />
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <path
        d="M15 9l-6 6M9 9l6 6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ======================
   Info Icon
====================== */
export function InfoIcon({ size = 24, className = '', color = '#3b82f6' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Info"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <path
        d="M12 16v-4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="8" r="0.5" fill={color} stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

/* ======================
   Lightbulb Icon
====================== */
export function LightbulbIcon({ size = 24, className = '', color = '#f59e0b' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Suggestion"
    >
      <path
        d="M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 21h6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 18h4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ======================
   Block Icon
====================== */
export function BlockIcon({ size = 24, className = '', color = '#ef4444' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Blocked"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
      <path
        d="M4.93 4.93l14.14 14.14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ======================
   Calendar Check Icon
====================== */
export function CalendarCheckIcon({ size = 24, className = '', color = '#48bb78' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Calendar Check"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
      <path d="M3 10h18" stroke={color} strokeWidth="2" />
      <path d="M8 2v4M16 2v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M9 14l2 2 4-4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ======================
   Alert Circle Icon
====================== */
export function AlertCircleIcon({ size = 24, className = '', color = '#f59e0b' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Alert"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <path d="M12 8v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="0.5" fill={color} stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

/* ======================
   Inline Icon - LENGKAP
====================== */
export function InlineIcon({ 
  name, 
  size = 24, 
  className = '' 
}: IconProps) {
  const icons: Record<string, React.ReactNode> = {
    'loader': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" 
      />
    ),
    'settings': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" 
      />
    ),
    'zap': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" 
      />
    ),
    'clock': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    ),
    'calendar': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" 
      />
    ),
    'check-circle': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    ),
    'save': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M16.5 3.75V7.5L21 7.5M16.5 3.75H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V7.5l-4.5-3.75zM9 15.75h6" 
      />
    ),
    'arrow-left': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" 
      />
    ),
    'bar-chart': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" 
      />
    ),
    'book': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" 
      />
    ),
    'trending-up': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" 
      />
    ),
  };

  const pathElement = icons[name || ''];
  if (!pathElement) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`inline-icon ${className}`}
      aria-hidden="true"
    >
      {pathElement}
    </svg>
  );
}

export default InlineIcon;
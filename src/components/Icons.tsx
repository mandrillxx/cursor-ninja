import { SVGProps } from "react";

export function CursorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      <path d="m13 13 6 6" />
    </svg>
  );
}

export function SpeedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m8 14.5 4-9 4 9" />
      <path d="M8.5 18h7" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export function PrecisionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="5" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="19" />
      <line x1="19" y1="12" x2="21" y2="12" />
      <line x1="3" y1="12" x2="5" y2="12" />
    </svg>
  );
}

export function ControlIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 12H2" />
      <path d="m4.5 4.5 4.5 4.5" />
      <path d="M12 12v10" />
      <path d="M12 12 7.5 7.5" />
    </svg>
  );
} 
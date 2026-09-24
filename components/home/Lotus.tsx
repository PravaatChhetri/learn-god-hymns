import { useId } from "react";

/** Ornamental divider: a small lotus between two fading threads. */
// Gradients use userSpaceOnUse: a flat line has a zero-height bounding box, which would draw nothing.
export default function Lotus() {
  const id = useId(); // unique gradient ids per divider on the page
  return (
    <svg className="lotus" viewBox="0 0 160 28" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}l`} gradientUnits="userSpaceOnUse" x1="0" x2="50" y1="0" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`${id}r`} gradientUnits="userSpaceOnUse" x1="160" x2="110" y1="0" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path d="M0 16 H50" stroke={`url(#${id}l)`} strokeWidth="0.8" />
      <path d="M110 16 H160" stroke={`url(#${id}r)`} strokeWidth="0.8" />
      <circle cx="54" cy="16" r="1.3" fill="currentColor" />
      <circle cx="106" cy="16" r="1.3" fill="currentColor" />
      <g fill="currentColor">
        <path d="M80 24 C71 24 63 21 60 16 C68 16 75 19 80 24Z" opacity="0.55" />
        <path d="M80 24 C89 24 97 21 100 16 C92 16 85 19 80 24Z" opacity="0.55" />
        <path d="M80 24 C73 22 67 16 66 10 C73 11 78 17 80 24Z" opacity="0.75" />
        <path d="M80 24 C87 22 93 16 94 10 C87 11 82 17 80 24Z" opacity="0.75" />
        <path d="M80 4 C85 10 85 18 80 24 C75 18 75 10 80 4Z" />
      </g>
    </svg>
  );
}

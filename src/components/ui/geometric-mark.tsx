/**
 * A restrained eight-point star (khatem), used as a quiet, recurring mark —
 * never a mosque silhouette or crescent. One line weight, low opacity.
 */
export function GeometricMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
        <path d="M24 4 L31 17 L44 24 L31 31 L24 44 L17 31 L4 24 L17 17 Z" />
        <path d="M24 11 L28.5 19.5 L37 24 L28.5 28.5 L24 37 L19.5 28.5 L11 24 L19.5 19.5 Z" />
      </g>
    </svg>
  );
}

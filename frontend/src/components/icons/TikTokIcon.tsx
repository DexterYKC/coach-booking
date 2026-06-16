// lucide-react has no TikTok glyph — minimal inline icon matching the same
// `size`/`className` API as lucide icons so it drops into the same call sites.
export function TikTokIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.6 5.82a4.28 4.28 0 0 1-3.16-1.41v9.97a4.74 4.74 0 1 1-4.74-4.74c.17 0 .33.01.49.03v2.5a2.24 2.24 0 1 0 1.5 2.21V2h2.4a4.28 4.28 0 0 0 3.51 4.2v2.4a4.28 4.28 0 0 1-3.5-1.78v.07a4.28 4.28 0 0 0 3.5 1.93z" />
    </svg>
  );
}

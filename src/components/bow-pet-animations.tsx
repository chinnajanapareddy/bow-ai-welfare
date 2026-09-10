import { Bone, PawPrint } from "@/components/bow-icons";

const FLOAT_PAWS = [
  { left: "6%", size: 22, delay: 0, duration: 11 },
  { left: "22%", size: 16, delay: 3.5, duration: 13 },
  { left: "48%", size: 26, delay: 6, duration: 12 },
  { left: "70%", size: 18, delay: 1.8, duration: 14 },
  { left: "88%", size: 24, delay: 8, duration: 11.5 },
];

/** Gentle paw prints drifting upward — for hero/footer backgrounds. */
export function FloatingPaws({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {FLOAT_PAWS.map((paw, index) => (
        <PawPrint
          key={index}
          className="pet-float-paw absolute text-bow-gold/50"
          style={{
            left: paw.left,
            bottom: "-8%",
            width: paw.size,
            height: paw.size,
            animationDelay: `${paw.delay}s`,
            animationDuration: `${paw.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/** A bowl that slowly fills with kibble, then rests — classic feeding accent. */
export function FoodBowl({ className = "" }: { className?: string }) {
  const kibbles = [
    { left: "38%", delay: 0 },
    { left: "50%", delay: 0.55 },
    { left: "62%", delay: 1.1 },
    { left: "44%", delay: 1.65 },
    { left: "56%", delay: 2.2 },
  ];
  return (
    <div aria-hidden="true" className={`relative h-40 w-56 ${className}`}>
      {kibbles.map((kibble, index) => (
        <span
          key={index}
          className="pet-kibble absolute top-0 block h-4 w-4 rounded-full bg-bow-brown"
          style={{ left: kibble.left, animationDelay: `${kibble.delay}s` }}
        />
      ))}
      <svg viewBox="0 0 220 110" className="absolute bottom-0 left-0 w-full">
        <ellipse cx="110" cy="34" rx="72" ry="18" fill="var(--bow-brown)" opacity="0.18" />
        <ellipse cx="110" cy="32" rx="62" ry="13" fill="var(--bow-sand)" />
        {[
          [82, 30],
          [100, 34],
          [118, 30],
          [136, 34],
          [110, 27],
        ].map(([cx, cy], index) => (
          <circle key={index} cx={cx} cy={cy} r="7" fill="var(--bow-brown)" opacity="0.85" />
        ))}
        <path d="M40 34 Q110 118 180 34 Q110 62 40 34 Z" fill="var(--bow-forest)" />
        <path d="M40 34 Q110 62 180 34" fill="none" stroke="var(--bow-gold)" strokeWidth="3" />
      </svg>
    </div>
  );
}

/** A bone swaying like a happy tail wag — small accent near adoption CTAs. */
export function SwayingBone({ className = "" }: { className?: string }) {
  return (
    <Bone aria-hidden="true" className={`pet-sway-bone h-9 w-9 text-bow-brown ${className}`} />
  );
}

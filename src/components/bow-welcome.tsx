import { useEffect, useState } from "react";
import { PawPrint } from "@/components/bow-icons";

const PAW_STEPS = [
  { left: "8%", top: "72%", rotate: "-18deg", delay: 0 },
  { left: "20%", top: "58%", rotate: "14deg", delay: 260 },
  { left: "32%", top: "70%", rotate: "-16deg", delay: 520 },
  { left: "44%", top: "56%", rotate: "16deg", delay: 780 },
  { left: "56%", top: "68%", rotate: "-14deg", delay: 1040 },
  { left: "68%", top: "54%", rotate: "14deg", delay: 1300 },
  { left: "80%", top: "64%", rotate: "-16deg", delay: 1560 },
];

export function WelcomeScreen() {
  const [phase, setPhase] = useState<"hidden" | "playing" | "leaving">("hidden");

  useEffect(() => {
    if (window.sessionStorage.getItem("bow-welcomed")) return;
    setPhase("playing");
    const leaveTimer = window.setTimeout(() => setPhase("leaving"), 2600);
    const doneTimer = window.setTimeout(() => {
      window.sessionStorage.setItem("bow-welcomed", "1");
      setPhase("hidden");
    }, 3200);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-bow-ivory ${
        phase === "leaving" ? "welcome-exit" : ""
      }`}
    >
      {PAW_STEPS.map((step, index) => (
        <PawPrint
          key={index}
          className="welcome-paw absolute h-8 w-8 text-bow-brown sm:h-10 sm:w-10"
          style={{
            left: step.left,
            top: step.top,
            rotate: step.rotate,
            animationDelay: `${step.delay}ms`,
          }}
        />
      ))}
      <div className="welcome-logo text-center">
        <p className="font-display text-6xl tracking-[-0.04em] text-bow-forest sm:text-7xl">BOW</p>
        <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-bow-brown">
          Every street soul deserves a second chance
        </p>
      </div>
    </div>
  );
}

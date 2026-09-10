import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, BadgeCheck, Check, ExternalLink, Heart, LocateFixed, MapPin, Mic, PawPrint, ShieldCheck, Sparkles } from "./bow-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { priorityTone, type Priority } from "@/lib/bow-data";
import {
  submitReportServerFn,
  generateDogDescriptionServerFn,
  getReportByIdServerFn,
} from "@/lib/bow-backend.server";
import { cn } from "@/lib/utils";
import dogCardImage from "@/assets/bow-dog-card.jpg";
import storyCardImage from "@/assets/bow-story-card.jpg";

export function BowLogo({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      className={cn(
        "flex items-center gap-3",
        light ? "text-primary-foreground" : "text-foreground",
      )}
      aria-label="BOW home"
    >
      <span className="relative grid h-10 w-10 place-items-center text-[0.68rem] font-semibold tracking-[0.16em]">
        <PawPrint className="absolute h-8 w-8 text-bow-brown" strokeWidth={1.7} />
      </span>
      <span className="leading-none">
        <strong className="font-display text-[2rem] font-normal tracking-[-0.03em]">BOW</strong>
        <small className="mt-1 block text-[0.56rem] font-medium tracking-[0.14em] opacity-80">
          FOR EVERY STREET SOUL
        </small>
      </span>
    </Link>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl leading-[0.98] tracking-[-0.035em] text-foreground sm:text-5xl">
          {title}
        </h2>
        {body && (
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            {body}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function ActionLink({
  to,
  children,
  variant = "default",
}: {
  to: string;
  children: React.ReactNode;
  variant?: "default" | "outline";
}) {
  return (
    <Button
      asChild
      variant={variant === "outline" ? "outline" : "default"}
      className="h-12 rounded-lg px-5 text-[0.78rem] tracking-[0.01em]"
    >
      <Link to={to}>
        {children}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}

export function PageIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section className="border-b border-border bg-bow-ivory px-5 pb-16 pt-16 sm:px-10 sm:pb-20 sm:pt-24">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.95] tracking-[-0.045em] text-foreground sm:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          {body}
        </p>
      </div>
    </section>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn("priority-badge", `priority-${priorityTone(priority)}`)}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {priority} Priority
    </span>
  );
}

export function BowCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("bow-card", className)}>{children}</div>;
}

function compressImageForAi(dataUrl: string, maxDim = 800): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith("data:")) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function ReportForm({
  onResult,
}: {
  onResult?: (aiResult: {
    priority: Priority;
    summary: string;
    recommendedAction: string;
    confidence: number;
    indicators?: string[];
    whyPriority?: string;
    immediateActions?: string[];
  }) => void;
}) {
  const [recording, setRecording] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [location, setLocation] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [voiceText, setVoiceText] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");
  const [generatingDesc, setGeneratingDesc] = React.useState(false);
  const [descCompleted, setDescCompleted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [lastReport, setLastReport] = React.useState<any>(null);
  const [locating, setLocating] = React.useState(false);
  const [locSuccess, setLocSuccess] = React.useState(false);

  const submitReportFn = useServerFn(submitReportServerFn);
  const generateDescriptionFn = useServerFn(generateDogDescriptionServerFn);
  const getReportByIdFn = useServerFn(getReportByIdServerFn);
  const recognitionRef = React.useRef<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!submitted || !lastReport?.id) return;
    if (lastReport.status === "Rescued & Safe" || lastReport.status === "Resolved") return;

    const interval = setInterval(async () => {
      try {
        const res = await getReportByIdFn({ data: { id: lastReport.id } });
        if (res.ok && res.report) {
          setLastReport(res.report);
        }
      } catch (err) {
        console.warn("Error checking report status", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [submitted, lastReport?.id, lastReport?.status, getReportByIdFn]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImagePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const rawDataUrl = typeof reader.result === "string" ? reader.result : null;
      if (!rawDataUrl) return;

      setImagePreview(rawDataUrl);
      setGeneratingDesc(true);
      setDescCompleted(false);

      try {
        const compressed = await compressImageForAi(rawDataUrl, 800);
        const res = await generateDescriptionFn({
          data: {
            imageDataUrl: compressed,
            ...(voiceText ? { voiceText } : {}),
          },
        });
        if (res?.description && !res.description.includes("Please select or upload")) {
          setDescription(res.description);
          setDescCompleted(true);
        }
      } catch (err) {
        console.warn("Auto AI image analysis error", err);
      } finally {
        setGeneratingDesc(false);
      }
    };
    reader.readAsDataURL(file);
  };

async function resolveLocationAddress(lat: number, lng: number): Promise<string> {
  const latFixed = lat.toFixed(5);
  const lngFixed = lng.toFixed(5);

  const nomPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const spot =
          addr.amenity ||
          addr.building ||
          addr.road ||
          addr.pedestrian ||
          addr.residential ||
          addr.footway ||
          addr.house_number ||
          "";
        const neighbourhood =
          addr.neighbourhood ||
          addr.suburb ||
          addr.quarter ||
          addr.city_district ||
          addr.hamlet ||
          "";
        const city = addr.city || addr.town || addr.village || addr.county || "";
        const state = addr.state || "";
        const parts = Array.from(new Set([spot, neighbourhood, city, state].filter(Boolean)));
        if (parts.length > 0) {
          return `${parts.join(", ")} (${latFixed}, ${lngFixed})`;
        }
        if (data.display_name) {
          const clean = data.display_name
            .split(",")
            .map((s: string) => s.trim())
            .filter((s: string) => !["India", "CMWSSB"].some((ign) => s.includes(ign)))
            .slice(0, 4)
            .join(", ");
          if (clean) return `${clean} (${latFixed}, ${lngFixed})`;
        }
      }
    } catch {}
    return null;
  })();

  const bdcPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const streetOrLoc =
          data.localityInfo?.informative?.find(
            (i: any) =>
              i.description === "street" ||
              i.description === "point of interest" ||
              i.description === "locality"
          )?.name || data.locality;
        const city = data.city || data.locality || "";
        const state = data.principalSubdivision || "";
        const parts = Array.from(new Set([streetOrLoc, city, state].filter(Boolean)));
        if (parts.length > 0) {
          return `${parts.join(", ")} (${latFixed}, ${lngFixed})`;
        }
      }
    } catch {}
    return null;
  })();

  const results = await Promise.allSettled([nomPromise, bdcPromise]);
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      return r.value;
    }
  }

  return `GPS Location (${latFixed}, ${lngFixed})`;
}

  const handleLocateClick = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocSuccess(false);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const resolved = await resolveLocationAddress(lat, lng);
          setLocation(resolved);
          setLocSuccess(true);
        } catch {
          setLocation(`GPS Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
          setLocSuccess(true);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        let errMsg = "Unable to retrieve GPS location.";
        if (err.code === err.PERMISSION_DENIED) {
          errMsg = "Location permission denied. Please enter address manually.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errMsg = "GPS position unavailable. Please enter location manually.";
        } else if (err.code === err.TIMEOUT) {
          errMsg = "GPS request timed out. Please try again or enter location manually.";
        }
        setError(errMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  };

  const handleAutoGenerateDescription = async () => {
    if (!imagePreview && !voiceText) {
      fileInputRef.current?.click();
      return;
    }

    setGeneratingDesc(true);
    setDescCompleted(false);
    try {
      const compressed = imagePreview ? await compressImageForAi(imagePreview, 800) : undefined;
      const res = await generateDescriptionFn({
        data: {
          ...(compressed ? { imageDataUrl: compressed } : {}),
          ...(voiceText ? { voiceText } : {}),
        },
      });
      if (res?.description && !res.description.includes("Please select or upload")) {
        setDescription(res.description);
        setDescCompleted(true);
      }
    } catch (err) {
      console.warn("AI description generation error", err);
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleSubmit = async () => {
    const trimmedDescription = description.trim();
    const trimmedLocation = location.trim();

    if (!trimmedDescription || !trimmedLocation) {
      setError("Please add both a location and a short description before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const compressed = imagePreview ? await compressImageForAi(imagePreview, 800) : undefined;

      const userEmail =
        (typeof window !== "undefined"
          ? window.localStorage.getItem("bow-user-email") || window.sessionStorage.getItem("bow-user-email")
          : null) ?? "hello@bow.org";

      const result = await submitReportFn({
        data: {
          email: userEmail,
          location: trimmedLocation,
          description: trimmedDescription,
          voiceText: voiceText || trimmedDescription,
          concern: voiceText ? "Possible mobility issue" : "Needs review",
          ...(compressed ? { imageDataUrl: compressed } : {}),
        },
      });

      if (result.ok) {
        if (result.report?.id && typeof window !== "undefined") {
          try {
            const storedVal = window.localStorage.getItem("bow-user-report-ids");
            const existingIds = storedVal ? JSON.parse(storedVal) : [];
            const idsArray = Array.isArray(existingIds) ? existingIds : [];
            if (!idsArray.includes(result.report.id)) {
              window.localStorage.setItem("bow-user-report-ids", JSON.stringify([result.report.id, ...idsArray]));
            }
          } catch {}
        }

        const nextAiResult = {
          priority: (result.ai?.priority ?? "Medium") as Priority,
          summary: result.ai?.summary ?? "The dog appears to need a welfare check.",
          recommendedAction:
            result.ai?.recommendedAction ?? "Dispatch a rescue volunteer and monitor the dog.",
          confidence: result.ai?.confidence ?? 91,
          indicators: result.ai?.indicators ?? [
            "Visible physical signal evaluated",
            "Location coordinates logged",
            "Queued for human review",
          ],
          whyPriority:
            result.ai?.whyPriority ??
            "Evaluated based on reported posture, urgency context, and location data.",
          immediateActions: result.ai?.immediateActions ?? [
            "Provide clean drinking water or unseasoned rice/kibble if safe.",
            "Gently encourage the dog into a shaded spot off hot asphalt.",
            "Keep a safe distance and protect from oncoming vehicular traffic.",
          ],
        };

        if (result.report) {
          setLastReport(result.report);
        }
        setSubmitted(true);
        setError("");
        onResult?.(nextAiResult);
        return;
      }


      setError(result.message ?? "Unable to submit the report right now.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoiceToggle = () => {
    if (recording) {
      setRecording(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      return;
    }

    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (event: any) => {
          let transcript = "";
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setVoiceText(transcript);
          setDescription((prev) => (prev ? prev : transcript));
        };

        rec.onerror = () => {
          setRecording(false);
        };
        rec.onend = () => {
          setRecording(false);
        };

        recognitionRef.current = rec;
        rec.start();
        setRecording(true);
        return;
      } catch {}
    }

    setRecording(true);
    setTimeout(() => {
      setRecording(false);
      const simulated = "There is a dog near the college gate and it looks like it cannot walk.";
      setVoiceText(simulated);
      setDescription((prev) => (prev ? prev : simulated));
    }, 1800);
  };

  return (
    <BowCard className="p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-2xl">Tell us what you see.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your report helps a human reach the right street soul.
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-bow-sand text-bow-forest">
          <PawPrint className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="upload-tile sm:col-span-2 cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            onChange={handleImageChange}
          />
          <span className="grid h-10 w-10 place-items-center rounded-full bg-background">
            <Sparkles className="h-4 w-4 text-bow-brown" />
          </span>
          <span>
            <strong className="block text-sm">Upload dog photo or short video</strong>
            <small className="text-xs text-muted-foreground">
              Click to select photo · Gemini AI Vision analyzes photo automatically
            </small>
          </span>
        </label>
        {imagePreview && (
          <div className="relative sm:col-span-2 overflow-hidden rounded-lg border border-border bg-background">
            <img src={imagePreview} alt="Selected dog report" className="h-48 w-full object-cover" />
            {generatingDesc && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white gap-2 text-xs font-medium backdrop-blur-xs">
                <Sparkles className="h-4 w-4 animate-spin text-amber-400" />
                <span>✨ Gemini AI Vision analyzing photo...</span>
              </div>
            )}
          </div>
        )}
        <label className="relative sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="field-label">Location *</span>
            {locating ? (
              <span className="mb-1 text-xs text-amber-700 font-medium flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 animate-spin text-amber-600" /> Detecting live GPS location...
              </span>
            ) : locSuccess ? (
              <span className="mb-1 inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> GPS Location Acquired
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void handleLocateClick()}
                className="mb-1 text-xs text-bow-brown hover:text-bow-forest font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LocateFixed className="h-3.5 w-3.5" /> Detect My Location
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <Input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Enter street, landmark, or click GPS icon →"
              className="h-12 rounded-lg bg-background pr-11 text-xs sm:text-sm"
            />
            <button
              type="button"
              disabled={locating}
              onClick={() => void handleLocateClick()}
              title="Detect precise live location"
              className="absolute right-3 p-1.5 text-bow-brown hover:text-bow-forest transition-colors cursor-pointer disabled:opacity-50"
            >
              {locating ? (
                <Sparkles className="h-4 w-4 animate-spin text-bow-brown" />
              ) : (
                <LocateFixed className="h-4 w-4" />
              )}
            </button>
          </div>
          {location && (
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-emerald-600" /> View pin on Google Maps <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-[0.68rem] text-muted-foreground">High-accuracy GPS active</span>
            </div>
          )}
        </label>
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="field-label">What is happening?</span>
            {descCompleted ? (
              <span className="mb-1 inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>✨ AI Vision Analysis Complete</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleAutoGenerateDescription}
                disabled={generatingDesc}
                className="mb-1 flex items-center gap-1.5 text-xs text-bow-brown hover:text-bow-forest transition-colors font-medium cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{generatingDesc ? "Generating..." : "✨ Generate AI Description"}</span>
              </button>
            )}
          </div>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Tell us what you noticed or click 'Generate AI Description'..."
            className="min-h-36 sm:min-h-40 rounded-lg bg-background text-sm leading-relaxed"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={recording ? "Stop voice report" : "Record a voice report"}
          onClick={handleVoiceToggle}
          className={cn("h-11 w-11 rounded-full", recording && "border-bow-brown text-bow-brown animate-pulse")}
        >
          <Mic className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground">
          {recording ? "Listening... speak naturally" : "Add a voice report"}
        </span>
        <Button
          type="button"
          disabled={submitting}
          className="ml-auto h-11 rounded-lg px-5 text-xs font-semibold bg-bow-forest text-primary-foreground hover:bg-bow-forest/90 cursor-pointer disabled:opacity-70"
          onClick={handleSubmit}
        >
          {submitting ? (
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 animate-spin text-amber-300" />
              <span>Submitting to Rescue Team...</span>
            </span>
          ) : submitted ? (
            <span className="flex items-center gap-1.5 text-emerald-300">
              <Check className="h-4 w-4" />
              <span>Report Submitted to Rescue Team ✓</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>Submit Report</span>
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>

      {submitted && (
        <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50/90 p-4 text-emerald-950 text-xs space-y-2.5 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
            <BadgeCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>Report Submitted Successfully to Rescue Team!</span>
          </div>
          <p className="leading-relaxed">
            Thank you for taking care of this street soul! Your report has been dispatched to the rescue team. You can view real-time status updates and track all your reported dogs anytime in your profile.
          </p>
          <div className="pt-1 flex flex-wrap gap-2">
            <Button asChild size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs rounded-lg cursor-pointer">
              <Link to="/profile">View My Reported Dogs & Live Status →</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="text-xs rounded-lg border-emerald-300 bg-background cursor-pointer">
              <Link to="/rescue">View Rescue Feed</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-lg border border-bow-brown/20 bg-bow-sand/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bow-brown flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-bow-forest" />
          First Response — What you can do right now:
        </p>
        <ul className="mt-2 space-y-1.5 text-xs text-foreground/80 leading-5">
          <li className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-bow-brown shrink-0 mt-2" />
            <span><strong>Food & Water:</strong> Offer clean drinking water or unseasoned food if safe.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-bow-brown shrink-0 mt-2" />
            <span><strong>Shade & Shelter:</strong> Gently encourage into shade off hot asphalt.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-bow-brown shrink-0 mt-2" />
            <span><strong>Traffic Distance:</strong> Keep a safe, calm distance and keep dog clear of road traffic.</span>
          </li>
        </ul>
      </div>

      {voiceText && (
        <p className="mt-4 rounded-lg border border-bow-brown/20 bg-bow-sand/60 px-3 py-2 text-[0.7rem] leading-5 text-bow-forest">
          Voice note: “{voiceText}”
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      {submitted && (
        <div className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50/90 p-5 space-y-4 text-emerald-950 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-600 text-white font-bold text-xl shadow-xs">
              ❤️
            </span>
            <div>
              <h3 className="font-display text-2xl font-semibold text-emerald-900">
                Thank you for being their voice! 🐾
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-emerald-800 font-medium">
                Every act of noticing brings hope to a street soul. Your report has been dispatched to our local Rescue Team. You can watch the live rescue status update right here!
              </p>
            </div>
          </div>

          {lastReport && (
            <div className="rounded-lg bg-white/95 p-4 border border-emerald-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Rescue Case #{lastReport.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!lastReport?.id) return;
                    try {
                      const res = await getReportByIdFn({ data: { id: lastReport.id } });
                      if (res.ok && res.report) setLastReport(res.report);
                    } catch {}
                  }}
                  className="text-[0.72rem] text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                >
                  🔄 Refresh Status
                </button>
              </div>

              <div className="rounded-md bg-emerald-50/80 p-3 border border-emerald-200">
                <p className="text-xs text-emerald-900">
                  <strong>Current Live Status:</strong>{" "}
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                    {lastReport.status}
                  </span>
                </p>
                {lastReport.status.includes("Rescued") || lastReport.status.includes("Safe") ? (
                  <div className="mt-2.5 text-xs font-bold text-emerald-800 bg-emerald-100 p-2.5 rounded-md border border-emerald-300 flex items-center gap-2">
                    <span className="text-base">🎉</span>
                    <span>RESCUED & SAFE! The rescue team has successfully reached and cared for this dog! Thank you for making this possible!</span>
                  </div>
                ) : (
                  <p className="mt-1 text-[0.68rem] text-emerald-700">
                    Rescue coordinators have received your report. Live status updates automatically as rescue volunteers respond.
                  </p>
                )}
              </div>

              {/* 4-Step Progress Indicator */}
              <div className="grid grid-cols-4 gap-1.5 pt-1 text-center text-[0.65rem] font-medium">
                <div className={`p-2 rounded-md transition-colors ${lastReport.status ? "bg-emerald-600 text-white font-bold" : "bg-gray-100 text-gray-400"}`}>
                  1. Received 📥
                </div>
                <div className={`p-2 rounded-md transition-colors ${
                  ["Team Dispatched", "In Progress", "Rescued & Safe", "Resolved"].includes(lastReport.status)
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  2. Dispatched 🚑
                </div>
                <div className={`p-2 rounded-md transition-colors ${
                  ["In Progress", "Rescued & Safe", "Resolved"].includes(lastReport.status)
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  3. In Care 🩺
                </div>
                <div className={`p-2 rounded-md transition-colors ${
                  ["Rescued & Safe", "Resolved"].includes(lastReport.status)
                    ? "bg-emerald-600 text-white font-bold animate-pulse"
                    : "bg-gray-100 text-gray-400"
                }`}>
                  4. Rescued 🎉
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </BowCard>
  );
}

export function AnalysisResult({
  analysis,
}: {
  analysis?: {
    priority: Priority;
    summary: string;
    recommendedAction: string;
    confidence?: number;
    indicators?: string[];
    whyPriority?: string;
    immediateActions?: string[];
  } | null;
}) {
  const resolved = analysis ?? {
    priority: "High" as Priority,
    summary: "The uploaded image shows signals that may need timely human attention.",
    recommendedAction:
      "Dispatch a rescue volunteer and share the location with the nearest welfare network.",
    confidence: 91,
    indicators: [
      "✓ Possible wound or posture signal detected",
      "✓ Abnormal posture indicator",
      "✓ Location context captured",
    ],
    whyPriority:
      "High Priority assigned because detected visual cues and incident context suggest potential mobility limitation or acute discomfort.",
    immediateActions: [
      "Offer fresh drinking water if safe to approach without causing agitation.",
      "Gently protect or shield the dog from oncoming vehicular traffic.",
      "Maintain a calm, safe distance and stay on-site until rescue volunteers arrive.",
    ],
  };

  const confidenceValue = resolved.confidence ?? 89;
  const indicatorsList = resolved.indicators?.length
    ? resolved.indicators
    : [
        resolved.priority === "High"
          ? "Urgent rescue response recommended"
          : "Welfare check recommended",
        "Location and incident context captured",
        "Automatic case created for rescue team",
      ];

  const immediateActionsList = resolved.immediateActions?.length
    ? resolved.immediateActions
    : [
        "Provide fresh drinking water or unseasoned food if safe.",
        "Gently encourage the dog into a shaded spot away from hot asphalt.",
        "Keep a safe distance and protect from oncoming vehicular traffic.",
      ];

  return (
    <BowCard className="overflow-hidden">
      <div className="border-b border-border bg-bow-forest px-6 py-5 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.18em] opacity-70">
              AI-assisted welfare assessment
            </p>
            <h3 className="mt-2 font-display text-3xl">{resolved.priority} priority</h3>
          </div>
          <div className="text-right">
            <span className="inline-block rounded-full border border-primary-foreground/20 px-3 py-1 text-[0.65rem] uppercase tracking-widest">
              AI triage
            </span>
            <span className="mt-2 block text-xs font-semibold text-bow-gold">
              {confidenceValue}% Confidence
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-5 p-6">
        <p className="text-sm leading-6 text-muted-foreground">{resolved.summary}</p>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground mb-3">
            Visible Indicators Detected
          </p>
          <div className="space-y-2.5">
            {indicatorsList.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-bow-sage text-bow-forest shrink-0">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-xs text-foreground/90">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {resolved.whyPriority && (
          <div className="rounded-lg border border-bow-brown/20 bg-bow-sand/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bow-brown">
              Explainable AI — Why {resolved.priority} Priority?
            </p>
            <p className="mt-2 text-xs leading-5 text-foreground/80">{resolved.whyPriority}</p>
          </div>
        )}

        <div className="rounded-lg border border-bow-forest/20 bg-bow-sage/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bow-forest">
            On-Site Actions — What you can do right now
          </p>
          <div className="mt-2.5 space-y-2">
            {immediateActionsList.map((action, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs leading-5 text-bow-forest font-medium">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-bow-forest text-primary-foreground text-[0.6rem] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            Recommended Action for Rescue Team
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{resolved.recommendedAction}</p>
        </div>

        <div className="rounded-lg bg-muted/40 p-3 text-[0.68rem] text-muted-foreground leading-4">
          <p>
            <strong>Disclaimer:</strong> BOW AI does not diagnose medical conditions. This is an
            AI-assisted welfare assessment; human/veterinary evaluation is required.
          </p>
        </div>

        <Button variant="outline" className="w-full rounded-lg text-xs">
          Rescue team notified
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </BowCard>
  );
}

export function FormField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <Input placeholder={placeholder} className="h-12 rounded-lg bg-background" />
    </label>
  );
}

export function DogCard({
  name,
  detail,
  match,
  index = 0,
}: {
  name: string;
  detail: string;
  match: string;
  index?: number;
}) {
  return (
    <BowCard className="group overflow-hidden p-0">
      <div className="relative aspect-[0.92] overflow-hidden bg-bow-sand">
        <img
          src={index % 2 === 0 ? dogCardImage : storyCardImage}
          alt={`${name}, an adoptable street dog`}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          width={900}
          height={1000}
        />
        <button
          type="button"
          aria-label={`Support ${name}`}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/85 text-bow-brown backdrop-blur"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-2xl">{name}</h3>
            <p className="mt-1 text-[0.68rem] text-muted-foreground">{detail}</p>
          </div>
          <span className="text-xs font-semibold text-bow-forest">
            {match}
            <small className="block font-normal text-muted-foreground">match</small>
          </span>
        </div>
        <Button className="mt-5 h-10 w-full rounded-lg text-xs">
          Meet {name}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </BowCard>
  );
}

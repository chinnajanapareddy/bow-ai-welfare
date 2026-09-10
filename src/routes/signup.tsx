import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BowLogo, BowCard } from "@/components/bow-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupServerFn } from "@/lib/bow-backend.server";
import { ShieldCheck, Heart, PawPrint } from "@/components/bow-icons";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Join BOW Community — Sign Up" },
      { name: "description", content: "Create your BOW account to report street dogs, accept rescue cases, or volunteer." },
      { property: "og:title", content: "Join BOW Community" },
      { property: "og:description", content: "Become part of BOW for every street soul." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const signupFn = useServerFn(signupServerFn);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Community Member" | "Volunteer" | "Rescue Team">("Volunteer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in your Full Name, Email, and Password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signupFn({
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          city: city.trim(),
          password,
          role,
        },
      });

      if (!result.ok || !result.user) {
        setError(result.message ?? "Unable to create account.");
        return;
      }

      const items: Array<[string, string | undefined]> = [
        ["bow-user-email", result.user.email],
        ["bow-user-name", result.user.name],
        ["bow-user-role", result.user.role ?? role],
        ["bow-user-id", result.user.id],
        ["bow-user-phone", result.user.phone ?? phone],
        ["bow-user-city", result.user.city ?? city],
      ];
      for (const [k, v] of items) {
        if (v) {
          window.localStorage.setItem(k, v);
          window.sessionStorage.setItem(k, v);
        }
      }


      navigate({ to: "/rescue" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-[720px] place-items-center px-5 py-12 sm:py-20">
      <BowCard className="w-full max-w-xl p-7 sm:p-10">
        <div className="flex items-center justify-between">
          <BowLogo />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-bow-sand text-bow-forest border border-border">
            <Heart className="h-3.5 w-3.5 text-bow-brown" /> Community Join
          </span>
        </div>

        <h1 className="mt-8 font-display text-4xl">Join the BOW Family</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your account to submit reports, accept rescue cases, or join local feeding drives.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="field-label">Full Name *</span>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ananya Rao"
              className="h-11 rounded-lg bg-background"
            />
          </label>

          <label>
            <span className="field-label">Email Address *</span>
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ananya@example.com"
              className="h-11 rounded-lg bg-background"
            />
          </label>

          <label>
            <span className="field-label">Phone Number</span>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="h-11 rounded-lg bg-background"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="field-label">City / Location</span>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Chennai, Tamil Nadu"
              className="h-11 rounded-lg bg-background"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="field-label">Password *</span>
            <Input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 rounded-lg bg-background"
            />
          </label>

          <div className="sm:col-span-2 space-y-2 pt-1">
            <span className="field-label block">Your Primary Role</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { r: "Community Member", label: "Member", desc: "Report & Support" },
                { r: "Volunteer", label: "Volunteer", desc: "Accept Rescues" },
                { r: "Rescue Team", label: "Rescue Team", desc: "Full Coordination" },
              ].map(({ r, label: l, desc }) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r as any)}
                  className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    role === r
                      ? "bg-bow-forest text-primary-foreground border-bow-forest"
                      : "bg-background border-border hover:bg-bow-sand text-foreground"
                  }`}
                >
                  <strong className="block text-xs">{l}</strong>
                  <span className={`text-[0.65rem] ${role === r ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                    {desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="sm:col-span-2 mt-3 h-12 rounded-lg bg-bow-forest text-primary-foreground font-semibold hover:bg-bow-forest/90 cursor-pointer"
          >
            {loading ? "Creating Account..." : "Create Account & Join BOW"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-bow-forest hover:underline">
            Log in here
          </Link>
        </p>
      </BowCard>
    </main>
  );
}

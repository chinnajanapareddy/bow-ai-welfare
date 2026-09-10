import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BowLogo, BowCard } from "@/components/bow-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginServerFn } from "@/lib/bow-backend.server";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in to BOW — Community Portal" },
      { name: "description", content: "Sign in to continue your BOW community impact & rescue journey." },
      { property: "og:title", content: "Log in to BOW" },
      { property: "og:description", content: "Continue your BOW community impact journey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const login = useServerFn(loginServerFn);
  const [email, setEmail] = useState("hello@bow.org");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login({
        data: { email, password },
      });

      if (!result.ok || !result.user) {
        setError(result.message ?? "Unable to log in.");
        return;
      }

      const items: Array<[string, string | undefined]> = [
        ["bow-user-email", result.user.email],
        ["bow-user-name", result.user.name],
        ["bow-user-role", result.user.role ?? "Volunteer"],
        ["bow-user-id", result.user.id],
        ["bow-user-phone", result.user.phone],
        ["bow-user-city", result.user.city],
      ];
      for (const [k, v] of items) {
        if (v) {
          window.localStorage.setItem(k, v);
          window.sessionStorage.setItem(k, v);
        }
      }


      navigate({ to: "/rescue" });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-[680px] place-items-center px-5 py-16">
      <BowCard className="w-full max-w-md p-7 sm:p-10">
        <BowLogo />
        <h1 className="mt-10 font-display text-4xl">Welcome back.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to access available rescue cases and community features.</p>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
          <label>
            <span className="field-label">Email Address</span>
            <Input
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="you@example.com"
              className="h-12 rounded-lg bg-background"
            />
          </label>
          <label>
            <span className="field-label">Password</span>
            <Input
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="••••••••"
              className="h-12 rounded-lg bg-background"
            />
          </label>
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 rounded-lg bg-bow-forest text-primary-foreground font-semibold hover:bg-bow-forest/90 cursor-pointer"
          >
            {loading ? "Signing in..." : "Log in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          New to BOW?{" "}
          <Link to="/signup" className="font-semibold text-bow-forest hover:underline">
            Create an account
          </Link>
        </p>
      </BowCard>
    </main>
  );
}

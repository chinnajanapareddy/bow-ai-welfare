import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BowLogo } from "../components/bow-ui";
import { WelcomeScreen } from "../components/bow-welcome";
import { FloatingPaws } from "../components/bow-pet-animations";
import { Button } from "../components/ui/button";
import { Menu, X } from "../components/bow-icons";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BOW — Every Street Soul Deserves a Second Chance" },
      {
        name: "description",
        content:
          "BOW turns compassion into coordinated action for street dogs through reporting, rescue, food support, community, and adoption.",
      },
      { name: "author", content: "BOW" },
      { property: "og:title", content: "BOW — Every Street Soul Deserves a Second Chance" },
      {
        property: "og:description",
        content: "Technology that turns compassion into meaningful action for every street soul.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <SiteChrome>
        <Outlet />
      </SiteChrome>
    </QueryClientProvider>
  );
}

function SiteChrome({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userSession, setUserSession] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    if (typeof window !== "undefined") {
      const email = window.localStorage.getItem("bow-user-email") || window.sessionStorage.getItem("bow-user-email");
      const name = window.localStorage.getItem("bow-user-name") || window.sessionStorage.getItem("bow-user-name");
      const role = window.localStorage.getItem("bow-user-role") || window.sessionStorage.getItem("bow-user-role");

      if (email && name) {
        setUserSession({
          name,
          email,
          role: role ?? "Community Member",
        });
      } else {
        setUserSession(null);
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      const keys = ["bow-user-email", "bow-user-name", "bow-user-role", "bow-user-id", "bow-user-phone", "bow-user-city"];
      for (const k of keys) {
        window.localStorage.removeItem(k);
        window.sessionStorage.removeItem(k);
      }
      setUserSession(null);
      window.location.href = "/login";
    }
  };


  const links = [
    ["About", "/about"],
    ["Report", "/report"],
    ["Rescue Feed", "/rescue"],
    ["My Reported Dogs", "/profile"],
    ["Adopt", "/adopt"],
    ["Community", "/community"],
    ["Donate", "/donate"],
  ] as const;

  return (
    <div className="min-h-screen bg-bow-ivory text-foreground">
      <WelcomeScreen />
      <header className="relative z-50 border-b border-border/70 bg-bow-ivory/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 sm:px-10">
          <BowLogo />
          <nav className="hidden items-center gap-7 lg:flex">
            {links.map(([label, href]) => (
              <Link
                key={href}
                to={href}
                className="story-link text-[0.72rem] font-medium text-muted-foreground"
                activeProps={{ className: "text-bow-forest font-semibold" }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            {userSession ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-lg bg-bow-sand/80 px-3 py-1.5 border border-border text-xs text-foreground hover:bg-bow-sand transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span className="font-semibold">{userSession.name}</span>
                  <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-bow-forest text-primary-foreground font-medium">
                    {userSession.role}
                  </span>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="h-9 rounded-lg px-3 text-xs cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="outline" className="h-10 rounded-lg px-4 text-xs">
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="h-10 rounded-lg bg-bow-forest px-4 text-xs text-primary-foreground hover:bg-bow-forest/90"
                >
                  <Link to="/signup">Join BOW</Link>
                </Button>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="rounded-lg lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-bow-paper px-5 py-5 lg:hidden">
            <nav className="grid gap-1">
              {links.map(([label, href]) => (
                <Link
                  key={href}
                  to={href}
                  className="rounded-lg px-3 py-3 text-sm text-foreground hover:bg-bow-sand"
                >
                  {label}
                </Link>
              ))}
              <div className="mt-4 pt-3 border-t border-border">
                {userSession ? (
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between text-xs px-2 py-1">
                      <span className="font-semibold">{userSession.name}</span>
                      <span className="text-[0.65rem] px-2 py-0.5 rounded bg-bow-forest text-primary-foreground">
                        {userSession.role}
                      </span>
                    </div>
                    <Button asChild variant="outline" className="w-full justify-start text-xs">
                      <Link to="/profile">My Profile & Rescues</Link>
                    </Button>
                    <Button onClick={handleLogout} variant="ghost" className="w-full text-xs text-red-600 justify-start">
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" className="rounded-lg">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild className="rounded-lg bg-bow-forest text-primary-foreground">
                      <Link to="/signup">Join BOW</Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
      {children}
      <Footer />
    </div>
  );
}

function SearchIcon() {
  return <span className="text-sm">⌕</span>;
}

function Footer() {
  return (
    <footer className="relative border-t border-border bg-bow-paper px-5 py-12 sm:px-10">
      <FloatingPaws />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr]">
        <div>
          <BowLogo />
          <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">
            Technology that turns compassion into meaningful action.
          </p>
        </div>
        <FooterLinks
          title="Explore"
          items={[
            ["Home", "/"],
            ["About", "/about"],
            ["Report", "/report"],
            ["Rescue", "/rescue"],
          ]}
        />
        <FooterLinks
          title="Community"
          items={[
            ["Adopt", "/adopt"],
            ["Stories", "/community"],
            ["Donate", "/donate"],
            ["Profile", "/profile"],
          ]}
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">Support</p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            FAQs
            <br />
            Contact
            <br />
            Volunteer
            <br />
            Partner with BOW
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em]">Stay updated</p>
          <p className="mt-4 text-sm text-muted-foreground">Stories, impact and ways to help.</p>
          <div className="mt-4 flex gap-2">
            <input
              aria-label="Email address"
              placeholder="Your email address"
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs"
            />
            <Button size="sm" className="rounded-lg bg-bow-forest text-primary-foreground">
              Join
            </Button>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 BOW. For every street soul.</span>
        <span className="font-display text-xl italic text-bow-brown">
          Same streets, brighter tomorrows ♡
        </span>
      </div>
    </footer>
  );
}
function FooterLinks({
  title,
  items,
}: {
  title: string;
  items: readonly (readonly [string, string])[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em]">{title}</p>
      <div className="mt-4 grid gap-2">
        {items.map(([label, href]) => (
          <Link
            key={href}
            to={href}
            className="text-sm text-muted-foreground hover:text-bow-forest"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

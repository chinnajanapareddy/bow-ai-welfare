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
import { Activity, Bone, CircleHelp, Heart, Menu, PawPrint, ShieldAlert, Users, X } from "lucide-react";

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
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
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


  const navItems = [
    { label: "About", href: "/about", icon: CircleHelp },
    { label: "Report", href: "/report", icon: ShieldAlert, alert: true },
    { label: "Rescue Feed", href: "/rescue", icon: Activity },
    { label: "My Reported Dogs", href: "/profile", icon: PawPrint },
    { label: "Adopt", href: "/adopt", icon: Heart },
    { label: "Community", href: "/community", icon: Users },
    { label: "Donate", href: "/donate", icon: Bone },
  ];

  return (
    <div className="min-h-screen bg-bow-ivory text-foreground">
      <WelcomeScreen />
      <header className="sticky top-0 z-50 border-b border-bow-brown/15 bg-bow-ivory/95 backdrop-blur-md shadow-2xs transition-all duration-300">
        <div className="mx-auto flex h-[80px] max-w-[1400px] items-center justify-between px-4 sm:px-8">
          <BowLogo />
          <nav className="hidden items-center gap-1.5 lg:flex bg-bow-sand/50 p-1.5 rounded-full border border-bow-brown/15 shadow-2xs">
            {navItems.map(({ label, href, icon: Icon, alert }) => (
              <Link
                key={href}
                to={href}
                className="group relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-muted-foreground transition-all duration-300 hover:text-bow-forest hover:bg-bow-sand hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                activeProps={{
                  className:
                    "bg-bow-forest text-primary-foreground font-bold shadow-xs hover:text-primary-foreground hover:bg-bow-forest scale-105 transition-all duration-300",
                }}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-125 ${
                        isActive ? "text-amber-300 animate-pulse" : "text-bow-brown group-hover:text-bow-forest"
                      }`}
                    />
                    <span>{label}</span>
                    {alert && !isActive && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                    )}
                    {isActive && (
                      <span className="ml-0.5 text-[0.68rem] animate-bounce">🐾</span>
                    )}
                  </>
                )}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            {userSession ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full bg-bow-sand/90 px-3.5 py-1.5 border border-bow-brown/20 text-xs text-foreground hover:bg-bow-sand transition-all hover:scale-102 cursor-pointer shadow-2xs"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-bow-forest">{userSession.name}</span>
                  <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-bow-forest text-primary-foreground font-semibold">
                    {userSession.role}
                  </span>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="h-9 rounded-full px-4 text-xs cursor-pointer text-muted-foreground hover:text-foreground hover:bg-red-50 hover:border-red-200 transition-all"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="outline" className="h-9 rounded-full px-4 text-xs font-semibold hover:border-bow-forest/40 hover:bg-bow-sand/60 transition-all hover:scale-102">
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="h-9 rounded-full bg-bow-forest px-5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-bow-forest/90 hover:scale-105 active:scale-95 transition-all"
                >
                  <Link to="/signup" className="flex items-center gap-1">
                    <span>Join BOW</span>
                    <span className="text-amber-300">🐾</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="rounded-full lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-bow-paper/95 backdrop-blur-lg px-5 py-5 lg:hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="grid gap-1.5">
              {navItems.map(({ label, href, icon: Icon, alert }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-foreground transition-all hover:bg-bow-sand cursor-pointer"
                  activeProps={{
                    className: "bg-bow-forest text-primary-foreground font-bold shadow-xs hover:bg-bow-forest hover:text-primary-foreground",
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? "text-amber-300" : "text-bow-brown"}`} />
                        <span>{label}</span>
                      </div>
                      {alert && !isActive && (
                        <span className="text-[0.65rem] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200">
                          Urgent Triage
                        </span>
                      )}
                      {isActive && (
                        <span className="text-sm animate-bounce">🐾</span>
                      )}
                    </>
                  )}
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
                    <Button asChild variant="outline" className="w-full justify-start text-xs rounded-xl">
                      <Link to="/profile">My Profile & Rescues</Link>
                    </Button>
                    <Button onClick={handleLogout} variant="ghost" className="w-full text-xs text-red-600 justify-start rounded-xl">
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild className="rounded-xl bg-bow-forest text-primary-foreground font-bold">
                      <Link to="/signup">Join BOW 🐾</Link>
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

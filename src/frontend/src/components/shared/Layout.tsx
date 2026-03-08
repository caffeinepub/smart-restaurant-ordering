import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import {
  ChefHat,
  LogIn,
  LogOut,
  Settings,
  UtensilsCrossed,
} from "lucide-react";
import type { ReactNode } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();

  const currentPath = location.pathname;

  const navLinks = [
    {
      path: "/",
      label: "Customer View",
      icon: UtensilsCrossed,
      ocid: "nav.customer_link",
    },
    {
      path: "/kitchen",
      label: "Kitchen",
      icon: ChefHat,
      ocid: "nav.kitchen_link",
    },
    { path: "/admin", label: "Admin", icon: Settings, ocid: "nav.admin_link" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground tracking-tight">
              TableServe
            </span>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon, ocid }) => (
              <Link
                key={path}
                to={path}
                data-ocid={ocid}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-ui font-medium transition-all
                  ${
                    isActive(path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile nav + Auth */}
          <div className="flex items-center gap-3">
            {/* Mobile nav */}
            <nav className="flex md:hidden items-center gap-1">
              {navLinks.map(({ path, icon: Icon, ocid }) => (
                <Link
                  key={path}
                  to={path}
                  data-ocid={ocid}
                  className={`
                    p-2 rounded-lg transition-all
                    ${
                      isActive(path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </nav>

            {/* Auth button */}
            {identity ? (
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                data-ocid="auth.logout_button"
                className="font-ui"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn || isInitializing}
                data-ocid="auth.login_button"
                className="font-ui"
              >
                <LogIn className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4 text-center">
        <p className="text-sm text-muted-foreground font-ui">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-primary">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

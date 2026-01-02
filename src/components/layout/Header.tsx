import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NetworkBadge } from "@/components/wallet/NetworkBadge";
import { Menu, X, Wallet, BookOpen } from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/deposit", label: "Deposit" },
  { path: "/withdraw", label: "Withdraw" },
  { path: "/history", label: "History" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="to-chart-1 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary">
            <Wallet className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Forgetless</span>
        </Link>

        {!isLanding && (
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button variant={location.pathname === item.path ? "secondary" : "ghost"} size="sm">
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <NetworkBadge network="baseSepolia" className="hidden sm:flex" />
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
            <a href="https://docs.forgetless.wallet" target="_blank" rel="noopener noreferrer">
              <BookOpen className="h-4 w-4" />
            </a>
          </Button>
          {!isLanding && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && !isLanding && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container flex flex-col gap-2 py-4">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            <div className="mt-2 border-t border-border pt-2">
              <NetworkBadge network="baseSepolia" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
